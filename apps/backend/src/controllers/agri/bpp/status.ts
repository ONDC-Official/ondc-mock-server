import { NextFunction, Request, Response } from "express";
import {
	AGRI_HEALTHCARE_STATUS,
	AGRI_HEALTHCARE_STATUS_OBJECT,
	AGRI_STATUS,
	AGRI_STATUS_OBJECT,
	BID_AUCTION_STATUS,
	EQUIPMENT_HIRING_STATUS,
	FULFILLMENT_LABELS,
	ORDER_STATUS,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";
import {
	AGRI_BPP_MOCKSERVER_URL,
	Fulfillment,
	MOCKSERVER_ID,
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
		if (req.body.context.domain === SERVICES_DOMAINS.AGRI_OUTPUT) {
			return statusAgriOutputRequest(req, res, next, on_confirm_data, scenario)
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
			console.log("domainatstatusbpp", domain)
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
				case SERVICES_DOMAINS.AGRI_INPUT:
					lastStatusIndex = AGRI_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 1) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < AGRI_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = AGRI_STATUS[nextStatusIndex];
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
		const responseMessage: any = {
			order: {
				id: message.order.id,
				status: ORDER_STATUS.IN_PROGRESS.toUpperCase(),
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
						end: fulfillment.end,
						type: "Delivery",
						start: fulfillment.start,
						// stops: fulfillment.stops.map((stop: Stop) => {
						// 	const demoObj = {
						// 		...stop,
						// 		id: undefined,
						// 		authorization: stop.authorization
						// 			? {
						// 					...stop.authorization,
						// 					status: FULFILLMENT_LABELS.CONFIRMED,
						// 			  }
						// 			: undefined,
						// 		person: stop.person ? stop.person : stop.customer?.person,
						// 	};
						// 	if (stop.type === "start") {
						// 		return {
						// 			...demoObj,
						// 			location: {
						// 				...stop.location,
						// 				descriptor: {
						// 					...stop.location?.descriptor,
						// 					images: [{ url: "https://gf-integration/images/5.png" }],
						// 				},
						// 			},
						// 		};
						// 	}
						// 	return demoObj;
						// }),
						// rateable: undefined,
					})
				),
				quote: message.order.quote,
				payments: message.order.payment,
				created_at: message.order.created_at,
				updated_at: message.order.updated_at,
			},
		};

		switch (scenario) {
			case AGRI_STATUS_OBJECT.CREATED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code = "Pending";
						// fulfillment.stops.forEach((stop: Stop) =>
						// 	stop?.authorization ? (stop.authorization = undefined) : undefined
						// );
					}
				);
				break;
			case AGRI_STATUS_OBJECT.PACKED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.PACKED;
						// fulfillment.stops.forEach((stop: Stop) =>
						// 	stop?.authorization
						// 		? (stop.authorization = {
						// 				...stop.authorization,
						// 				status: "valid",
						// 		  })
						// 		: undefined
						// );
					}
				);
				break;
			case AGRI_STATUS_OBJECT.AGENT_ASSIGNED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.AGENT_ASSIGNED;
					}
				);
				break;
			case AGRI_STATUS_OBJECT.ORDER_PICKED_UP:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.ORDER_PICKED_UP;
					}
				);
				break;
			case AGRI_STATUS_OBJECT.OUT_FOR_DELIVERY:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.OUT_FOR_DELIVERY;
						// fulfillment.stops.forEach((stop: Stop) =>
						// 	stop?.authorization ? (stop.authorization = undefined) : undefined
						// );
					}
				);
				break;
			case AGRI_STATUS_OBJECT.DELIVERED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.DELIVERED;
					}
				);
				break;
				responseMessage.order.status = "Cancelled";
				break;
			default: //service started is the default case
				break;
		}


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
			"agri"
		);

		const onStatusCreated = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "Pending" // modify the code to "created"
						}
					}
				}))
			}
		};
		const onStatusPacked = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "PACKED" // modify the code to "created"
						}
					}
				}))
			}
		}
		const onStatusAgent_Assigned = {
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
				}))
			}
		}
		const onStatusOrderPickedUp = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "ORDER_PICKED_UP" // modify the code to "created"
						}
					}
				}))
			}
		}
		const onStatusOrderOutForDelivery = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "ORDER_OUT_FOR_DELIVERY" // modify the code to "created"
						}
					}
				}))
			}
		}
		const onStatusOrderDelivered = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "DELIVERED" // modify the code to "created"
						}
					}
				}))
			}
		}

		// let i = 1;
		// let counter = 0; // Track number of requests sent
		// const maxRequests = 5;
		// let interval = setInterval(async () => {
		// 	if (i >= 2) {
		// 		clearInterval(interval);
		// 	}
		// 	// context.message_id = uuidv4();
		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusCreated,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/")
		// 				? "on_status"
		// 				: "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusPacked,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusAgent_Assigned,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusOrderPickedUp,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusOrderOutForDelivery,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusOrderDelivered,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);
		// 	i++;
		// }, 1000);


		let i = 0; // Start with 1
		const maxRequests = 5; // Set the number of requests you want to make

		// Create an async function to handle sending the requests
		async function sendRequests() {
			// Send the requests one after another
			try {
				// First request (onStatusCreated)
				// await childOrderResponseBuilder(
				// 	i,
				// 	res,
				// 	context,
				// 	onStatusCreated,
				// 	`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				// 	}`,
				// 	"on_status"
				// );

				// Second request (onStatusPacked)
				// Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusPacked,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Third request (onStatusAgent_Assigned)
				// Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusAgent_Assigned,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Fourth request (onStatusOrderPickedUp)
				// Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderPickedUp,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Fifth request (onStatusOrderOutForDelivery)
				// Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderOutForDelivery,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Sixth request (onStatusOrderDelivered)
				// Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderDelivered,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

			} catch (error) {
				// If any request fails, catch the error and log it
				console.error("Error occurred while sending requests:", error);
			}
		}

		// Call the function once to send all the requests
		sendRequests();


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

export const statusAgriOutputRequest = async (
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

		console.log("fulfilmentsss",JSON.stringify(message.order.fulfillments[0].stops[0]))

		const responseMessage: any = {
			order: {
				id: message.order.id,
				status: "In-Progress",
				provider: {
					...message.order.provider,
				},
				items: [{
					...message.order.items[0], price: {
						currency: "INR",
						maximum_value: "280.00",
						offered_value: "250.00"
					}
				}],
				billing: { ...message.order.billing, tax_id: "XXXXXXXXXXXXXXX" },
				fulfillments: message.order.fulfillments.map(
					(fulfillment: Fulfillment) => ({
						...fulfillment,
						id: fulfillment.id,
						state: {
							descriptor: {
								code: "Accepted",
							},
						},
						stops: [{...fulfillment.stops[0],person:{name:"Ramu"},"authorization": {
                "type": "OTP",
                "token": "1234",
                "valid_from": "2024-06-10T22:00:00Z",
                "valid_to": "2024-06-10T23:00:00Z",
                "status": "valid"
              },
			  "contact": {
                "phone": "9886098860",
                "email": "nobody@nomail.com"
              },
			}],
						rateable: true
					})
				),
				quote: message.order.quote,
				payments: message.order.payments,
				documents: [
					{
						"url": "https://invoice_url",
						"label": "INVOICE"
					}
				],
				created_at: message.order.created_at,
				updated_at: message.order.updated_at,
			},
		};

		
		console.log("on_Status", JSON.stringify(responseMessage.order))
		// const onStatusAccepted = {
		// 	...responseMessage, // spread the entire response
		// 	order: {
		// 		...responseMessage.order, // spread message to retain its content
		// 		fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
		// 			...fulfillment, // spread the fulfillment object
		// 			state: {
		// 				...fulfillment.state, // spread state to retain other state details
		// 				descriptor: {
		// 					...fulfillment.state.descriptor, // spread descriptor to modify only the code
		// 					code: "ACCEPTED" // modify the code to "created"
		// 				}
		// 			}
		// 		})),
		// 		items:responseMessage.order.items.map((itm:any)=>(
		// 			{
		// 				...itm,
		// 				tags: [
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BAP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BPP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "COMMODITY_SPECIFICATION"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_MIME_TYPE"
        //           },
        //           value: "application/pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_COPY"
        //           },
        //           value: "https://abc.com/commodity_specification.pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "SHELF_LIFE"
        //           },
        //           value: "P10M"
        //         },
        //         {
        //           descriptor: {
        //             code: "MOISTURE"
        //           },
        //           value: "10%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FOREIGN_MATTER"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OIL_CONTENT"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "DEFECTIVES"
        //           },
        //           value: "7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OTHER_EDIBLE_GRAINS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "URIC_ACID"
        //           },
        //           value: "101"
        //         },
        //         {
        //           descriptor: {
        //             code: "AFLATOXIN"
        //           },
        //           value: "15"
        //         },
        //         {
        //           descriptor: {
        //             code: "ARGEMONE_SEEDS"
        //           },
        //           value: "Yes"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE_MEASURE"
        //           },
        //           value: "Diameter"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE"
        //           },
        //           value: "15-18"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_DEFECTS"
        //           },
        //           value: "1.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_WASTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_VALUE"
        //           },
        //           value: "50"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_UNIT"
        //           },
        //           value: "gm"
        //         },
        //         {
        //           descriptor: {
        //             code: "VISIBLE_COLOUR"
        //           },
        //           value: "Brown"
        //         },
        //         {
        //           descriptor: {
        //             code: "COLOUR_PERCENTAGE"
        //           },
        //           value: ">=70%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_SOLUBLE_SOLIDS"
        //           },
        //           value: "16 degree Brix"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRACES_OF_SOIL"
        //           },
        //           value: "Sight traces"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOLATILE_OIL"
        //           },
        //           value: "<=2.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_ASH"
        //           },
        //           value: "<=7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
        //           },
        //           value: "5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "MIN_FLOWER_PER_STEM"
        //           },
        //           value: "1"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_VALUE"
        //           },
        //           value: "<=6"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "BLOOMING_AND_SHAPE"
        //           },
        //           value: ">=85%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_VALUE"
        //           },
        //           value: "3.45"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_VALUE"
        //           },
        //           value: "28‑30"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_UNIT"
        //           },
        //           value: "mm"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRASH_PERCENTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNDLE_STRENGTH"
        //           },
        //           value: ">=24.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "MICRONAIRE"
        //           },
        //           value: "2.8-3.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_MATURED_FIBERS"
        //           },
        //           value: ">=70.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIEVE_ANALYSIS"
        //           },
        //           value: "98"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_VALUE"
        //           },
        //           value: "210"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_UNIT"
        //           },
        //           value: "kg"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOID_NUTS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "IMMATURE_NUTS"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "STRENGTH"
        //           },
        //           value: "Excellent"
        //         },
        //         {
        //           descriptor: {
        //             code: "FINENESS"
        //           },
        //           value: "10"
        //         }
        //       ]
        //     }
        //   ]
		// 			}
		// 		)
		// 		)
		// 	}
		// };
		// const onStatusPacked = {
		// 	...responseMessage, // spread the entire response
		// 	order: {
		// 		...responseMessage.order, // spread message to retain its content
		// 		fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
		// 			...fulfillment, // spread the fulfillment object
		// 			state: {
		// 				...fulfillment.state, // spread state to retain other state details
		// 				descriptor: {
		// 					...fulfillment.state.descriptor, // spread descriptor to modify only the code
		// 					code: "PACKED" // modify the code to "created"
		// 				}
		// 			}
		// 		})),
		// 		items:responseMessage.order.items.map((itm:any)=>(
		// 			{
		// 				...itm,
		// 				tags: [
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BAP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BPP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "COMMODITY_SPECIFICATION"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_MIME_TYPE"
        //           },
        //           value: "application/pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_COPY"
        //           },
        //           value: "https://abc.com/commodity_specification.pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "SHELF_LIFE"
        //           },
        //           value: "P10M"
        //         },
        //         {
        //           descriptor: {
        //             code: "MOISTURE"
        //           },
        //           value: "10%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FOREIGN_MATTER"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OIL_CONTENT"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "DEFECTIVES"
        //           },
        //           value: "7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OTHER_EDIBLE_GRAINS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "URIC_ACID"
        //           },
        //           value: "101"
        //         },
        //         {
        //           descriptor: {
        //             code: "AFLATOXIN"
        //           },
        //           value: "15"
        //         },
        //         {
        //           descriptor: {
        //             code: "ARGEMONE_SEEDS"
        //           },
        //           value: "Yes"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE_MEASURE"
        //           },
        //           value: "Diameter"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE"
        //           },
        //           value: "15-18"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_DEFECTS"
        //           },
        //           value: "1.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_WASTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_VALUE"
        //           },
        //           value: "50"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_UNIT"
        //           },
        //           value: "gm"
        //         },
        //         {
        //           descriptor: {
        //             code: "VISIBLE_COLOUR"
        //           },
        //           value: "Brown"
        //         },
        //         {
        //           descriptor: {
        //             code: "COLOUR_PERCENTAGE"
        //           },
        //           value: ">=70%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_SOLUBLE_SOLIDS"
        //           },
        //           value: "16 degree Brix"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRACES_OF_SOIL"
        //           },
        //           value: "Sight traces"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOLATILE_OIL"
        //           },
        //           value: "<=2.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_ASH"
        //           },
        //           value: "<=7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
        //           },
        //           value: "5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "MIN_FLOWER_PER_STEM"
        //           },
        //           value: "1"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_VALUE"
        //           },
        //           value: "<=6"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "BLOOMING_AND_SHAPE"
        //           },
        //           value: ">=85%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_VALUE"
        //           },
        //           value: "3.45"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_VALUE"
        //           },
        //           value: "28‑30"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_UNIT"
        //           },
        //           value: "mm"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRASH_PERCENTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNDLE_STRENGTH"
        //           },
        //           value: ">=24.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "MICRONAIRE"
        //           },
        //           value: "2.8-3.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_MATURED_FIBERS"
        //           },
        //           value: ">=70.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIEVE_ANALYSIS"
        //           },
        //           value: "98"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_VALUE"
        //           },
        //           value: "210"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_UNIT"
        //           },
        //           value: "kg"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOID_NUTS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "IMMATURE_NUTS"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "STRENGTH"
        //           },
        //           value: "Excellent"
        //         },
        //         {
        //           descriptor: {
        //             code: "FINENESS"
        //           },
        //           value: "10"
        //         }
        //       ]
        //     }
        //   ]
		// 			}
		// 		)
		// 		)
		// 	}
		// }
		// const onStatusOrderPickedUp = {
		// 	...responseMessage, // spread the entire response
		// 	order: {
		// 		...responseMessage.order, // spread message to retain its content
		// 		fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
		// 			...fulfillment, // spread the fulfillment object
		// 			state: {
		// 				...fulfillment.state, // spread state to retain other state details
		// 				descriptor: {
		// 					...fulfillment.state.descriptor, // spread descriptor to modify only the code
		// 					code: "ORDER_PICKED_UP" // modify the code to "created"
		// 				}
		// 			}
		// 		})),
		// 		items:responseMessage.order.items.map((itm:any)=>(
		// 			{
		// 				...itm,
		// 				tags: [
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BAP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BPP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "COMMODITY_SPECIFICATION"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_MIME_TYPE"
        //           },
        //           value: "application/pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_COPY"
        //           },
        //           value: "https://abc.com/commodity_specification.pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "SHELF_LIFE"
        //           },
        //           value: "P10M"
        //         },
        //         {
        //           descriptor: {
        //             code: "MOISTURE"
        //           },
        //           value: "10%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FOREIGN_MATTER"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OIL_CONTENT"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "DEFECTIVES"
        //           },
        //           value: "7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OTHER_EDIBLE_GRAINS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "URIC_ACID"
        //           },
        //           value: "101"
        //         },
        //         {
        //           descriptor: {
        //             code: "AFLATOXIN"
        //           },
        //           value: "15"
        //         },
        //         {
        //           descriptor: {
        //             code: "ARGEMONE_SEEDS"
        //           },
        //           value: "Yes"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE_MEASURE"
        //           },
        //           value: "Diameter"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE"
        //           },
        //           value: "15-18"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_DEFECTS"
        //           },
        //           value: "1.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_WASTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_VALUE"
        //           },
        //           value: "50"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_UNIT"
        //           },
        //           value: "gm"
        //         },
        //         {
        //           descriptor: {
        //             code: "VISIBLE_COLOUR"
        //           },
        //           value: "Brown"
        //         },
        //         {
        //           descriptor: {
        //             code: "COLOUR_PERCENTAGE"
        //           },
        //           value: ">=70%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_SOLUBLE_SOLIDS"
        //           },
        //           value: "16 degree Brix"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRACES_OF_SOIL"
        //           },
        //           value: "Sight traces"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOLATILE_OIL"
        //           },
        //           value: "<=2.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_ASH"
        //           },
        //           value: "<=7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
        //           },
        //           value: "5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "MIN_FLOWER_PER_STEM"
        //           },
        //           value: "1"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_VALUE"
        //           },
        //           value: "<=6"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "BLOOMING_AND_SHAPE"
        //           },
        //           value: ">=85%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_VALUE"
        //           },
        //           value: "3.45"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_VALUE"
        //           },
        //           value: "28‑30"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_UNIT"
        //           },
        //           value: "mm"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRASH_PERCENTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNDLE_STRENGTH"
        //           },
        //           value: ">=24.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "MICRONAIRE"
        //           },
        //           value: "2.8-3.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_MATURED_FIBERS"
        //           },
        //           value: ">=70.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIEVE_ANALYSIS"
        //           },
        //           value: "98"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_VALUE"
        //           },
        //           value: "210"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_UNIT"
        //           },
        //           value: "kg"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOID_NUTS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "IMMATURE_NUTS"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "STRENGTH"
        //           },
        //           value: "Excellent"
        //         },
        //         {
        //           descriptor: {
        //             code: "FINENESS"
        //           },
        //           value: "10"
        //         }
        //       ]
        //     }
        //   ]
		// 			}
		// 		)
		// 		)
		// 	}
		// }
		// const onStatusInTransit = {
		// 	...responseMessage, // spread the entire response
		// 	order: {
		// 		...responseMessage.order, // spread message to retain its content
		// 		fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
		// 			...fulfillment, // spread the fulfillment object
		// 			state: {
		// 				...fulfillment.state, // spread state to retain other state details
		// 				descriptor: {
		// 					...fulfillment.state.descriptor, // spread descriptor to modify only the code
		// 					code: "ORDER_OUT_FOR_DELIVERY" // modify the code to "created"
		// 				}
		// 			}
		// 		})),
		// 		items:responseMessage.order.items.map((itm:any)=>(
		// 			{
		// 				...itm,
		// 				tags: [
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BAP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BPP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "COMMODITY_SPECIFICATION"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_MIME_TYPE"
        //           },
        //           value: "application/pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_COPY"
        //           },
        //           value: "https://abc.com/commodity_specification.pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "SHELF_LIFE"
        //           },
        //           value: "P10M"
        //         },
        //         {
        //           descriptor: {
        //             code: "MOISTURE"
        //           },
        //           value: "10%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FOREIGN_MATTER"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OIL_CONTENT"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "DEFECTIVES"
        //           },
        //           value: "7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OTHER_EDIBLE_GRAINS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "URIC_ACID"
        //           },
        //           value: "101"
        //         },
        //         {
        //           descriptor: {
        //             code: "AFLATOXIN"
        //           },
        //           value: "15"
        //         },
        //         {
        //           descriptor: {
        //             code: "ARGEMONE_SEEDS"
        //           },
        //           value: "Yes"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE_MEASURE"
        //           },
        //           value: "Diameter"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE"
        //           },
        //           value: "15-18"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_DEFECTS"
        //           },
        //           value: "1.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_WASTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_VALUE"
        //           },
        //           value: "50"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_UNIT"
        //           },
        //           value: "gm"
        //         },
        //         {
        //           descriptor: {
        //             code: "VISIBLE_COLOUR"
        //           },
        //           value: "Brown"
        //         },
        //         {
        //           descriptor: {
        //             code: "COLOUR_PERCENTAGE"
        //           },
        //           value: ">=70%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_SOLUBLE_SOLIDS"
        //           },
        //           value: "16 degree Brix"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRACES_OF_SOIL"
        //           },
        //           value: "Sight traces"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOLATILE_OIL"
        //           },
        //           value: "<=2.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_ASH"
        //           },
        //           value: "<=7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
        //           },
        //           value: "5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "MIN_FLOWER_PER_STEM"
        //           },
        //           value: "1"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_VALUE"
        //           },
        //           value: "<=6"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "BLOOMING_AND_SHAPE"
        //           },
        //           value: ">=85%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_VALUE"
        //           },
        //           value: "3.45"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_VALUE"
        //           },
        //           value: "28‑30"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_UNIT"
        //           },
        //           value: "mm"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRASH_PERCENTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNDLE_STRENGTH"
        //           },
        //           value: ">=24.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "MICRONAIRE"
        //           },
        //           value: "2.8-3.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_MATURED_FIBERS"
        //           },
        //           value: ">=70.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIEVE_ANALYSIS"
        //           },
        //           value: "98"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_VALUE"
        //           },
        //           value: "210"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_UNIT"
        //           },
        //           value: "kg"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOID_NUTS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "IMMATURE_NUTS"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "STRENGTH"
        //           },
        //           value: "Excellent"
        //         },
        //         {
        //           descriptor: {
        //             code: "FINENESS"
        //           },
        //           value: "10"
        //         }
        //       ]
        //     }
        //   ]
		// 			}
		// 		)
		// 		)
				
		// 	}
		// }
		// const onStatusCompleted = {
		// 	...responseMessage, // spread the entire response
		// 	order: {
		// 		...responseMessage.order, // spread message to retain its content
		// 		fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
		// 			...fulfillment, // spread the fulfillment object
		// 			state: {
		// 				...fulfillment.state, // spread state to retain other state details
		// 				descriptor: {
		// 					...fulfillment.state.descriptor, // spread descriptor to modify only the code
		// 					code: "DELIVERED" // modify the code to "created"
		// 				}
		// 			}
		// 		})),
		// 		items:responseMessage.order.items.map((itm:any)=>(
		// 			{
		// 				...itm,
		// 				tags: [
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BAP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "NEGOTIATION_BPP"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "items.price.value"
        //           },
        //           value: "270.00"
        //         },
        //         {
        //           descriptor: {
        //             code: "items.tags.commodity_specification.moisture"
        //           },
        //           value: "4%"
        //         }
        //       ]
        //     },
        //     {
        //       descriptor: {
        //         code: "COMMODITY_SPECIFICATION"
        //       },
        //       list: [
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_MIME_TYPE"
        //           },
        //           value: "application/pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "REFERENCE_DOCS_COPY"
        //           },
        //           value: "https://abc.com/commodity_specification.pdf"
        //         },
        //         {
        //           descriptor: {
        //             code: "SHELF_LIFE"
        //           },
        //           value: "P10M"
        //         },
        //         {
        //           descriptor: {
        //             code: "MOISTURE"
        //           },
        //           value: "10%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FOREIGN_MATTER"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OIL_CONTENT"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "DEFECTIVES"
        //           },
        //           value: "7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "OTHER_EDIBLE_GRAINS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "URIC_ACID"
        //           },
        //           value: "101"
        //         },
        //         {
        //           descriptor: {
        //             code: "AFLATOXIN"
        //           },
        //           value: "15"
        //         },
        //         {
        //           descriptor: {
        //             code: "ARGEMONE_SEEDS"
        //           },
        //           value: "Yes"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE_MEASURE"
        //           },
        //           value: "Diameter"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIZE_RANGE"
        //           },
        //           value: "15-18"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_DEFECTS"
        //           },
        //           value: "1.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_WASTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_VALUE"
        //           },
        //           value: "50"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNCH_SIZE_UNIT"
        //           },
        //           value: "gm"
        //         },
        //         {
        //           descriptor: {
        //             code: "VISIBLE_COLOUR"
        //           },
        //           value: "Brown"
        //         },
        //         {
        //           descriptor: {
        //             code: "COLOUR_PERCENTAGE"
        //           },
        //           value: ">=70%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_SOLUBLE_SOLIDS"
        //           },
        //           value: "16 degree Brix"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRACES_OF_SOIL"
        //           },
        //           value: "Sight traces"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOLATILE_OIL"
        //           },
        //           value: "<=2.5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "TOTAL_ASH"
        //           },
        //           value: "<=7%"
        //         },
        //         {
        //           descriptor: {
        //             code: "CORIANDER_SPLIT_SEEDS_PERCENTAGE"
        //           },
        //           value: "5%"
        //         },
        //         {
        //           descriptor: {
        //             code: "MIN_FLOWER_PER_STEM"
        //           },
        //           value: "1"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_VALUE"
        //           },
        //           value: "<=6"
        //         },
        //         {
        //           descriptor: {
        //             code: "GIRTH_AT_THIN_END_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "BLOOMING_AND_SHAPE"
        //           },
        //           value: ">=85%"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_VALUE"
        //           },
        //           value: "3.45"
        //         },
        //         {
        //           descriptor: {
        //             code: "FLOWER_DIAMETER_UNIT"
        //           },
        //           value: "cm"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_VALUE"
        //           },
        //           value: "28‑30"
        //         },
        //         {
        //           descriptor: {
        //             code: "STAPLE_LENGTH_OF_COTTON_UNIT"
        //           },
        //           value: "mm"
        //         },
        //         {
        //           descriptor: {
        //             code: "TRASH_PERCENTAGE"
        //           },
        //           value: "3%"
        //         },
        //         {
        //           descriptor: {
        //             code: "BUNDLE_STRENGTH"
        //           },
        //           value: ">=24.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "MICRONAIRE"
        //           },
        //           value: "2.8-3.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "PERCENTAGE_OF_MATURED_FIBERS"
        //           },
        //           value: ">=70.0"
        //         },
        //         {
        //           descriptor: {
        //             code: "SIEVE_ANALYSIS"
        //           },
        //           value: "98"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_VALUE"
        //           },
        //           value: "210"
        //         },
        //         {
        //           descriptor: {
        //             code: "NUMBER_OF_NUTS_UNIT"
        //           },
        //           value: "kg"
        //         },
        //         {
        //           descriptor: {
        //             code: "VOID_NUTS"
        //           },
        //           value: "1%"
        //         },
        //         {
        //           descriptor: {
        //             code: "IMMATURE_NUTS"
        //           },
        //           value: "2%"
        //         },
        //         {
        //           descriptor: {
        //             code: "STRENGTH"
        //           },
        //           value: "Excellent"
        //         },
        //         {
        //           descriptor: {
        //             code: "FINENESS"
        //           },
        //           value: "10"
        //         }
        //       ]
        //     }
        //   ]
		// 			}
		// 		)
		// 		)
		// 	}
		// }


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
			"agri"
		);
		// let i = 0; 
		// async function sendRequests() {
		// 	// Send the requests one after another
		// 	try {
		// 		// Third request (onStatusAgent_Assigned)
		// 		// Increment for the next request
		// 		await childOrderResponseBuilder(
		// 			i,
		// 			res,
		// 			context,
		// 			onStatusPacked,
		// 			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 			}`,
		// 			"on_status"
		// 		);

		// 		// Fourth request (onStatusOrderPickedUp)
		// 		// Increment for the next request
		// 		await childOrderResponseBuilder(
		// 			i,
		// 			res,
		// 			context,
		// 			onStatusOrderPickedUp,
		// 			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 			}`,
		// 			"on_status"
		// 		);

		// 		// Fifth request (onStatusOrderOutForDelivery)
		// 		// Increment for the next request
		// 		await childOrderResponseBuilder(
		// 			i,
		// 			res,
		// 			context,
		// 			onStatusInTransit,
		// 			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 			}`,
		// 			"on_status"
		// 		);

		// 		// Sixth request (onStatusOrderDelivered)
		// 		// Increment for the next request
		// 		await childOrderResponseBuilder(
		// 			i,
		// 			res,
		// 			context,
		// 			onStatusCompleted,
		// 			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 			}`,
		// 			"on_status"
		// 		);

		// 	} catch (error) {
		// 		// If any request fails, catch the error and log it
		// 		console.error("Error occurred while sending requests:", error);
		// 	}
		// }

		// // Call the function once to send all the requests
		// sendRequests();

	}
	catch (error) {
		return next(error)
	}
}