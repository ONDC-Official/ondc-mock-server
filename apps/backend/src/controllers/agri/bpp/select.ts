import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	quoteCreatorHealthCareService,
	redisFetchFromServer,
	send_nack,
	checkSelectedItems,
	updateFulfillments,
	checkIfCustomized,
	quoteCreatorServiceCustomized,
	Time,
	redis,
	quoteCreatorService,
	quoteCreatorAgri,
	quoteCreatorAgriOutput,
	quoteCreatorNegotiationAgriOutput,
	logger,
	redisFetchToServer,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";
import { error } from "console";

export const selectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {

		const on_search = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SEARCH,
			req.body.context.transaction_id
		) || await redisFetchToServer(
			ON_ACTION_KEY.ON_SEARCH,
			req.body.context.transaction_id
	);

		

		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}
		if (req.body.context.domain === SERVICES_DOMAINS.AGRI_INPUT) {
			const providersItems = on_search?.message?.catalog["bpp/providers"][0];
			req.body.providersItems = providersItems;
		}
		else {
			const providersItems = on_search?.message?.catalog?.providers;
			req.body.providersItems = providersItems;
		}

		const checkItemExistInSearch = await checkSelectedItems(req.body);
		if (!checkItemExistInSearch) {
			return send_nack(res, ERROR_MESSAGES.SELECTED_ITEMS_DOES_NOT_EXISTED);
		}




		if (req.body.context.domain === SERVICES_DOMAINS.AGRI_INPUT) {
			const { scenario } = req.query;
			logger.info("scenario at Onselect", scenario)
			switch (scenario) {
				case "multi-items-successfull-order":
					return onSelectMultiSuccessfullorder(req, res, next)
				case "item-out-of-stock":
					return onSelectItemoutofStock(req, res, next);
				default:
					return selectConsultationConfirmController(req, res, next);
			}
		}
		else {
			const { scenario } = req.query;
			logger.info("scenario at Onselect", scenario)
			switch (scenario) {
				case "counter-offers":
					return onSelectNegotiationStart(req, res, next)
					break;
				case "accepts":
					return onSelectNegotiationEnd(req, res, next)
					break;
				default:
					onSelectAGR11(req, res, next)
					break;
			}
		}


	} catch (error) {
		return next(error);
	}
};

const onSelectMultiSuccessfullorder = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;
		const { locations, ...provider } = message.order.provider;
		const domain = context?.domain;


		const updatedFulfillments =
			domain === SERVICES_DOMAINS.BID_ACTION_SERVICES
				? updateFulfillments(
					message?.order?.fulfillments,
					ON_ACTION_KEY?.ON_SELECT,
					"",
					"bid_auction_service"
				)
				: domain === SERVICES_DOMAINS.AGRI_INPUT
					? updateFulfillments(
						message?.order?.fulfillments,
						ON_ACTION_KEY?.ON_SELECT,
						"",
						"agri_input"
					)
					: updateFulfillments(
						message?.order?.fulfillments,
						ON_ACTION_KEY?.ON_SELECT
					);

		const responseMessage = {
			order: {
				provider: {
					...provider,
					locations: [
						{
							id: "5009-L1",
						},
					],
				},
				items: [
					{
						id: message.order.items[0].id,
						fulfillment_id: "5009-Delivery",
					},
					{
						id: message.order.items[1].id,
						fulfillment_id: "5009-Delivery",
					}
				],
				fulfillments: updatedFulfillments,

				quote: quoteCreatorAgri(
					message?.order?.items,
					providersItems?.items
				),
			}

		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_SELECT
				: `/${ON_ACTION_KEY.ON_SELECT}`
			}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"agri"
		);
	}
	catch (error) {
		next(error)
	}

}

const onSelectItemoutofStock = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;
		const { locations, ...provider } = message.order.provider;
		const domain = context?.domain;


		const updatedFulfillments =
			domain === SERVICES_DOMAINS.BID_ACTION_SERVICES
				? updateFulfillments(
					message?.order?.fulfillments,
					ON_ACTION_KEY?.ON_SELECT,
					"",
					"bid_auction_service"
				)
				: domain === SERVICES_DOMAINS.AGRI_INPUT
					? updateFulfillments(
						message?.order?.fulfillments,
						ON_ACTION_KEY?.ON_SELECT,
						"",
						"agri_input"
					)
					: updateFulfillments(
						message?.order?.fulfillments,
						ON_ACTION_KEY?.ON_SELECT
					);

		const responseMessage = {
			error: {
				"code": "40002",
				"type": "DOMAIN-ERROR",
				"message": "[{\"item_id\":\"16005\",\"error\":\"40002\"},{\"item_id\":\"13899\",\"error\":\"40002\"}]"
			},
			message: {
				order: {
					provider: {
						...provider,
						locations: [
							{
								id: "5009-L1",
							},
						],
					},
					items: message.order.items.map(({ id }: { id: any }) => ({
						id,
						fulfillment_id: "5009-Delivery",
					})),

					fulfillments: updatedFulfillments,

					quote: quoteCreatorAgri(
						message?.order?.items,
						providersItems?.items
					),
				}
			}
		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_SELECT
				: `/${ON_ACTION_KEY.ON_SELECT}`
			}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"agri"
		);
	}
	catch (error) {
		next(error)
	}

}

const selectConsultationConfirmController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;
		const { locations, ...provider } = message.order.provider;
		const domain = context?.domain;


		const updatedFulfillments =
			domain === SERVICES_DOMAINS.BID_ACTION_SERVICES
				? updateFulfillments(
					message?.order?.fulfillments,
					ON_ACTION_KEY?.ON_SELECT,
					"",
					"bid_auction_service"
				)
				: domain === SERVICES_DOMAINS.AGRI_INPUT
					? updateFulfillments(
						message?.order?.fulfillments,
						ON_ACTION_KEY?.ON_SELECT,
						"",
						"agri_input"
					)
					: updateFulfillments(
						message?.order?.fulfillments,
						ON_ACTION_KEY?.ON_SELECT
					);
		const responseMessage = {
			order: {
				provider: {
					...provider,
					locations: [
						{
							id: "5009-L1",
						},
					],
				},
				items: message.order.items.map(({ id }: { id: any }) => ({
					id,
					fulfillment_id: "5009-Delivery",
				})),
				fulfillments: updatedFulfillments,
				quote: quoteCreatorAgri(
					message?.order?.items,
					providersItems?.items
				),
			},
		};
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_SELECT
				: `/${ON_ACTION_KEY.ON_SELECT}`
			}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

const onSelectAGR11 = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;


		const updatedFulfillments = updateFulfillments(
			req.body?.message?.order?.fulfillments,
			ON_ACTION_KEY?.ON_SELECT,
			"",
			"agri_output"
		);


		const { locations, ...provider } = message.order.provider;


		const responseMessage = {
			order: {
				provider,
				payments: message?.order?.payments?.map(
					({ type }: { type: string }) => ({
						type,
						collected_by: "BAP",
					})
				),
				items: message?.order?.items.map(
					({ ...remaining }: { location_ids: any; remaining: any }) => ({
						...remaining,
					})
				),
				fulfillments: updatedFulfillments,
			},
		};

		console.log("responseMessage", JSON.stringify(responseMessage))
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${context.bap_uri}/${ON_ACTION_KEY.ON_SELECT}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"agri",
			error
		);
	} catch (error) {
		next(error);
	}
};

const onSelectNegotiationStart = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;


		const updatedFulfillments = updateFulfillments(
			req.body?.message?.order?.fulfillments,
			ON_ACTION_KEY?.ON_SELECT,
			"",
			"agri_output"
		);


		const { locations, ...provider } = message.order.provider;

		const quotedata = quoteCreatorNegotiationAgriOutput(message.order.items, providersItems)

		const responseMessage = {
			order: {
				provider,
				payments: [
					{
						"collected_by": "BAP",
						"type": "PRE-FULFILLMENT"
				},
					{
						"collected_by": "BAP",
						"type": "ON-FULFILLMENT"
				}
				],
				items: message?.order?.items.map(
					(item: any) => ({
						id: item.id,
						price: item.price,
						location_ids: item.location_ids,
						fulfillment_ids: item.fulfillment_ids|| ["F1"],
						category_ids: item.category_ids,
						"quantity": {
							"selected": {
								"count": 100
							}
						},
						tags: [
							{
								"descriptor": {
									"code": "NEGOTIATION_BAP"
								},
								"list": [
									{
										"descriptor": {
											"code": "items.price.value"
										},
										"value": "270.00"
									},
								]
							},
							{
								"descriptor": {
									"code": "NEGOTIATION_BPP"
								},
								"list": [
									{
										"descriptor": {
											"code": "items.price.value"
										},
										"value": "270.00"
									},
								]
							},
							{
								"descriptor": {
									"code": "COMMODITY_SPECIFICATION"
								},
								"list": [
									{
										"descriptor": {
											"code": "REFERENCE_DOCS_MIME_TYPE"
										},
										"value": "application/pdf"
									},
									{
										"descriptor": {
											"code": "REFERENCE_DOCS_COPY"
										},
										"value": "https://abc.com/commodity_specification.pdf"
									},
									{
										"descriptor": {
											"code": "SHELF_LIFE"
										},
										"value": "P10M"
									},
									{
										"descriptor": {
											"code": "MOISTURE"
										},
										"value": "10%"
									},
									{
										"descriptor": {
											"code": "FOREIGN_MATTER"
										},
										"value": "3%"
									},
									{
										"descriptor": {
											"code": "OIL_CONTENT"
										},
										"value": "2%"
									},
									{
										"descriptor": {
											"code": "DEFECTIVES"
										},
										"value": "7%"
									},
									{
										"descriptor": {
											"code": "OTHER_EDIBLE_GRAINS"
										},
										"value": "1%"
									},
									{
										"descriptor": {
											"code": "URIC_ACID"
										},
										"value": "101"
									},
									{
										"descriptor": {
											"code": "AFLATOXIN"
										},
										"value": "15"
									},
									{
										"descriptor": {
											"code": "ARGEMONE_SEEDS"
										},
										"value": "Yes"
									},
									{
										"descriptor": {
											"code": "SIZE_RANGE_MEASURE"
										},
										"value": "Diameter"
									},
									{
										"descriptor": {
											"code": "SIZE_RANGE"
										},
										"value": "15-18"
									},
									{
										"descriptor": {
											"code": "PERCENTAGE_OF_DEFECTS"
										},
										"value": "1.5%"
									},
									{
										"descriptor": {
											"code": "PERCENTAGE_OF_WASTAGE"
										},
										"value": "3%"
									},
									{
										"descriptor": {
											"code": "BUNCH_SIZE_VALUE"
										},
										"value": "50"
									},
									{
										"descriptor": {
											"code": "BUNCH_SIZE_UNIT"
										},
										"value": "gm"
									},
									{
										"descriptor": {
											"code": "VISIBLE_COLOUR"
										},
										"value": "Brown"
									},
									{
										"descriptor": {
											"code": "COLOUR_PERCENTAGE"
										},
										"value": ">=70%"
									},
									{
										"descriptor": {
											"code": "TOTAL_SOLUBLE_SOLIDS"
										},
										"value": "16 degree Brix"
									},
									{
										"descriptor": {
											"code": "TRACES_OF_SOIL"
										},
										"value": "Sight traces"
									},
									{
										"descriptor": {
											"code": "VOLATILE_OIL"
										},
										"value": "<=2.5%"
									},
									{
										"descriptor": {
											"code": "TOTAL_ASH"
										},
										"value": "<=7%"
									},
									{
										"descriptor": {
											"code": "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
										},
										"value": "5%"
									},
									{
										"descriptor": {
											"code": "MIN_FLOWER_PER_STEM"
										},
										"value": "1"
									},
									{
										"descriptor": {
											"code": "GIRTH_AT_THIN_END_VALUE"
										},
										"value": "<=6"
									},
									{
										"descriptor": {
											"code": "GIRTH_AT_THIN_END_UNIT"
										},
										"value": "cm"
									},
									{
										"descriptor": {
											"code": "BLOOMING_AND_SHAPE"
										},
										"value": ">=85%"
									},
									{
										"descriptor": {
											"code": "FLOWER_DIAMETER_VALUE"
										},
										"value": "3.45"
									},
									{
										"descriptor": {
											"code": "FLOWER_DIAMETER_UNIT"
										},
										"value": "cm"
									},
									{
										"descriptor": {
											"code": "STAPLE_LENGTH_OF_COTTON_VALUE"
										},
										"value": "28‑30"
									},
									{
										"descriptor": {
											"code": "STAPLE_LENGTH_OF_COTTON_UNIT"
										},
										"value": "mm"
									},
									{
										"descriptor": {
											"code": "TRASH_PERCENTAGE"
										},
										"value": "3%"
									},
									{
										"descriptor": {
											"code": "BUNDLE_STRENGTH"
										},
										"value": ">=24.0"
									},
									{
										"descriptor": {
											"code": "MICRONAIRE"
										},
										"value": "2.8-3.0"
									},
									{
										"descriptor": {
											"code": "PERCENTAGE_OF_MATURED_FIBERS"
										},
										"value": ">=70.0"
									},
									{
										"descriptor": {
											"code": "SIEVE_ANALYSIS"
										},
										"value": "98"
									},
									{
										"descriptor": {
											"code": "NUMBER_OF_NUTS_VALUE"
										},
										"value": "210"
									},
									{
										"descriptor": {
											"code": "NUMBER_OF_NUTS_UNIT"
										},
										"value": "kg"
									},
									{
										"descriptor": {
											"code": "VOID_NUTS"
										},
										"value": "1%"
									},
									{
										"descriptor": {
											"code": "IMMATURE_NUTS"
										},
										"value": "2%"
									},
									{
										"descriptor": {
											"code": "STRENGTH"
										},
										"value": "Excellent"
									},
									{
										"descriptor": {
											"code": "FINENESS"
										},
										"value": "10"
									}
								]
							}
						]
					})
				),
				fulfillments: updatedFulfillments,
				quote: quotedata
			},
		};
		if (!Array.isArray((responseMessage as any).order.items[0].tags)) {
			(responseMessage as any).order.items[0].tags = [];
		}


		console.log("responseMessage", JSON.stringify(responseMessage))
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${context.bap_uri}/${ON_ACTION_KEY.ON_SELECT}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"agri",
			error
		);
	} catch (error) {
		next(error);
	}
}

const onSelectNegotiationEnd = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;


		const updatedFulfillments = updateFulfillments(
			req.body?.message?.order?.fulfillments,
			ON_ACTION_KEY?.ON_SELECT,
			"",
			"agri_output"
		);


		const { locations, ...provider } = message.order.provider;

		const quotedata = quoteCreatorNegotiationAgriOutput(message.order.items, providersItems)

		const responseMessage = {
			order: {
				provider,
				payments: message?.order?.payments.map(
					({ type }: { type: string }) => ({
						type,
						collected_by: "BAP",
					})
				),
				items: message?.order?.items.map(
					(item: any) => ({
						id: item.id,
						price: item.price,
						location_ids: item.location_ids,
						fulfillment_ids: item.fulfillment_ids||["F1"],
						category_ids: item.category_ids,
						"quantity": {
							"selected": {
								"count": 100
							}
						},
						tags: [
							{
								"descriptor": {
									"code": "NEGOTIATION_BAP"
								},
								"list": [
									{
										"descriptor": {
											"code": "items.price.value"
										},
										"value": "270.00"
									},
								]
							},
							{
								"descriptor": {
									"code": "NEGOTIATION_BPP"
								},
								"list": [
									{
										"descriptor": {
											"code": "items.price.value"
										},
										"value": "270.00"
									},
								]
							},
							{
								"descriptor": {
									"code": "COMMODITY_SPECIFICATION"
								},
								"list": [
									{
										"descriptor": {
											"code": "REFERENCE_DOCS_MIME_TYPE"
										},
										"value": "application/pdf"
									},
									{
										"descriptor": {
											"code": "REFERENCE_DOCS_COPY"
										},
										"value": "https://abc.com/commodity_specification.pdf"
									},
									{
										"descriptor": {
											"code": "SHELF_LIFE"
										},
										"value": "P10M"
									},
									{
										"descriptor": {
											"code": "MOISTURE"
										},
										"value": "10%"
									},
									{
										"descriptor": {
											"code": "FOREIGN_MATTER"
										},
										"value": "3%"
									},
									{
										"descriptor": {
											"code": "OIL_CONTENT"
										},
										"value": "2%"
									},
									{
										"descriptor": {
											"code": "DEFECTIVES"
										},
										"value": "7%"
									},
									{
										"descriptor": {
											"code": "OTHER_EDIBLE_GRAINS"
										},
										"value": "1%"
									},
									{
										"descriptor": {
											"code": "URIC_ACID"
										},
										"value": "101"
									},
									{
										"descriptor": {
											"code": "AFLATOXIN"
										},
										"value": "15"
									},
									{
										"descriptor": {
											"code": "ARGEMONE_SEEDS"
										},
										"value": "Yes"
									},
									{
										"descriptor": {
											"code": "SIZE_RANGE_MEASURE"
										},
										"value": "Diameter"
									},
									{
										"descriptor": {
											"code": "SIZE_RANGE"
										},
										"value": "15-18"
									},
									{
										"descriptor": {
											"code": "PERCENTAGE_OF_DEFECTS"
										},
										"value": "1.5%"
									},
									{
										"descriptor": {
											"code": "PERCENTAGE_OF_WASTAGE"
										},
										"value": "3%"
									},
									{
										"descriptor": {
											"code": "BUNCH_SIZE_VALUE"
										},
										"value": "50"
									},
									{
										"descriptor": {
											"code": "BUNCH_SIZE_UNIT"
										},
										"value": "gm"
									},
									{
										"descriptor": {
											"code": "VISIBLE_COLOUR"
										},
										"value": "Brown"
									},
									{
										"descriptor": {
											"code": "COLOUR_PERCENTAGE"
										},
										"value": ">=70%"
									},
									{
										"descriptor": {
											"code": "TOTAL_SOLUBLE_SOLIDS"
										},
										"value": "16 degree Brix"
									},
									{
										"descriptor": {
											"code": "TRACES_OF_SOIL"
										},
										"value": "Sight traces"
									},
									{
										"descriptor": {
											"code": "VOLATILE_OIL"
										},
										"value": "<=2.5%"
									},
									{
										"descriptor": {
											"code": "TOTAL_ASH"
										},
										"value": "<=7%"
									},
									{
										"descriptor": {
											"code": "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
										},
										"value": "5%"
									},
									{
										"descriptor": {
											"code": "MIN_FLOWER_PER_STEM"
										},
										"value": "1"
									},
									{
										"descriptor": {
											"code": "GIRTH_AT_THIN_END_VALUE"
										},
										"value": "<=6"
									},
									{
										"descriptor": {
											"code": "GIRTH_AT_THIN_END_UNIT"
										},
										"value": "cm"
									},
									{
										"descriptor": {
											"code": "BLOOMING_AND_SHAPE"
										},
										"value": ">=85%"
									},
									{
										"descriptor": {
											"code": "FLOWER_DIAMETER_VALUE"
										},
										"value": "3.45"
									},
									{
										"descriptor": {
											"code": "FLOWER_DIAMETER_UNIT"
										},
										"value": "cm"
									},
									{
										"descriptor": {
											"code": "STAPLE_LENGTH_OF_COTTON_VALUE"
										},
										"value": "28‑30"
									},
									{
										"descriptor": {
											"code": "STAPLE_LENGTH_OF_COTTON_UNIT"
										},
										"value": "mm"
									},
									{
										"descriptor": {
											"code": "TRASH_PERCENTAGE"
										},
										"value": "3%"
									},
									{
										"descriptor": {
											"code": "BUNDLE_STRENGTH"
										},
										"value": ">=24.0"
									},
									{
										"descriptor": {
											"code": "MICRONAIRE"
										},
										"value": "2.8-3.0"
									},
									{
										"descriptor": {
											"code": "PERCENTAGE_OF_MATURED_FIBERS"
										},
										"value": ">=70.0"
									},
									{
										"descriptor": {
											"code": "SIEVE_ANALYSIS"
										},
										"value": "98"
									},
									{
										"descriptor": {
											"code": "NUMBER_OF_NUTS_VALUE"
										},
										"value": "210"
									},
									{
										"descriptor": {
											"code": "NUMBER_OF_NUTS_UNIT"
										},
										"value": "kg"
									},
									{
										"descriptor": {
											"code": "VOID_NUTS"
										},
										"value": "1%"
									},
									{
										"descriptor": {
											"code": "IMMATURE_NUTS"
										},
										"value": "2%"
									},
									{
										"descriptor": {
											"code": "STRENGTH"
										},
										"value": "Excellent"
									},
									{
										"descriptor": {
											"code": "FINENESS"
										},
										"value": "10"
									}
								]
							}
						]
					})
				),
				fulfillments: updatedFulfillments,
				quote: quotedata
			},
		};
		if (!Array.isArray((responseMessage as any).order.items[0].tags)) {
			(responseMessage as any).order.items[0].tags = [];
		}
		console.log("responseMessage", JSON.stringify(responseMessage))
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${context.bap_uri}/${ON_ACTION_KEY.ON_SELECT}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"agri",
			error
		);
	} catch (error) {
		next(error);
	}
}

