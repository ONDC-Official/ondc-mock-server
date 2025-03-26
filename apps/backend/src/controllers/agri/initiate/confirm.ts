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
	quoteCreatorAgriOutput,
} from "../../../lib/utils";
import {
	ACTTION_KEY,
	ON_ACTION_KEY,
} from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { ORDER_STATUS, PAYMENT_STATUS, SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const initiateConfirmController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { scenario, transactionId } = req.body;
		const on_search = await redisFetchToServer(
			ON_ACTION_KEY.ON_SEARCH,
			transactionId
		);

		let providersItems;
		if (on_search.context.domain === SERVICES_DOMAINS.AGRI_INPUT) {
			providersItems =
				on_search?.message?.catalog["bpp/providers"][0]?.items;
			req.body.providersItems = providersItems;
		}
		else {
			 providersItems = on_search?.message?.catalog?.providers;
			req.body.providersItems = providersItems;
		}


		const on_init = await redisFetchToServer(
			ON_ACTION_KEY.ON_INIT,
			transactionId
		);
		if (!on_init) {
			return send_nack(res, ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED);
		}

	
		if (on_search.context.domain === SERVICES_DOMAINS.AGRI_OUTPUT) {
			return agriOutputIntializeRequest(res, next, on_init, scenario, providersItems)
		}
		else{
			return intializeRequest(res, next, on_init, scenario, providersItems);
		}
		
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string,
	providersItems: any
) => {
	try {
		let {
			context,
			message: {
				order: { provider, quote, locations, payment, fulfillments, xinput, items },
			},
		} = transaction;
		const { transaction_id } = context;


		const timestamp = new Date().toISOString();


		const confirm = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.CONFIRM,
				bap_id: MOCKSERVER_ID,
				bap_uri: AGRI_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					...transaction.message.order,
					id: uuidv4(),
					state: ORDER_STATUS.CREATED.toUpperCase(),
					provider,
					fulfillments,
					items: items.map((itm: any) => (
						{
							id: itm.id,
							fulfillment_id: itm.fulfillment_id,
							quantity: {
								count: 2,
							},
						}
					)),
					payment: {
						...payment,
						"@ondc/org/settlement_details": [
							{
								bank_name: "HDFC",
								beneficiary_name: "Agro Fertilizer Pvt. Ltd.",
								branch_name: "Gurugram",
								settlement_bank_account_no: "38366111323636",
								settlement_counterparty: "buyer-app",
								settlement_ifsc_code: "HDFC00000",
								settlement_phase: "sale-amount",
								settlement_type: "neft",
							},
						],
						collected_by: "BPP",
						params: {
							amount: quote?.price.value,
							currency: "INR",
						},
					},
					created_at: timestamp,
					updated_at: timestamp,
				},
			},
		};
		await send_response(
			res,
			next,
			confirm,
			transaction_id,
			"confirm",
			(scenario = scenario)
		);
	} catch (error) {
		next(error);
	}
};

const agriOutputIntializeRequest = async (res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string,
	providersItems: any) => {
	try {
		let {
			context,
			message: {
				order: { provider, quote, locations, payments, fulfillments, xinput, items },
			},
		} = transaction;
		const { transaction_id } = context;
		console.log("====>>>>",JSON.stringify(items))
		// console.log("itmmmmms",JSON.stringify(quote),"payment",JSON.stringify(payments),"fulfillments",JSON.stringify(fulfillments))

		const timestamp = new Date().toISOString();
		const quotedata=quoteCreatorAgriOutput(items,providersItems)

		const confirm = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.CONFIRM,
				bap_id: MOCKSERVER_ID,
				bap_uri: AGRI_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					...transaction.message.order,
					id: uuidv4(),
					status: "In-Progress",
					provider,
					fulfillments:[
						{
							...fulfillments[0],
							stops:[
								{
								...fulfillments[0].stops[0],
								customer: {
									person: {
										name: "Ramu"
									}
								},
								instructions: {
									name: "Special Instructions",
									short_desc: "Customer Special Instructions"
								}
							}]
						}
					],
					items: items.map((itm: any) => (
						{
							id: itm.id,
							category_ids: itm.category_ids,
							location_ids:itm.location_ids,
							quantity: {
								selected: {
									count: 100
								}
							},
							 price:(scenario==="negotiation")?itm.price:undefined,
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
						}
					)),
					quote:quotedata,
					payments: [
						...payments,
					],
					created_at: timestamp,
					updated_at: timestamp,
				},
			},
		};

		
		console.log("cnfmmessage", JSON.stringify(confirm.message))

		switch(scenario){
			case "negotiation":
				 break;
			default:
				delete confirm.message.order.cancellation_terms
				delete confirm.message.order.items[0].tags
		}

		await send_response(
			res,
			next,
			confirm,
			transaction_id,
			"confirm",
			(scenario = scenario)
		);
	} catch (error) {
		next(error);
	}
}