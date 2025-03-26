import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	AGRI_BPP_MOCKSERVER_URL,
	AGRI_EXAMPLES_PATH,
	AGRI_OUTPUT_EXAMPLES_PATH,
	createAuthHeader,
	logger,
	MOCKSERVER_ID,
	quoteCreatorAgriOutput,
	quoteCreatorHealthCareService,
	quoteCreatorService,
	redis,
	redisFetchToServer,
	responseBuilder,
	send_nack,
	TransactionType,
	updateFulfillments,
} from "../../../lib/utils";
import fs from "fs";
import YAML from "yaml";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import {
	FULFILLMENT_LABELS,
	FULFILLMENT_STATES,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";
import path, { resolve } from "path";
import axios, { AxiosError } from "axios";

export const updateController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let { scenario } = req.query;
		scenario = scenario ? scenario : "reject"

		const on_confirm = await redisFetchToServer(
			ON_ACTION_KEY.ON_CONFIRM,
			req.body.context.transaction_id
		);
		if (!on_confirm) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}

		const on_search = await redisFetchToServer(
			ON_ACTION_KEY.ON_SEARCH,
			req.body.context.transaction_id
		);

		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}

		if(req.body.context.domain===SERVICES_DOMAINS.AGRI_INPUT){
			const providersItems = on_search?.message?.catalog["bpp/providers"][0]?.items;
			req.body.providersItems = providersItems;
		}
		else{
			const providersItems = on_search?.message?.catalog?.providers;
			req.body.providersItems = providersItems;
		}

		//UPDATE FULFILLMENTS HERE BECAUSE It IS SAME FOR ALL SACENRIOS
		const updatedFulfillments = updateFulfillments(
			req?.body?.message?.order?.fulfillments,
			ON_ACTION_KEY?.ON_UPDATE
		);
		req.body.message.order.fulfillments = updatedFulfillments;
		req.body.on_confirm = on_confirm;
		console.log("scenario", scenario)
		switch (scenario) {
			case "liquidate":
				updateliquidateController(req, res, next);
				break;
			case "reject":
				updateRejectController(req, res, next);
				break;
			case "re-negotiate":
				updaterenogtiateController(req, res, next);
				break;
			case "increase-bids-price":
				updateincreasebidController(req, res, next);
				break;
			default:
				updateRequoteController(req, res, next);
				break;
		}
	} catch (error) {
		return next(error);
	}
};

//HANDLE PAYMENTS TARGET
export const updateRequoteController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
		const file = fs.readFileSync(
			path.join(
				AGRI_EXAMPLES_PATH,
				"on_update/on_update_status.yaml"
			)
		);
		const response = YAML.parse(file.toString());

		const responseMessages = {
			order: {
				...response.value.message.order
			},
		};
		console.log("responseatUpdateBpp", JSON.stringify(responseMessages))
		return responseBuilder(
			res,
			next,
			context,
			responseMessages,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_UPDATE
				: `/${ON_ACTION_KEY.ON_UPDATE}`
			}`,
			`${ON_ACTION_KEY.ON_UPDATE}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

//HANDLE UPDATE PAYMENTS AFTER ITEMS UPDATE
export const updateRejectController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
		const file = fs.readFileSync(
			path.join(
				AGRI_EXAMPLES_PATH,
				"on_update/on_update_return_initiated_seller_reject.yaml"
			)
		);
		const response = YAML.parse(file.toString());
		console.log("on_confirmmm", on_confirm)
		const responseMessages = {
			order: {
				...response.value.message.order,
			},
		};
		console.log("responseatUpdateBpp", JSON.stringify(responseMessages))
		return responseBuilder(
			res,
			next,
			context,
			responseMessages,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_UPDATE
				: `/${ON_ACTION_KEY.ON_UPDATE}`
			}`,
			`${ON_ACTION_KEY.ON_UPDATE}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

export const updateliquidateController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
		const file = fs.readFileSync(
			path.join(
				AGRI_EXAMPLES_PATH,
				"on_update/on_update_return_initiated_seller_liquidates.yaml"
			)
		);
		const response = YAML.parse(file.toString());

		const responseMessages = {
			order: {
				...response.value.message.order
			},
		};
		console.log("responseatUpdateBpp", JSON.stringify(responseMessages))
		return responseBuilder(
			res,
			next,
			context,
			responseMessages,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_UPDATE
				: `/${ON_ACTION_KEY.ON_UPDATE}`
			}`,
			`${ON_ACTION_KEY.ON_UPDATE}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}

};

export const updaterenogtiateController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
		const file = fs.readFileSync(
			path.join(
				AGRI_OUTPUT_EXAMPLES_PATH,
				"on_update/on_update_requote.yaml"
			)
		);
		const response = YAML.parse(file.toString());

		const responseMessages = {
			order: {
				...response.value.message.order
			},
		};
		console.log("responseatUpdateBpp", JSON.stringify(responseMessages))
		return responseBuilder(
			res,
			next,
			context,
			responseMessages,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_UPDATE
				: `/${ON_ACTION_KEY.ON_UPDATE}`
			}`,
			`${ON_ACTION_KEY.ON_UPDATE}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}

};

export const updateincreasebidController=(
	req: Request,
	res: Response,
	next: NextFunction
)=>{
	try{
	const { context, message, on_confirm,providersItems } = req.body;
	//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
	const file = fs.readFileSync(
		path.join(
			AGRI_OUTPUT_EXAMPLES_PATH,
			"on_update/on_update_requote_lower.yaml"
		)
	);
	const response = YAML.parse(file.toString());
	const items=[{...response.value.message.order.items[0],
		price:{
			currency:"INR",
			offered_value:message.order.items[0].offered_value||"300",
	}}]

	const responseMessages = {
		order: {
			...response.value.message.order,
			items,
			quote:quoteCreatorAgriOutput(on_confirm.message.order.items,providersItems)
		},
	};

	 responseBuilder(
		res,
		next,
		context,
		responseMessages,
		`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
			? ON_ACTION_KEY.ON_UPDATE
			: `/${ON_ACTION_KEY.ON_UPDATE}`
		}`,
		`${ON_ACTION_KEY.ON_UPDATE}`,
		"agri"
	);

	const onupdateAwarded={
		order:{
			...response.value.message.order,
			items,
			fulfillments:[{
				...on_confirm.message.order.fulfillments[0],
				state:{
					descriptor:{
						code:"Awarded"
					}
				}
			}],
			quote:quoteCreatorAgriOutput(on_confirm.message.order.items,providersItems)
		}
	}

	const onupdateNotAwarded={
		order:{
			...response.value.message.order,
			items,
			fulfillments:[{
				...on_confirm.message.order.fulfillments[0],
				state:{
					descriptor:{
						code:"Not Awarded"
					}
				}
			}],
			quote:quoteCreatorAgriOutput(on_confirm.message.order.items,providersItems)
		}
	}

	let aray=[onupdateAwarded,onupdateNotAwarded]
	let i=0;
	async function sendpayload(i = 0) {
		// Base case: Stop recursion if `i` exceeds the array length
		if (i >= aray.length) {
			return;
		}
	
		// Send the payload
		await childOrderResponseBuilder(
			0, // Update this argument if necessary
			res,
			context,
			aray[i],
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_update" : "/on_update"}`,
			"on_update"
		);
	
		// Wait for 1 second before sending the next payload
		await new Promise((resolve) => setTimeout(resolve, 10000));
	
		// Recursive call for the next payload
		await sendpayload(i + 1);
	}

	sendpayload().catch((err)=>{console.error("Error sending payloads:", err)})
} catch (error) {
	next(error);
}

}

export const childOrderResponseBuilder = async (
	id: number,
	res: Response,
	reqContext: object,
	message: object,
	uri: string,
	action: string,
	error?: object | undefined
) => {
	let ts = new Date();

	const sandboxMode = res.getHeader("mode") === "sandbox";

	let async: { message: object; context?: object; error?: object } = {
		context: {},
		message,
	};
	const bppURI = AGRI_BPP_MOCKSERVER_URL;
	async = {
		...async,
		context: {
			...reqContext,
			bpp_id: MOCKSERVER_ID,
			bpp_uri: bppURI,
			timestamp: ts.toISOString(),
			action: action,
		},
	};

	if (error) {
		async = { ...async, error };
	}

	const header = await createAuthHeader(async);
	if (sandboxMode) {
		var log: TransactionType = {
			request: async,
		};
		console.log("urI sent at on_status", uri)
		try {
			const response = await axios.post(uri + "?mode=mock", async,
				// 	{
				// 	headers: {
				// 		authorization: header,
				// 	},
				// }
			);

			log.response = {
				timestamp: new Date().toISOString(),
				response: response.data,
			};

			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server-${id}-${ts.toISOString()}`, // saving ID with on_status child process (duplicate keys are not allowed)
				JSON.stringify(log)
			);
		} catch (error) {
			const response =
				error instanceof AxiosError
					? error?.response?.data
					: {
						message: {
							ack: {
								status: "NACK",
							},
						},
						error: {
							message: error,
						},
					};
			log.response = {
				timestamp: new Date().toISOString(),
				response: response,
			};
			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server-${id}-${ts.toISOString()}`,
				JSON.stringify(log)
			);

			if (error instanceof AxiosError && id === 0 && action === "on_status") {
				res.status(error.status || 500).json(error);
			}

			if (error instanceof AxiosError) {
				console.log(error.response?.data);
			}

			throw error;
		}

		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});

		console.log(`Subscription Child Process (action: ${action}) ${id} : `, {
			message: {
				ack: {
					status: "ACK",
				},
			},
		});
		return;
	} else {
		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});

		console.log(`Subscription Child Process (action: ${action}) ${id} : `, {
			sync: {
				message: {
					ack: {
						status: "ACK",
					},
				},
			},
			async,
		});
		return;
	}
};