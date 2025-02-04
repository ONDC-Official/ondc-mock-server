import { NextFunction, Request, Response } from "express";
import {
	AGRI_HEALTHCARE_STATUS,
	AGRI_HEALTHCARE_STATUS_OBJECT,
	ASTRO_STATUS,
	ASTRO_STATUS_OBJECT,
	BID_AUCTION_STATUS,
	EQUIPMENT_HIRING_STATUS,
	FULFILLMENT_LABELS,
	ORDER_STATUS,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";
import {
	Fulfillment,
	MOCKSERVER_ID,
	SERVICES_BPP_MOCKSERVER_URL,
	Stop,
	TransactionType,
	createAuthHeader,
	logger,
	redis,
	redisExistFromServer,
	redisFetchFromServer,
	responseBuilder,
	send_nack,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import axios, { AxiosError } from "axios";

export const statusController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let scenario: string = String(req.query.scenario) || "";
		const { transaction_id } = req.body.context;
		const on_confirm_data = await redisFetchFromServer(
			ON_ACTION_KEY.ON_CONFIRM,
			transaction_id
		);

		if (!on_confirm_data) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}

		const on_cancel_exist = await redisExistFromServer(
			ON_ACTION_KEY.ON_CANCEL,
			transaction_id
		);
		if (on_cancel_exist) {
			scenario = "cancel";
		}
		return statusRequest(req, res, next, on_confirm_data, scenario);
	} catch (error) {
		return next(error);
	}
};

const statusRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string
) => {
	try {
		const { context, message } = transaction;
		context.action = ON_ACTION_KEY.ON_STATUS;
		const domain = context?.domain;
		const on_status = await redisFetchFromServer(
			ON_ACTION_KEY.ON_STATUS,
			req.body.context.transaction_id
		);
		let next_status = scenario;

		if (on_status) {
			//UPDATE SCENARIO TO NEXT STATUS
			const lastStatus =
				on_status?.message?.order?.fulfillments[0]?.state?.descriptor?.code;

			//FIND NEXT STATUS
			let lastStatusIndex: any = 0;
			switch (domain) {
				case SERVICES_DOMAINS.SERVICES || SERVICES_DOMAINS.AGRI_EQUIPMENT:
					lastStatusIndex = EQUIPMENT_HIRING_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 2) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < EQUIPMENT_HIRING_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = EQUIPMENT_HIRING_STATUS[nextStatusIndex];
					}
					break;
				case SERVICES_DOMAINS.BID_ACTION_SERVICES:
					lastStatusIndex = BID_AUCTION_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 1) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < BID_AUCTION_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = BID_AUCTION_STATUS[nextStatusIndex];
					}
					break;
				case SERVICES_DOMAINS.ASTRO_SERVICE:
					lastStatusIndex = ASTRO_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 7) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < ASTRO_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = ASTRO_STATUS[nextStatusIndex];
					}
					break;
				default: //service started is the default case
					lastStatusIndex = AGRI_HEALTHCARE_STATUS.indexOf(lastStatus);
					if (lastStatus === 6) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < AGRI_HEALTHCARE_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = AGRI_HEALTHCARE_STATUS[nextStatusIndex];
					}
					break;
			}
		}
		scenario = scenario ? scenario : next_status;

		let responseMessage: any = {
			order: {
				id: message.order.id,
				status: (context.domain===SERVICES_DOMAINS.SERVICES)?ORDER_STATUS.IN_PROGRESS.toUpperCase() :ORDER_STATUS.IN_PROGRESS,
				provider: {
					...message.order.provider,
					rateable: undefined,
				},
				items: message.order.items,
				billing: { ...message.order.billing, tax_id: undefined },

				fulfillments: message.order.fulfillments.map(
					(fulfillment: Fulfillment) => ({
						...fulfillment,
						id: fulfillment.id,
						state: {
							descriptor: {
								code: AGRI_HEALTHCARE_STATUS_OBJECT.IN_TRANSIT,
							},
						},

						stops: fulfillment.stops.map((stop: Stop) => {
							const demoObj = {
								...stop,
								id: undefined,
								authorization: stop.authorization
									? {
										...stop.authorization,
										status: FULFILLMENT_LABELS.CONFIRMED,
									}
									: undefined,
								person: (domain === SERVICES_DOMAINS.ASTRO_SERVICE) ? { name: "Rahul" } : stop.person ? stop.person : stop.customer?.person,
							};
							if (stop.type === "start") {
								return {
									...demoObj,
									location: {
										...stop.location,
										descriptor: {
											...stop.location?.descriptor,
											images: [{ url: "https://gf-integration/images/5.png" }],
										},
									},
								};
							}
							return demoObj;
						}),
						rateable: undefined,
						tracking:false
					})
				),
				quote: message.order.quote,
				payments: message.order.payments,
				documents: [
					{
						url: "https://invoice_url",
						label: "INVOICE",
					},
				],
				created_at: message.order.created_at,
				updated_at: message.order.updated_at,
			},
		};

		switch (scenario) {
			case AGRI_HEALTHCARE_STATUS_OBJECT.IN_TRANSIT:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.IN_TRANSIT;
						fulfillment.stops.forEach((stop: Stop) =>
							stop?.authorization ? (stop.authorization = undefined) : undefined
						);
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.AT_LOCATION:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.AT_LOCATION;
						fulfillment.stops.forEach((stop: Stop) =>
							stop?.authorization
								? (stop.authorization = {
									...stop.authorization,
									status: "valid",
								})
								: undefined
						);
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.COLLECTED_BY_AGENT:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.COLLECTED_BY_AGENT;
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.RECEIVED_AT_LAB:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.RECEIVED_AT_LAB;
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.TEST_COMPLETED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.TEST_COMPLETED;
						fulfillment.stops.forEach((stop: Stop) =>
							stop?.authorization ? (stop.authorization = undefined) : undefined
						);
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_GENERATED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_GENERATED;
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_SHARED:
				responseMessage.order.status = AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED;
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_SHARED;
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED:
				responseMessage.order.status = AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED;
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_SHARED;
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.PLACED:
				// responseMessage.order.status = AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED;
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_HEALTHCARE_STATUS_OBJECT.PLACED;
					}
				);
				break;
			case AGRI_HEALTHCARE_STATUS_OBJECT.CANCEL:
				responseMessage.order.status = "Cancelled";
				break;
			case ASTRO_STATUS_OBJECT.PUJARI_ASSIGNED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							ASTRO_STATUS_OBJECT.PUJARI_ASSIGNED;
						fulfillment.stops.forEach((stop: Stop) =>
							stop?.authorization ? (stop.authorization = undefined) : undefined
						);
					}
				);
				break;
			case ASTRO_STATUS_OBJECT.IN_TRANSIT:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							ASTRO_STATUS_OBJECT.IN_TRANSIT;
					}
				);
				break;
			case ASTRO_STATUS_OBJECT.AT_LOCATION:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							ASTRO_STATUS_OBJECT.AT_LOCATION;
					}
				);
				break;
			case ASTRO_STATUS_OBJECT.CHAT_ROOM_OPEN:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							ASTRO_STATUS_OBJECT.CHAT_ROOM_OPEN;
					}
				);
				break;
			case ASTRO_STATUS_OBJECT.CHAT_ROOM_CREATED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							ASTRO_STATUS_OBJECT.CHAT_ROOM_CREATED;
					}
				);
				break;
			case ASTRO_STATUS_OBJECT.CHAT_ROOM_UPDATED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							ASTRO_STATUS_OBJECT.CHAT_ROOM_UPDATED;
					}
				);
				break;
			default: //service started is the default case
				break;
		}

		if (domain === SERVICES_DOMAINS.ASTRO_SERVICE) {
			responseMessage.order.fulfillments[0].stops[1].location.descriptor = {
				name: "Temple"
			}
			responseMessage.order.fulfillments[0].customer = {
				"person": {
					"name": "Ramu"
				}
			}
			responseMessage.order.fulfillments[0].agent = {
				"person": {
					"name": "Pujari Name"
				},
				"contact": {
					"phone": "9XXXXXXXXX"
				}
			}
			delete responseMessage.order.documents
			delete responseMessage.order.fulfillments[0].stops[0]?.locations?.address
			delete responseMessage.order.fulfillments[0].stops[0]?.locations?.city
			delete responseMessage.order.fulfillments[0].stops[0]?.locations?.state
			delete responseMessage.order.fulfillments[0].stops[0]?.locations?.country


			const createdate = new Date(message.order.created_at)
			createdate.setSeconds(createdate.getSeconds() + 10);

			const updatedate = new Date(message.order.updated_at)
			updatedate.setSeconds(updatedate.getSeconds() + 10);


			if (on_status) {
				const lastStatus =
					on_status?.message?.order?.fulfillments[0]?.state?.descriptor?.code;

				//FIND NEXT STATUS
				let lastStatusIndex: any = 0;

				return responseBuilder(
					res,
					next,
					req.body.context,
					responseMessage,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
						? ON_ACTION_KEY.ON_STATUS
						: `/${ON_ACTION_KEY.ON_STATUS}`
					}`,
					`${ON_ACTION_KEY.ON_STATUS}`,
					"services"
				);
			}
			else {
				 responseMessage = {
					...responseMessage, // spread the entire response
					order: {
						...responseMessage.order, // spread message to retain its content
						fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
							...fulfillment, // spread the fulfillment object
							state: {
								...fulfillment.state, // spread state to retain other state details
								descriptor: {
									...fulfillment.state.descriptor, // spread descriptor to modify only the code
									code: "AGENT_ASSIGNED" // modify the code to "created"
								}
							}
						})),
						created_at: createdate.toISOString(),
						updated_at: updatedate.toISOString()
	
					}
				};
				responseBuilder(
					res,
					next,
					req.body.context,
					responseMessage,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
						? ON_ACTION_KEY.ON_STATUS
						: `/${ON_ACTION_KEY.ON_STATUS}`
					}`,
					`${ON_ACTION_KEY.ON_STATUS}`,
					"services"
				);
				astroservice(responseMessage, req, res, message)
			}
		}
		else {
			// console.log("responseMessage", JSON.stringify(responseMessage))

			return responseBuilder(
				res,
				next,
				req.body.context,
				responseMessage,
				`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_STATUS
					: `/${ON_ACTION_KEY.ON_STATUS}`
				}`,
				`${ON_ACTION_KEY.ON_STATUS}`,
				"services"
			);
		}
	} catch (error) {
		next(error);
	}
};



export const astroservice = (responseMessage: any, req: Request, res: Response, message: any) => {

	try {
		const createdate = new Date(message.order.created_at)
		createdate.setSeconds(createdate.getSeconds() + 10);

		const updatedate = new Date(message.order.updated_at)
		updatedate.setSeconds(updatedate.getSeconds() + 10);

		createdate.setSeconds(createdate.getSeconds() + 20);
		updatedate.setSeconds(updatedate.getSeconds() + 20);

		const onStatusInTransit = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "In_Transit" // modify the code to "created"
						}
					}
				})),
				created_at: createdate.toISOString(),
				updated_at: updatedate.toISOString()
			}
		}

		createdate.setSeconds(createdate.getSeconds() + 20);
		updatedate.setSeconds(updatedate.getSeconds() + 20);

		const onStatusAtlocation = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "At_Location" // modify the code to "created"
						}
					}
				})),
				created_at: createdate.toISOString(),
				updated_at: updatedate.toISOString()
			}

		}

		createdate.setSeconds(createdate.getSeconds() + 20);
		updatedate.setSeconds(updatedate.getSeconds() + 20);

		const onStatusCompleted = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				status: "Completed",
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "COMPLETED" // modify the code to "created"
						}
					}
				})),
				created_at: createdate.toISOString(),
				updated_at: updatedate.toISOString()
			}
		}


		async function callFunctionsSequentially() {
			await new Promise((resolve) => setTimeout(resolve, 10000));
			await childOrderResponseBuilder(
				0,
				res,
				req.body.context,
				onStatusInTransit,
				`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				}`,
				"on_status"
			);
			await new Promise((resolve) => setTimeout(resolve, 10000));

			await childOrderResponseBuilder(
				0,
				res,
				req.body.context,
				onStatusAtlocation,
				`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				}`,
				"on_status"
			);
			await new Promise((resolve) => setTimeout(resolve, 10000));

			await childOrderResponseBuilder(
				0,
				res,
				req.body.context,
				onStatusCompleted,
				`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				}`,
				"on_status"
			);
		}

		callFunctionsSequentially();

	}
	catch (err) {
		next(err)
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
	// console.log("==>>>testing")
	let ts = new Date();

	const sandboxMode = res.getHeader("mode") === "sandbox";

	let async: { message: object; context?: object; error?: object } = {
		context: {},
		message,
	};
	const bppURI = SERVICES_BPP_MOCKSERVER_URL
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
		console.log("heree")
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

function next(error: any) {
	throw new Error("Function not implemented.");
}
