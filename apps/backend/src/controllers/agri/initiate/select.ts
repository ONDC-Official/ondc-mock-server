import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	AGRI_BAP_MOCKSERVER_URL,
	checkIfCustomized,
	send_response,
	send_nack,
	redisFetchToServer,
	Item,
	logger,
	redis,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { set, eq } from "lodash";
import _ from "lodash";
import { count } from "console";

export const initiateSelectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;

		const on_search = await redisFetchToServer("on_search", transactionId);
		if (!on_search) {
			return send_nack(res, "On Search doesn't exist");
		}
		return intializeRequest(req, res, next, on_search);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any
) => {
	try {
		const { context, message } = transaction;
		const { scenario } = req.query
		const { transaction_id } = context;

		// console.log("items",items)
		let select = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: "select",
				bap_id: MOCKSERVER_ID,
				bap_uri: AGRI_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
				},
			},
		};
		console.log("message", JSON.stringify(message))
		if (context.domain === "ONDC:AGR10") {
			const providers = message?.catalog["bpp/providers"];
			const { id, locations } = providers?.[0];
			let items;
			select.message = {
				order: {
					provider: {
						id,
						locations: [
							{
								id: locations?.[0]?.id,
							},
						],
					},
					fulfillments: [
						{
							end: {
								location: {
									gps: "12.974002,77.613458",
									address: {
										area_code: "560001",
									},
								},
							},
						},
					],
					payment: { type: "ON-FULFILLMENT" },
				},

			}
			items = providers[0].items =
				providers?.[0]?.items.map(
					({
						id,
						location_id,
					}: {
						id: string;
						location_id: string[];
					}) => ({ id, location_id })
				)
			switch (scenario) {
				case "multi-items-successfull-order":
					select.message = {
						order: {
							...select.message.order,
							items: items.map((itm: any) => (
								{
									...itm,
									quantity: {
										count: 2
									}
								}
							))
						}
					}

					break;
				default:
					select.message = {
						order: {
							...select.message.order,
							items: [{
								...items[0],
								quantity: {
									count: 2
								}
							}]
						}
					}
					break;
			}
		}
		else {
			select = {
				...select,
				message: {
					order: {
						...message.order,
						provider: {
							id: message.catalog.providers[0].id,
							locations: [{
								id: message.catalog.providers[0].locations[0].id
							}]
						},
						items: message?.catalog?.providers[0].items.map((each: any) => (
							{
								id: each.id,
								location_ids: [each.location_ids[0]],
								category_ids: [each.category_ids[0]],
								quantity: {
									selected: {
										count: 100
									}
								}
							}
						)),
						fulfillments: [
							{
								id:"F1",
								stops: [
									{
										"type": "end",
										"time": {
											"label": "selected",
											"range": {
												"start": "2024-06-09T22:00:00.000Z"
											}
										},
										"location": {
											"gps": "12.974002,77.613458",
											"area_code": "560001"
										}
									}
								]
							}
						],
						payments: [
							{
								"type": "PRE-FULFILLMENT"
							},
							{
								"type": "ON-FULFILLMENT"
							}
						],
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
					}
				}
			}
			// console.log("items-....>", JSON.stringify(select.message))
			switch (scenario) {
				case "counter-offers":
					select = {
						...select,
						message: {
							order: {
								provider:(select.message.order as any).provider,
								fulfillments:(select.message.order as any).fulfillments,
								items: [{
									...(select.message.order as any).items[0],
									fulfillment_ids:["F1"],
									quantity:{
										selected:{
											count:100
										}
									},
									price: {
										currency: "INR",
										value: "300.00"
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
													value: "250.00"
												}
											]
										}
									]
								}],
								payments: [
									{
										type: "PRE-FULFILLMENT"
									}

								],
								tags:(select.message.order as any).tags
							}
						}
					}
					break;
				case "accepts":
					select={
						...select,
						message: {
							order: {
								provider:(select.message.order as any).provider,
								fulfillments:(select.message.order as any).fulfillments,
								items: [{
									...(select.message.order as any).items[0],
									fulfillment_ids:["F1"],
									quantity:{
										selected:{
											count:100
										}
									},
									price: {
										currency: "INR",
										value: "300.00"
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
													value: "250.00"
												}
											]
										}
									],
								}],
								payments: [
									{
                    "type": "PRE-FULFILLMENT"
                },
                {
                    "type": "ON-FULFILLMENT"
                }
								],
								tags:(select.message.order as any).tags
							}
						}
					}
					break;
				default:
					select={...select}
					break;
			}
		}


		// console.log("items", JSON.stringify(select.message))
		await send_response(res, next, select, transaction_id, "select",scenario);
	} catch (error) {
		return next(error);
	}
};
