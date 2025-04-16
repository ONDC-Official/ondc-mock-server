import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	responseBuilder,
	send_nack,
	redisFetchFromServer,
	updateFulfillments,
	AGRI_EXAMPLES_PATH,
	quoteCreatorAgri,
	AGRI_OUTPUT_EXAMPLES_PATH,
	quoteCreatorAgriOutput,
	quoteCreatorNegotiationAgriOutput,
	redis,
	createAuthHeader,
	TransactionType,
	AGRI_BPP_MOCKSERVER_URL,
	MOCKSERVER_ID,
	logger,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import {
	PAYMENT_TYPE,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";
import axios, { AxiosError } from "axios";

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
		// const providersItems =
		// 	on_search?.message?.catalog["bpp/providers"][0]?.items;
		// req.body.providersItems = providersItems;


		
		if(req.body.context.domain===SERVICES_DOMAINS.AGRI_INPUT){
			const providersItems = on_search?.message?.catalog["bpp/providers"][0]?.items;
			req.body.providersItems = providersItems;
		}
		else{
			const providersItems = on_search?.message?.catalog?.providers;
			req.body.providersItems = providersItems;
		}


		const on_select = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SELECT,
			transaction_id
		);

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
		if(req.body.context.domain===SERVICES_DOMAINS.AGRI_INPUT)
			{
		return initConsultationController(req, res, next)
		}
		else{
		return	initAgriOutputController(req,res,next)
		}
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
			message: {
				order: { provider, items, billing, fulfillments, payments },
			},
		} = req.body;

		let file: any = fs.readFileSync(
			path.join(AGRI_EXAMPLES_PATH, "on_init/on_init.yaml")
		);
		const { locations, ...remainingProvider } = provider;

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT,
			"",
			"agri_input"
		);

		const response = YAML.parse(file.toString());

		const quoteData = quoteCreatorAgri(items, providersItems);
		const responseMessage = {
			order: {
				provider,
				locations,
				items,
				billing,
				fulfillments: updatedFulfillments,
				quote: quoteData,
				cancellation_terms: response?.value?.message?.order?.cancellation_terms,
				tags: [
					{
						code: "bpp_terms",
						list: [
							{
								code: "tax_number",
								value: "12EEEHG7876H2KJ",
							},
						],
					},
				],
				//UPDATE PAYMENT OBJECT WITH REFUNDABLE SECURITY
				payment: {
					type: "ON-FULFILLMENT",
					status: "NOT-PAID",
					"@ondc/org/settlement_basis": "delivery",
					"@ondc/org/settlement_window": "P7D",
					"@ondc/org/withholding_amount": "0.0",
					"@ondc/org/buyer_app_finder_fee_type": "percent",
					"@ondc/org/buyer_app_finder_fee_amount": "3",
				},
			},
		};
		delete req.body?.providersItems;
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_INIT
				: `/${ON_ACTION_KEY.ON_INIT}`
			}`,
			`${ON_ACTION_KEY.ON_INIT}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

const initAgriOutputController=(
	req: Request,
	res: Response,
	next: NextFunction
)=>{
	try {
		const {
			context,
			providersItems,
			message: {
				order: { provider, items, billing, fulfillments, payments },
			},
		} = req.body;

		let file: any = fs.readFileSync(
			path.join(AGRI_OUTPUT_EXAMPLES_PATH, "on_init/on_init.yaml")
		);
		const { locations, ...remainingProvider } = provider;

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT,
			"",
			"agri_output"
		);

		const response = YAML.parse(file.toString());
		
		let  quoteData = quoteCreatorAgriOutput(items, providersItems);
		let responseMessage = {
			order: {
				provider,
				locations,
				items,
				billing,
				fulfillments: updatedFulfillments,
				quote: quoteData,
				cancellation_terms: response?.value?.message?.order?.cancellation_terms,
				payments: [{
					...response?.value?.message?.order?.payments[0]
				}]
			},
		};
		delete req.body?.providersItems;
		const {scenario}=req.query
		switch(scenario){
			case "participation-fee":
				responseMessage={
					order:{
						...responseMessage.order,
						items:items.map(({ available_quantity, price,quantity, title, ...rest }: { available_quantity: any; price: number; quantity:any;title: string; [key: string]: any }) => ({
							...rest, 
						})),
						quote:{
							"breakup": [
									{
											"item": {
													"id": "I1"
											},
											"price": {
													"currency": "INR",
													"value": "5000.00"
											},
											"tags": [
													{
															"descriptor": {
																	"code": "TITLE"
															},
															"list": [
																	{
																			"descriptor": {
																					"code": "type"
																			},
																			"value": "earnest_money_deposit"
																	}
															]
													}
											],
											"title": "earnest_money_deposit"
									}
							],
							"price": {
									"currency": "INR",
									"value": "5000.00"
							},
							"ttl": "P1D"
					}
					}
				}
				break;
			case "bid-placement":
				quoteData=quoteCreatorAgriOutput(items,providersItems,scenario)
				responseMessage = {
					order: {
						provider,
						locations,
						items:items.map(({ available_quantity,  title, ...rest }: { available_quantity: any;  title: string; [key: string]: any }) => ({
							...rest, 
						})),
						billing,
						fulfillments: updatedFulfillments,
						quote: quoteData,
						cancellation_terms: response?.value?.message?.order?.cancellation_terms,
						payments: [{
							...response?.value?.message?.order?.payments[0],
							status:"NOT-PAID",
							params:{
								...response?.value?.message?.order?.payments[0].params,
								amount:"5000",
							}
						},{
							...response?.value?.message?.order?.payments[0],
							id:'PY2',
							status:"NOT-PAID",
							params:{
								...response?.value?.message?.order?.payments[0].params,
								amount:Number(quoteData.price.value)-5000,
							},
							type:"ON-FULFILLMENT",
							url:undefined
						}
					]
					},
				};
				break;
			default:
				quoteData=quoteCreatorNegotiationAgriOutput(items,providersItems)
				 responseMessage = {
					order: {
						provider,
						locations,
						items,
						billing,
						fulfillments: updatedFulfillments,
						quote: quoteData,
						cancellation_terms: response?.value?.message?.order?.cancellation_terms,
						payments: [{
							...response?.value?.message?.order?.payments[0],
							params:{
								...response?.value?.message?.order?.payments[0].params,
								amount:quoteData.price.value,
							}
						}]
					},
				};
				 delete responseMessage.order.cancellation_terms
				break;
		}

		if(scenario==="participation-fee"){
			 responseBuilder(
				res,
				next,
				context,
				responseMessage,
				`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_INIT
					: `/${ON_ACTION_KEY.ON_INIT}`
				}`,
				`${ON_ACTION_KEY.ON_INIT}`,
				"agri"
			);

			context.action="on_status"
			const onstatus={
				order:{
					...responseMessage.order,
					fulfillments:[{
						id:"F1"
					}],
					provider:{
						id:"P1"
					},
					locations:[{
						id:"L1"
					}],
					"quote": {
						"breakup": [
								{
										"item": {
												"id": "I1"
										},
										"price": {
												"currency": "INR",
												"value": "5000.00"
										},
										"tags": [
												{
														"descriptor": {
																"code": "TITLE"
														},
														"list": [
																{
																		"descriptor": {
																				"code": "type"
																		},
																		"value": "earnest_money_deposit"
																}
														]
												}
										],
										"title": "earnest_money_deposit"
								}
						],
						"price": {
								"currency": "INR",
								"value": "5000.00"
						},
						"ttl": "P1D"
				}
				}
			}
			onstatus.order.payments[0].status="PAID"
			return childOrderResponseBuilder(
				0,
				res,
				context,
				onstatus,
				`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				}`,
				"on_status"
			);

		}
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_INIT
				: `/${ON_ACTION_KEY.ON_INIT}`
			}`,
			`${ON_ACTION_KEY.ON_INIT}`,
			"agri"
		);
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
