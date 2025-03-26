import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	responseBuilder,
	send_nack,
	redisFetchFromServer,
	updateFulfillments,
	SUBSCRIPTION_EXAMPLES_PATH,
	quoteSubscription,
	SUBSCRIPTION_BPP_MOCKSERVER_URL,
	MOCKSERVER_ID,
	createAuthHeader,
	TransactionType,
	redis,
	logger,
	quoteCommon,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import axios from "axios";
import { AxiosError } from "axios";
import { SUBSCRIPTION_DOMAINS } from "../../../lib/utils/apiConstants";
import { dlopen } from "process";

export const initController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transaction_id } = req.body.context;
		const { scenario } = req.query;
		const on_search = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SEARCH,
			transaction_id
		);
		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}
		const providersItems = on_search?.message?.catalog?.providers[0]?.items;
		req.body.providersItems = providersItems;

		const on_select = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SELECT,
			transaction_id
		);
		req.body.quote=on_select?.message?.order?.quote
		if (on_select && on_select?.error) {
			return send_nack(
				res,
				on_select?.error?.message
					? on_select?.error?.message
					: ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED
			);
		}

		if (!on_select) {
			return send_nack(res, ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED);
		}

		return initConsultationController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

const initConsultationController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			providersItems,
			quote,
			message: {
				order: { provider, items, billing, fulfillments, payments },
			},
		} = req.body;
		const initItems=req.body.message.order.items
		const { scenario } = req.query;

		let file: any;
		const { locations, ...remainingProvider } = provider;

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT,
			"",
			"subscription"
		);

		let quoteData = (context.domain===SUBSCRIPTION_DOMAINS.PRINT_MEDIA) ? quoteSubscription(
			items,
			providersItems,
			"",
			fulfillments[0]
		):quote
		quoteData = req.body.quote ?req.body.quote :quoteData
		/*****HANDLE SCENARIOS OF INIT*****/
		switch (scenario) {
			case "subscription-with-manual-payments":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_init/on_init_manual.yaml")
				);
				break;
			case "subscription-with-eMandate":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_init/on_init_mandate.yaml")
				);
				break;
			case "subscription-with-full-payments":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_init/on_init_full.yaml")
				);
				break;
			case "single-order-offline-without-subscription":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_init/on_init_single.yaml")
				);
				quoteData = quoteSubscription(
					items,
					providersItems,
					"single-order",
					fulfillments[0]
				);
				break;
				case "single-order-online-without-subscription":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_init/on_init_full.yaml")
				);
				quoteData = quoteSubscription(
					items,
					providersItems,
					"single-order",
					fulfillments[0]
				);
				break;
			default:
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "on_init/on_init.yaml")
				);
		}
		const response = YAML.parse(file.toString());
		console.log("quoteeee",quoteData)
		let responseMessage: any = {
			order: {
				provider: remainingProvider,
				locations,
				items:initItems,
				billing,
				fulfillments: updatedFulfillments,
				quote:quoteData,

				//UPDATE PAYMENT OBJECT WITH REFUNDABLE SECURITY
				payments: [
					{
						...response?.value?.message?.order?.payments[0],
						params: {
							amount: (quoteData?.price?.value).toString(),
							currency: "INR",
						},
						tags:[
							// {
							// 	"descriptor": {
							// 			"code": "PAYMENT_METHOD",
							// 			"name": "Payment Method"
							// 	},
							// 	"list": [
							// 			{
							// 					"descriptor": {
							// 							"code": "MODE"
							// 					},
							// 					"value": "FULL_PAYMENT"
							// 			}
							// 	]
						...response?.value?.message?.order?.payments[0].tags,
				// 	{
				// 		"descriptor": {
				// 				"code": "SETTLEMENT_DETAILS"
				// 		},
				// 		"list": [
				// 				{
				// 						"descriptor": {
				// 								"code": "COUNTERPARTY"
				// 						},
				// 						"value": "BPP"
				// 				},
				// 				{
				// 						"descriptor": {
				// 								"code": "MODE"
				// 						},
				// 						"value": "UPI"
				// 				},
				// 				{
				// 						"descriptor": {
				// 								"code": "BENEFICIARY_NAME"
				// 						},
				// 						"value": "xxxxx"
				// 				},
				// 				{
				// 						"descriptor": {
				// 								"code": "BANK_ACCOUNT_NO"
				// 						},
				// 						"value": "xxxxx"
				// 				},
				// 				{
				// 						"descriptor": {
				// 								"code": "IFSC_CODE"
				// 						},
				// 						"value": "xxxxxxx"
				// 				},
				// 				{
				// 						"descriptor": {
				// 								"code": "UPI_ADDRESS"
				// 						},
				// 						"value": "xxxxxxx"
				// 				}
				// 		]
				// },
			]
					},
				],
			},
		};

		delete req.body?.providersItems;
		if(context.domain===SUBSCRIPTION_DOMAINS.AUDIO_VIDEO){
			responseMessage.order.fulfillments=[{id:"FI1",type:"ONLINE"}]
			delete responseMessage.order.locations
		}

		if(scenario === 'single-order-offline-without-subscription'){
			delete responseMessage.order.items[0].tags ; delete responseMessage.order.items[0].price;
			delete responseMessage.order.items[0].title;
		 responseMessage.order.fulfillments[0].tags = [
				{
						"descriptor": {
								"code": "INFO"
						},
						"list": [
								{
										"descriptor": {
												"code": "PARENT_ID"
										},
										"value": "F1"
								}
						]
				}
		] ;
			delete responseMessage.order.fulfillments[0].stops[0].location 
			responseMessage.order.fulfillments[0].stops[0].time={
				...responseMessage.order.fulfillments[0].stops[0].time,
				days:"4"
			}
		}
		console.log("onintttscenarrio",scenario)
		if(scenario === 'subscription-with-full-payments'){
			delete responseMessage.order.items[0].price
			delete responseMessage.order.items[0].tags
			delete responseMessage.order.items[0].title
		}

		console.log('onnnnniniiiiiiit',JSON.stringify(responseMessage))

		responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_INIT
					: `/${ON_ACTION_KEY.ON_INIT}`
			}`,
			`${ON_ACTION_KEY.ON_INIT}`,
			"subscription"
		);

		// if(responseMessage.order.payments[0])

		if(scenario === "subscription-with-eMandate"){
			(responseMessage.order.payments = [
				{
					...responseMessage.order.payments[0],
					status: "PAID",
				},
			]),
				console.log("responseMessage...........", responseMessage);
			onStatusResponseBuilder(
				res,
				context,
				responseMessage,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				}`
			);
		}
		
	} catch (error) {
		next(error);
	}
};

export const onStatusResponseBuilder = async (
	res: Response,
	reqContext: object,
	message: object,
	uri: string,
	error?: object | undefined,
	id: number = 0
) => {
	let action = "on_status";
	let ts = new Date();
	const sandboxMode = res.getHeader("mode") === "sandbox";

	var async: { message: object; context?: object; error?: object } = {
		context: {},
		message,
	};
	const bppURI = SUBSCRIPTION_BPP_MOCKSERVER_URL;

	async = {
		...async,
		context: {
			...reqContext,
			bpp_id: MOCKSERVER_ID,
			bpp_uri: bppURI,
			timestamp: ts.toISOString(),
			action,
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

		// await redis.set(
		//   `${(async.context! as any).transaction_id}-${action}-from-server`,
		//   JSON.stringify(log)
		// );

		try {
			const response = await axios.post(uri, async, {
				headers: {
					authorization: header,
				},
			});

			log.response = {
				timestamp: new Date().toISOString(),
				response: response.data,
			};

			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server-${id}-${ts.toISOString()}`, // saving ID with on_confirm child process (duplicate keys are not allowed)
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
			// throw error;
		}

		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});

		console.log("Subscription Child Process: ", {
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

		console.log(`Subscription On status Child Process : `, {
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