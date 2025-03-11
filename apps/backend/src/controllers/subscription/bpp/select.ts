import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	redisFetchFromServer,
	send_nack,
	checkSelectedItems,
	updateFulfillments,
	quoteSubscription,
	quoteCommon,
	quoteOTT,
} from "../../../lib/utils";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { SUBSCRIPTION_DOMAINS } from "../../../lib/utils/apiConstants";

export const selectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const on_search = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SEARCH,
			req.body.context.transaction_id
		);

		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}
		const providersItems = on_search?.message?.catalog?.providers[0];
		req.body.providersItems = providersItems;

		const checkItemExistInSearch = await checkSelectedItems(req.body);
		if (!checkItemExistInSearch) {
			return send_nack(res, ERROR_MESSAGES.SELECTED_ITEMS_DOES_NOT_EXISTED);
		}
		return selectConsultationConfirmController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

const selectConsultationConfirmController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, providersItems } = req.body;
		const { locations, ...provider } = message.order.provider;

		/**CHECK SCENARIO AND FULLFILMENT TYPE */
		const { scenario } = req.query;
		if (
			(scenario === "single-order-offline-without-subscription" &&
				message?.order?.fulfillments[0]?.type !== "OFFLINE") ||
			(scenario === "single-order-online-without-subscription" &&
				message?.order?.fulfillments[0]?.type !== "ONLINE") ||
			(scenario === "subscription-with-eMandate" &&
				message?.order?.fulfillments[0]?.type !== "SUBSCRIPTION")
		) {
			return send_nack(
				res,
				`Please select correct scenarios for ${message?.order?.fulfillments[0]?.type}`
			);
		}

		/** DEFINE QUOTE AND FULFILLMENT HERE FOR MAIPULATION*/
		let quoteData = quoteSubscription(
			message?.order?.items,
			providersItems?.items,
			"",
			message?.order?.fulfillments[0]
		);

			if(context.domain===SUBSCRIPTION_DOMAINS.PRINT_MEDIA){
				var updatedFulfillments = updateFulfillments(
					message?.order?.fulfillments,
					ON_ACTION_KEY?.ON_SELECT,
					"",
					"subscription"
				);
			}


		switch (scenario) {
			case "single-order-offline-without-subscription":
				quoteData = quoteSubscription(
					message?.order?.items,
					providersItems?.items,
					"single-order",
					message?.order?.fulfillments[0]
				);
				break;

			//EQUIPMENT HIRING SCENARIOS
			case "single-order-online-without-subscription":
				quoteData = quoteSubscription(
					message?.order?.items,
					providersItems?.items,
					"single-order",
					message?.order?.fulfillments[0]
				);
				break;
			default:
				quoteData = quoteSubscription(
					message?.order?.items,
					providersItems?.items,
					"",
					message?.order?.fulfillments[0]
				);
		}
		if(context.domain===SUBSCRIPTION_DOMAINS.AUDIO_VIDEO){
			 quoteData = quoteOTT(
				message?.order?.items,
				providersItems?.items,
				);
		}
		let responseMessage: any = {
			order: {
				provider,
				payments: (context.domain===SUBSCRIPTION_DOMAINS.PRINT_MEDIA)?message?.order?.payments:undefined,
				items: (context.domain === SUBSCRIPTION_DOMAINS.AUDIO_VIDEO)
				? message.order.items.map(
						({ location_ids, price, quantity, tags,title, ...remaining }: any) => ({
							...remaining,
						})
					)
				: message.order.items.map(
						({ location_ids, ...remaining }: any) => ({
							...remaining,
							location_ids,
						})
					)			,
				fulfillments:(context.domain===SUBSCRIPTION_DOMAINS.PRINT_MEDIA)?updatedFulfillments:[{id:"F1",type:"ONLINE"}],
				quote: quoteData,
			},
		};

		if (scenario === "subscription-with-manual-payments" || scenario === "subscription-with-full-payments") {
			responseMessage.order.payments = [
				{
					id: "PG1",
					collected_by: "BPP",
					type: "PRE_FULFILLMENT",
					tags: [
						{
							descriptor: {
								name: "Payment Method",
								code: "PAYMENT_METHOD",
							},
							list: [
								{
									descriptor: {
										code: "MODE",
									},
									value: "MANDATE_REGISTRATION",
								},
							],
						},
					],
				},
				{
					id: "PG2",
					collected_by: "bpp",
					type: "PRE_FULFILLMENT",
					tags: [
						{
							descriptor: {
								name: "Payment Method",
								code: "PAYMENT_METHOD",
							},
							list: [
								{
									descriptor: {
										code: "MODE",
									},
									value: "MANUAL_EMI",
								},
							],
						},
					],
				},
				{
					id: "PG3",
					collected_by: "bpp",
					type: "PRE_FULFILLMENT",
					tags: [
						{
							descriptor: {
								name: "Payment Method",
								code: "PAYMENT_METHOD",
							},
							list: [
								{
									descriptor: {
										code: "MODE",
									},
									value: "FULL_PAYMENT",
								},
							],
						},
					],
				},
			];
		}
		console.log("====>",JSON.stringify(responseMessage))
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_SELECT
					: `/${ON_ACTION_KEY.ON_SELECT}`
			}`,
			`${ON_ACTION_KEY.ON_SELECT}`,
			"subscription"
		);
	} catch (error) {
		next(error);
	}
};
