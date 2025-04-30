import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";
import {
	MOCKSERVER_ID,
	send_response,
	AGRI_EXAMPLES_PATH,
	AGRI_BAP_MOCKSERVER_URL,
	logger,
	redis,
	AGRI_OUTPUT_EXAMPLES_PATH,
} from "../../../lib/utils";
import { ACTTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const initiateSearchController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { bpp_uri, city, domain } = req.body;
		const { scenario } = req.query
		let onSearch, file;
		switch (domain) {
			case SERVICES_DOMAINS.AGRI_INPUT:
				file = fs.readFileSync(
					path.join(AGRI_EXAMPLES_PATH, "search/search.yaml")
				);
				break;
			case SERVICES_DOMAINS.AGRI_OUTPUT:

				file = fs.readFileSync(
					path.join(AGRI_OUTPUT_EXAMPLES_PATH, "search/search_by_category.yaml")
				);
				break;
			default:
				file = fs.readFileSync(
					path.join(AGRI_EXAMPLES_PATH, "search/search.yaml")
				);
				break;
		}
		let search = YAML.parse(file.toString());
		search = search.value;
		const transaction_id = uuidv4();
		const timestamp = new Date().toISOString();




		search = {
			...search,
			context: {
				...search.context,
				timestamp,
				transaction_id,
				domain,
				bap_id: MOCKSERVER_ID,
				bap_uri: AGRI_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
		};
		switch (scenario) {
			case "interval-pull":
				search = {
					...search
					, message: {
						intent: {
							payment: search.message.intent.payment,
							tags: [
								{
									"code": "catalog_inc",
									"list": [
										{
											"code": "start_time",
											"value": "2024-03-15T08:38:36.933Z"
										},
										{
											"code": "end_time",
											"value": "2024-03-15T08:46:31.068Z"
										}
									]
								},
								...search.message.intent.tags
							],
						}
					}
				}
				break;
			case "start":
				search = {
					...search
					, message: {
						intent: {
							payment: search.message.intent.payment,
							tags: [
								{
									"code": "CATALOG_INC",
									"list": [
										{
											"descriptor": {
												"code": "MODE"
											},
											"value": "start"
										}
									]
								},
								...search.message.intent.tags
							],
						}
					}
				}
				break;
				case "stop":
				search = {
					...search
					, message: {
						intent: {
							payment: search.message.intent.payment,
							tags: [
								{
									"code": "CATALOG_INC",
									"list": [
										{
											"descriptor": {
												"code": "MODE"
											},
											"value": "stop"
										}
									]
								},
								...search.message.intent.tags
							],
						}
					}
				}
				break;
			default:
				search = { ...search }
				break;
		}
		search.bpp_uri = bpp_uri;
		await send_response(res, next, search, transaction_id, ACTTION_KEY.SEARCH, scenario);
	} catch (error) {
		return next(error);
	}
};
