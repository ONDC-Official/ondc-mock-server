import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import YAML from "yaml";
import {
	MOCKSERVER_ID,
	send_response,
	send_nack,
	redisFetchToServer,
	SUBSCRIPTION_BAP_MOCKSERVER_URL,
	SUBSCRIPTION_EXAMPLES_PATH,
	quoteSubscription,
	redisFetchFromServer,
	SUBSCRIPTION_AUDIO_VIDEO_EXAMPLES_PATH,
} from "../../../lib/utils";
import {
	ACTTION_KEY,
	ON_ACTION_KEY,
} from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { BILLING_DETAILS, SUBSCRIPTION_DOMAINS } from "../../../lib/utils/apiConstants";
import path from "path";
import { count } from "console";

export const initiateInitController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;
		const {scenario} = req.query;
		const on_search = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SEARCH,
			transactionId
		);
		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}
		const providersItems = on_search?.message?.catalog?.providers[0]?.items;
		req.body.providersItems = providersItems;

		const on_select = await redisFetchToServer(
			ON_ACTION_KEY.ON_SELECT,
			transactionId
		);
		if (!on_select) {
			return send_nack(res, ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED);
		}
		if (Object.keys(on_select).includes("error")) {
			return send_nack(res, ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED);
		}
		on_select.providersItems = providersItems;
		return intializeRequest(res, next, on_select, scenario);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: any
) => {
	try {
		const {
			context,
			message: {
				order: { provider, fulfillments, quote },
			},
			providersItems,
		} = transaction;
		let { payments, items } = transaction.message.order;
		const { id, type, stops } = fulfillments[0];
		const { id: parent_item_id, location_ids, ...item } = items[0];
		console.log("items=====>",JSON.stringify(items))
		items = items.map(
			({ location_ids, ...items }: { location_ids: any }) => items
		);

		let init;
		if(context.domain===SUBSCRIPTION_DOMAINS.PRINT_MEDIA){

		let quoteData: any = transaction?.message?.order?.quote?transaction?.message?.order?.quote:quoteSubscription(
			items,
			providersItems,
			"",
			fulfillments[0]
		);

		let file: any;
		/*****HANDLE SCENARIOS OF INIT*****/
		switch (scenario) {
			case "subscription-with-manual-payments":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "init/init_manual.yaml")
				);
				break;
			case "subscription-with-eMandate":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "init/init_mandate.yaml")
				);
				break;
			case "subscription-with-full-payments":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "init/init_full.yaml")
				);
				break;

			case "single-order-offline-without-subscription":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "init/init_single.yaml")
				);
				break;
			case "single-order-online-without-subscription":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "init/init.yaml")
				);
				break;
			default:
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "init/init.yaml")
				);
		}

		const response = YAML.parse(file.toString());

		init = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.INIT,
				bap_id: MOCKSERVER_ID,
				bap_uri: SUBSCRIPTION_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					provider: {
						...provider,
						locations: [{ id: uuidv4() }],
					},
					items,
					billing: BILLING_DETAILS,
					fulfillments,
					payments: [
						{
							...response?.value?.message?.order?.payments[0],
							params: {
								amount: (quoteData?.price?.value).toString(),
								currency: "INR",
							},
						},
					],
				},
			},
		};

		if(scenario === 'single-order-offline-without-subscription' || scenario ==="single-order-online-without-subscription"){
			init.message.order.items[0].quantity={
				selected:{
					count:1
				}
			}
			delete init.message.order.items[0].tags ; delete init.message.order.items[0]?.price ; delete init.message.order.items[0]?.title
			delete init.message.order.payments[0].params
			init.message.order.fulfillments[0].stops[0]={
				...init.message.order.fulfillments[0].stops[0],
				location:{
					"address": "My House #, My buildin",
					"area_code": "560001",
					"city": {
							"name": "Bengaluru"
					},
					"country": {
							"code": "IND"
					},
					"gps": "12.974002,77.613458",
					"state": {
							"name": "Karnataka"
					}
			},
			contact:{
				"phone": "9886098860"
			}
			}
			delete init.message.order.fulfillments[0].tags
			delete init.message.order.provider.locations
		}

	}
	else	{
		let file = fs.readFileSync(
					path.join(SUBSCRIPTION_AUDIO_VIDEO_EXAMPLES_PATH, "init/init.yaml")
				);
		const response = YAML.parse(file.toString());
		init = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.INIT,
				bap_id: MOCKSERVER_ID,
				bap_uri: SUBSCRIPTION_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					provider: {
						...provider,
					},
					items:[{...items[0],quantity:{
						selected:{
							count:1
						}
					}}],
					billing: BILLING_DETAILS,
					// fulfillments,
					// quote,
					payments: [
						{
							...response?.value?.message?.order?.payments[0],
						},
					],
				},
			},
		};
		}


		console.log("inittttttitititi",JSON.stringify(init))

		await send_response(
			res,
			next,
			init,
			context.transaction_id,
			ACTTION_KEY.INIT,
			(scenario = scenario)
		);
	} catch (error) {
		next(error);
	}
};
