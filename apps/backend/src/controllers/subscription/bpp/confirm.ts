import { NextFunction, Request, Response } from "express";
import {
	createAuthHeader,
	logger,
	MOCKSERVER_ID,
	redis,
	redisFetchFromServer,
	responseBuilder,
	send_nack,
	Stop,
	SUBSCRIPTION_BPP_MOCKSERVER_URL,
	TransactionType,
	updateFulfillments,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ORDER_STATUS, PAYMENT_STATUS, SUBSCRIPTION_DOMAINS } from "../../../lib/utils/apiConstants";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { getRangeUsingDurationFrequency } from "../../../lib/utils/getISODuration";

export const confirmController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		confirmConsultationController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

export const confirmConsultationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			message: { order },
		} = req.body;

		const { scenario } = req.query;
		const on_init = await redisFetchFromServer(
			ON_ACTION_KEY.ON_INIT,
			context?.transaction_id
		);

		if (on_init && on_init?.error) {
			return send_nack(
				res,
				on_init?.error?.message
					? on_init?.error?.message
					: ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED
			);
		}

		if (!on_init) {
			return send_nack(res, ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED);
		}

		const { fulfillments } = order;

		const responseMessage = {
			order: {
				...order,
				status: ORDER_STATUS.ACCEPTED,
				fulfillments:(context.domain===SUBSCRIPTION_DOMAINS.AUDIO_VIDEO)?[{...order.fulfillments[0],"tags": [
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
                    ]}]:order.fulfillments,
				provider: {
					...order.provider,
					rateable: true,
				},
				items:(context.domain===SUBSCRIPTION_DOMAINS.AUDIO_VIDEO)?[{...order.items[0],"tags": [
                        {
                            "descriptor": {
                                "code": "TNC_LINK",
                                "name": "Terms & Conditions",
                                "short_desc": "Terms and Conditions"
                            },
                            "value": "https://abc.com/tnc.html"
                        }
                    ]}]:order.items,
				quote:(context.domain===SUBSCRIPTION_DOMAINS.AUDIO_VIDEO)?{...order.quote,breakup:[order.quote.breakup[0]]} :order.quote,
				payments: [
					{
						...order?.payments[0],
						status: PAYMENT_STATUS.PAID,
					},
				],
			},
		};
		if(context.domain===SUBSCRIPTION_DOMAINS.AUDIO_VIDEO){
			
			return responseBuilder(
				res,
				next,
				context,
				responseMessage,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/")
						? ON_ACTION_KEY.ON_CONFIRM
						: `/${ON_ACTION_KEY.ON_CONFIRM}`
				}`,
				`${ON_ACTION_KEY.ON_CONFIRM}`,
				"subscription"
			);
		}
		else{
			

			responseMessage.order.cancellation_terms=[
				{
						"cancellation_fee": {
								"amount": {
										"currency": "INR",
										"value": "0.00"
								},
								"percentage": "0.00"
						},
						"fulfillment_state": {
								"descriptor": {
										"code": "PENDING",
										"short_desc": "002"
								}
						}
				}
		]
		responseMessage.order.items[0].tags=[
			{
					"descriptor": {
							"code": "RESCHEDULE_TERMS"
					},
					"list": [
							{
									"descriptor": {
											"code": "FULFILLMENT_STATE"
									},
									"value": "Pending"
							},
							{
									"descriptor": {
											"code": "RESCHEDULE_ELIGIBLE"
									},
									"value": "true"
							},
							{
									"descriptor": {
											"code": "RESCHEDULE_FEE"
									},
									"value": "0.00"
							},
							{
									"descriptor": {
											"code": "RESCHEDULE_WITHIN"
									},
									"value": "PT1D"
							}
					]
			},
			{
					"descriptor": {
							"code": "TNC_LINK",
							"name": "Terms & Conditions",
							"short_desc": "Terms and Conditions"
					},
					"value": "https://abc.com/tnc.html"
			}
	]
	responseMessage.order.payments[0].tags = responseMessage.order.payments[0].tags.filter(
		(tag:any, index:any) => index !==2)
		responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_CONFIRM
					: `/${ON_ACTION_KEY.ON_CONFIRM}`
			}`,
			`${ON_ACTION_KEY.ON_CONFIRM}`,
			"subscription"
		);

		if (
			scenario !== "single-order-offline-without-subscription" &&
			scenario !== "single-order-online-without-subscription"
		) {
			//get range for confirm calls
			const range = getRangeUsingDurationFrequency(
				fulfillments[0]?.stops[0]?.duration,
				fulfillments[0]?.stops[0]?.schedule?.frequency
			);

			/********************CHILD ORDER RESPONSE */
			let childOrderResponse = structuredClone({
				order: {
					...responseMessage.order,
					id: uuidv4(),
					ref_order_ids: [responseMessage.order.id],
				},
			});

			childOrderResponse.order.payments[0].id = "P2";
			childOrderResponse.order.payments[0].status = "NOT-PAID";
			delete childOrderResponse.order.payments[0].url;
			childOrderResponse.order.payments[0].tags = [
				{
					descriptor: {
						code: "SETTLEMENT_DETAILS",
					},
					list: [
						{
							descriptor: {
								code: "COUNTERPARTY",
							},
							value: "BAP",
						},
						{
							descriptor: {
								code: "MODE",
							},
							value: "UPI",
						},
						{
							descriptor: {
								code: "BENEFICIARY_NAME",
							},
							value: "xxxxx",
						},
						{
							descriptor: {
								code: "BANK_ACCOUNT_NO",
							},
							value: "xxxxx",
						},
						{
							descriptor: {
								code: "IFSC_CODE",
							},
							value: "xxxxxxx",
						},
						{
							descriptor: {
								code: "UPI_ADDRESS",
							},
							value: "xxxxxxx",
						},
					],
				},
				{
					descriptor: {
						code: "BUYER_FINDER_FEES",
					},
					display: false,
					list: [
						{
							descriptor: {
								code: "BUYER_FINDER_FEE_TYPE",
							},
							value: "percent",
						},
						{
							descriptor: {
								code: "BUYER_FINDER_FEE_AMOUNT",
							},
							value: "0",
						},
					],
				},
			];
			/********************CHILD ORDER RESPONSE */

			/**********ON UPDATE RESPONSE */
			let onUpdateOrderResponse = structuredClone({
				order: {
					...responseMessage.order,
					id: responseMessage.order.id,
					ref_order_ids: [childOrderResponse.order.id],
					status: "Active",
				},
			});
			/**********ON UPDATE RESPONSE */

			// let responseMessage1 = responseMessage;

			let responseMessage2 = structuredClone({
				order: {
					...responseMessage.order,
					id: responseMessage.order.id,
					ref_order_ids: [childOrderResponse.order.id],
					status: "In-Progress",
				},
			});

			responseMessage2.order.payments[0].id = "P2";
			responseMessage2.order.payments[0].status = "NOT-PAID";
			delete responseMessage2.order.payments[0].url;
			responseMessage2.order.payments[0].tags = [
				{
					descriptor: {
						code: "SETTLEMENT_DETAILS",
					},
					list: [
						{
							descriptor: {
								code: "COUNTERPARTY",
							},
							value: "BAP",
						},
						{
							descriptor: {
								code: "MODE",
							},
							value: "UPI",
						},
						{
							descriptor: {
								code: "BENEFICIARY_NAME",
							},
							value: "xxxxx",
						},
						{
							descriptor: {
								code: "BANK_ACCOUNT_NO",
							},
							value: "xxxxx",
						},
						{
							descriptor: {
								code: "IFSC_CODE",
							},
							value: "xxxxxxx",
						},
						{
							descriptor: {
								code: "UPI_ADDRESS",
							},
							value: "xxxxxxx",
						},
					],
				},
				{
					descriptor: {
						code: "BUYER_FINDER_FEES",
					},
					display: false,
					list: [
						{
							descriptor: {
								code: "BUYER_FINDER_FEE_TYPE",
							},
							value: "percent",
						},
						{
							descriptor: {
								code: "BUYER_FINDER_FEE_AMOUNT",
							},
							value: "0",
						},
					],
				},
			];



			let i = 1;
			let interval = setInterval(async () => {
				if (i >= 2) {
					clearInterval(interval);
				}
				childOrderResponseBuilder(
					i,
					res,
					context,
					childOrderResponse,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/")
							? "on_confirm"
							: "/on_confirm"
					}`,
					"on_confirm"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					onUpdateOrderResponse,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_update" : "/on_update"
					}`,
					"on_update"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					responseMessage2,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_update" : "/on_update"
					}`,
					"on_update"
				);
				i++;
			}, 1000);
		}}
	} catch (error) {
		next(error);
	}
};

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
	const bppURI = SUBSCRIPTION_BPP_MOCKSERVER_URL;
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

		try {
			const response = await axios.post(uri + "?mode=mock", async, {
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