import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	MOCKSERVER_ID,
	send_response,
	send_nack,
	redisFetchToServer,
	SERVICES_BAP_MOCKSERVER_URL,
	quoteCreatorWarehouse,
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

		items = (context.domain === SERVICES_DOMAINS.WEIGHMENT)?items:items.map(
			({ location_ids, ...items }: { location_ids: any }) => items
		)

		const init = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.INIT,
				bap_id: MOCKSERVER_ID,
				bap_uri: SERVICES_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					provider: {
						...provider,
						locations: [{ id: uuidv4() }],
					},
					items,
					billing: BILLING_DETAILS,
					fulfillments: [
						{
							id,
							type,
							stops: [
								{
									...stops[0],
									// id: undefined,
									location:(context.domain===SERVICES_DOMAINS.WEIGHMENT)?{
										gps: "12.974002,77.613458",
										area_code: "560001",
									} :{
										gps: "12.974002,77.613458",
										address: "My House #, My buildin",
										city: {
											name: "Bengaluru",
										},
										country: {
											code: "IND",
										},
										area_code: "560001",
										state: {
											name: "Karnataka",
										},
									},
									// days:undefined,
									contact:(context.domain===SERVICES_DOMAINS.WEIGHMENT )?undefined: {
										phone: "9886098860",
									},
									time: {...stops[0].time,
										days:"4"
									},
								},
							],
						},
					],
					quote:(context.domain === SERVICES_DOMAINS.WAREHOUSE)?quote:undefined,
					payments,
				},
			},
		};

		if(context.domain===SERVICES_DOMAINS.ASTRO_SERVICE){
			init.message.order.items[0].location_ids=[
				"L1"
			],
			init.message.order.provider.locations=[{
				id:"L1"
			}]
		}
		if(context.domain === SERVICES_DOMAINS.AGRI_EQUIPMENT){
			init.message.order.items=[{...init.message.order.items[0],location_ids:["L1"]}]
		}
		if (context.domain === SERVICES_DOMAINS.WAREHOUSE) {
			delete init.message.order.fulfillments[0].stops[0].location
			delete init.message.order.fulfillments[0].stops[0].contact
			delete init.message.order.fulfillments[0].stops[0].time.days;

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
