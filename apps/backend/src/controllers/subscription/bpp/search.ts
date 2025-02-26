import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	responseBuilder,
	SUBSCRIPTION_AUDIO_VIDEO_EXAMPLES_PATH,
	SUBSCRIPTION_EXAMPLES_PATH,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import {
	PRINT_MEDIA_CATEGORIES,
	SUBSCRIPTION_DOMAINS,
} from "../../../lib/utils/apiConstants";

export const searchController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const domain = req.body.context.domain;
		let file;
		const {
			message: { intent },
		} = req.body;
		const category = req?.body?.message?.intent?.category?.id;
		if (category) {
			switch (category) {
				case PRINT_MEDIA_CATEGORIES.NEWSPAPER:
					file = fs.readFileSync(
						path.join(
							SUBSCRIPTION_EXAMPLES_PATH,
							"on_search/on_search_newspaper.yaml"
						)
					);
					break;
				default:
					file = fs.readFileSync(
						path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_search/on_search.yaml")
					);
					break;
			}
		}
		else {
			switch (domain) {
				case SUBSCRIPTION_DOMAINS.AUDIO_VIDEO:
					file = fs.readFileSync(
						path.join(
							SUBSCRIPTION_AUDIO_VIDEO_EXAMPLES_PATH,
							"on_search/on_search.yaml"
						)
					);
					break;
				default:
					file = fs.readFileSync(
						path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_search/on_search.yaml")
					);
					break;
			}
		}
const response = YAML.parse(file.toString());
// for (let i = 0; i < 8; i++) {
// 	setTimeout(() => {
// 		console.log(
// 			`This is operation ${i + 1} performed after ${i + 1} minute(s)`
// 		);
// 		return responseBuilder(
// 			res,
// 			next,
// 			req.body.context,
// 			response.value.message,
// 			`${req.body.context.bap_uri}${
// 				req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
// 			}`,
// 			`${ON_ACTION_KEY.ON_SEARCH}`,
// 			"subscription"
// 		);
// 		// Additional operations like logging, updating a database, etc.
// 	}, i * 30000); // i * 60000 ms delay for each iteration
// }
return responseBuilder(
	res,
	next,
	req.body.context,
	response.value.message,
	`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
	}`,
	`${ON_ACTION_KEY.ON_SEARCH}`,
	"subscription"
);
	} catch (error) {
	return next(error);
}
};
