import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	MOCKSERVER_ID,
	send_response,
	send_nack,
	redisFetchToServer,
	AGRI_BAP_MOCKSERVER_URL,
	redis,
	logger,
} from "../../../lib/utils";
import {
	ACTTION_KEY,
	ON_ACTION_KEY,
} from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { BILLING_DETAILS, SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const initiateInitController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { scenario, transactionId } = req.body;
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
		return intializeRequest(res, next, on_select, scenario);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string
) => {
	try {
		const {
			context,
			message: {
				order: { provider, fulfillments, quote },
			},
		} = transaction;
		let { payments, items } = transaction.message.order;
		const { id, type, stops } = fulfillments[0];
		const { id: parent_item_id, location_ids, ...item } = items[0];
		items = items.map(
			({ location_ids, ...items }: { location_ids: any }) => items
		);
		const timestamp = new Date().toISOString();

		let init
		if (context.domain === SERVICES_DOMAINS.AGRI_INPUT) {
			init = {
				context: {
					...context,
					timestamp,
					action: ACTTION_KEY.INIT,
					bap_id: MOCKSERVER_ID,
					bap_uri: AGRI_BAP_MOCKSERVER_URL,
					message_id: uuidv4(),
				},
				message: {
					order: {
						provider,
						items: items.map((itm: any) => (
							{
								...itm,
								quantity: {
									count: 2,
								},
							}
						)),
						billing: {
							name: BILLING_DETAILS.name,
							phone: BILLING_DETAILS.phone,
							address: {
								city: "Bengaluru",
								name: "SCO1, Avenue road",
								state: "Karnataka",
								country: "IND",
								building: "Wework",
								locality: "Shiv dham",
								area_code: "800007",
							},
							created_at: timestamp,
							updated_at: timestamp,
						},
						fulfillments: [
							{
								id,
								type,
								end: {
									person: {
										name: "Ramu",
									},
									contact: {
										phone: "9900000000",
									},
									location: {
										gps: "12.974002,77.613458",
										address: {
											city: "Bengaluru",
											name: "SCO1, Avenue road",
											state: "Karnataka",
											country: "IND",
											building: "Wework",
											locality: "Shiv dham",
											area_code: "560001",
										},
									},
								},
							},
						],
					},
				},
			};
		}
		else {
			init = {
				context: {
					...context,
					timestamp,
					action: ACTTION_KEY.INIT,
					bap_id: MOCKSERVER_ID,
					bap_uri: AGRI_BAP_MOCKSERVER_URL,
					message_id: uuidv4(),
				},
				message: {
					order: {
						provider: {
							...provider,
							locations: [
								{
									id: "L1"
								}
							]
						},
						items: [
							{
								id: items[0].id,
								category_ids: items[0].category_ids,
								location_ids: [
									"L1"
								],
								// quantity: {
								// 	selected: {
								// 		count: 100
								// 	}
								// }				
							}
						],
						billing: {
							name: BILLING_DETAILS.name,
							phone: BILLING_DETAILS.phone,
							email: BILLING_DETAILS.email,
							address: "22, Mahatma Gandhi Rd, Craig Park Layout, Ashok Nagar, Bengaluru, Karnataka 560001",
							state: {
								name: "Karnataka"
							},
							city: {
								name: "Bengaluru"
							},
							tax_id: "XXXXXXXXXXXXXXX"
						},
						fulfillments: [
							{
								id,
								// type,
								// end: {
								// 	person: {
								// 		name: "Ramu",
								// 	},
								// 	contact: {
								// 		phone: "9900000000",
								// 	},
								// 	location: {
								// 		gps: "12.974002,77.613458",
								// 		address: {
								// 			city: "Bengaluru",
								// 			name: "SCO1, Avenue road",
								// 			state: "Karnataka",
								// 			country: "IND",
								// 			building: "Wework",
								// 			locality: "Shiv dham",
								// 			area_code: "560001",
								// 		},
								// 	},
								// },
								stops: [{
									...stops[0],
									location: {
										...stops[0].location,
										address: "Farm 14 Near Village",
										city: {
											name: "Bengaluru"
										},
										country: {
											code: "IND"
										},
										area_code: "560001",
										state: {
											name: "Karnataka"
										}
									},
									contact: {
										phone: "9886098860"
									},
								}
								]
							},
						],
						payments,
						tags: [
							{
								"descriptor": {
									"code": "BUYER_ID"
								},
								"list": [
									{
										"descriptor": {
											"code": "BUYER_ID_CODE"
										},
										"value": "mandi_licence"
									},
									{
										"descriptor": {
											"code": "BUYER_ID_NO"
										},
										"value": "xxxxxxxxxxxxxxx"
									}
								]
							}
						]
					},
				},
			};
			switch (scenario) {
				case "bid-placement":
					init = {
						...init,
						message: {
							order: {
								...init.message.order,
								items: [{
									...init.message.order.items[0],
									quantity: {
										selected: {
											count: 100
										},
									},
									price:{
										"currency": "INR",
										"offered_value": "250.00"
								}
								}]
							}
						}
					}
					break;
				case "participation-fee":
					init = { ...init,
						message:{
							order:{
								...init.message.order,
								items: [{
									...init.message.order.items[0],
								}]
							}
						}
					 }
					break;
				default:
					init = {
						...init,
						message: {
							order: {
								...init.message.order,
								items: [{
									...init.message.order.items[0],
									quantity: {
										selected: {
											count: 100
										}
									},
									tags: [
										{
											descriptor: {
												code: "NEGOTIATION_BAP"
											},
											list: [
												{
													descriptor: {
														code: "items.price.value"
													},
													value: "270.00"
												}
											]
										}
									]
								}]
							}
						}
					}
			}

		}
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
