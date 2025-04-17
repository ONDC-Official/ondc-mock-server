import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	checkIfCustomized,
	send_response,
	send_nack,
	redisFetchToServer,
	Item,
	SUBSCRIPTION_BAP_MOCKSERVER_URL,
	SUBSCRIPTION_EXAMPLES_PATH,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import YAML from "yaml";
import _ from "lodash";
import path from "path";
import { SUBSCRIPTION_DOMAINS } from "../../../lib/utils/apiConstants";

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
		const {
			context,
			message: {
				catalog: { providers, payments },
			},
		} = transaction;

		const { scenario } = req.query || "";
		const { transaction_id } = context;
		const { id, fulfillments } = providers?.[0];
		let items = [];
		let file: any;
		let response: any;
		items = providers[0].items = [
			providers[0].items.map(
				({
					id,
					fulfillment_ids,
				}: {
					id: string;
					fulfillment_ids: string[];
				}) => ({ id, fulfillment_ids: [fulfillment_ids?.[1]] })
			)?.[0],
		];

		let type;
		switch (scenario) {
			case "single-order-offline-without-subscription":
				type = "OFFLINE";
				break;
			case "single-order-online-without-subscription":
				type = "ONLINE";
				break;
			default:
				type = "SUBSCRIPTION";
		}
		let fulfillment_ids =
			transaction.message.catalog.providers[0].fulfillments.filter(
				(obj: any) => {
					if (obj.type === type) {
						return obj;
					}
				}
			);

		let fulfillment: any = [
			{
				...fulfillment_ids[0],
				stops: [
					{
						type: "start",
						time: {
							label: "selected",
							range: {
								start: providers[0].time.schedule.times[0] ?? new Date(),
							},
							duration: fulfillment_ids[0].stops.time.duration
								? fulfillment_ids[0].stop.time.duration
								: "P6M",
							schedule: {
								frequency: fulfillment_ids[0].stops[0].time.schedule.frequency,
							},
						},
					},
				],
				tags: fulfillment_ids[0].tags,
			},
		];

		switch (scenario) {
			case "subscription-with-eMandate":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "select/select_mandate.yaml")
				);
				response = YAML.parse(file.toString());
				break;
			case "single-order-offline-without-subscription":
				file = fs.readFileSync(
					path.join(SUBSCRIPTION_EXAMPLES_PATH, "select/select_single.yaml")
				);
				response = YAML.parse(file.toString());

				break;
			case "single-order-online-without-subscription":
				file = fs.readFileSync(
					path.join(
						SUBSCRIPTION_EXAMPLES_PATH,
						"select/select_single_online.yaml"
					)
				);
				response = YAML.parse(file.toString());
				break;
			default:
				fulfillment = fulfillment;
		}

		const select = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: "select",
				bap_id: MOCKSERVER_ID,
				bap_uri: SUBSCRIPTION_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},

			message: {
				order: {
					provider: {
						id,
					},
					items: items.map((itm: Item) => ({
						...itm,
						fulfillment_ids: [fulfillment_ids[0].id],
						quantity: {
							selected: {
								count: 1,
							},
						},
					})),

					fulfillments:
						context.domain === SUBSCRIPTION_DOMAINS.PRINT_MEDIA
							? fulfillment
							: [{ type: "ONLINE" }],
					payments:
						context.domain === SUBSCRIPTION_DOMAINS.PRINT_MEDIA
							? [{ type: payments?.[0].type }]
							: undefined,
				},
			},
		};
		if (
			scenario === "single-order-offline-without-subscription" ||
			scenario === "single-order-online-without-subscription"
		) {
			select.message.order.fulfillments[0].tags = [
				{
					descriptor: {
						code: "SELECTION",
					},
					list: [
						{
							descriptor: {
								code: "ITEM_IDS",
							},
							value: select.message.order.items[0].id,
						},
					],
				},
			];
			delete select.message.order.fulfillments[0].stops[0].time.days;
			delete select.message.order.payments;
		}
		if (scenario === "subscription-with-eMandate") {
			select.message.order.fulfillments[0].tags = [
				...select.message.order.fulfillments[0].tags,
				{
					descriptor: {
						code: "SELECTION",
					},
					list: [
						{
							descriptor: {
								code: "ITEM_IDS",
							},
							value: select.message.order.items[0].id,
						},
					],
				},
			];
			delete select.message.order.payments;
		}
		if (scenario === "subscription-with-full-payments") {
			select.message.order.fulfillments[0].tags = [
				...select.message.order.fulfillments[0].tags,
				{
					descriptor: {
						code: "SELECTION",
					},
					list: [
						{
							descriptor: {
								code: "ITEM_IDS",
							},
							value: select.message.order.items[0].id,
						},
					],
				},
			];
			delete select.message.order.fulfillments[0].id;
			delete select.message.order.payments;
		}
		await send_response(res, next, select, transaction_id, "select", scenario);
	} catch (error) {
		return next(error);
	}
};
