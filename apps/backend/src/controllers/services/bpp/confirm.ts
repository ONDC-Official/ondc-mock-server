import { NextFunction, Request, Response } from "express";
import { checkIfCustomized, redisFetchFromServer, responseBuilder, send_nack, Stop, updateFulfillments } from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ORDER_STATUS, SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";

export const confirmController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (checkIfCustomized(req.body.message.order?.items)) {
      return confirmServiceCustomizationController(req, res, next);
    }
    confirmConsultationController(req, res, next);	} catch (error) {
		return next(error);
	}
};

export const confirmConsultationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			message: { order },
		} = req.body;

		const on_init = await redisFetchFromServer(ON_ACTION_KEY.ON_INIT, context?.transaction_id);

		if (on_init && on_init?.error) {
			return send_nack(res, on_init?.error?.message?on_init?.error?.message:ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED)
		}

		if (!on_init) {
			return send_nack(res, ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED)
		}

		const { fulfillments } = order;
    console.log("fulfillments",fulfillments)
		let updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_CONFIRM,
		);
    if(context.domain===SERVICES_DOMAINS.ASTRO_SERVICE){
       updatedFulfillments = updateFulfillments(
        fulfillments,
        ON_ACTION_KEY?.ON_CONFIRM,
        "",
        "astroService"
      );
    }
    if(context.domain===SERVICES_DOMAINS.WEIGHMENT){
      updatedFulfillments = updateFulfillments(
       fulfillments,
       ON_ACTION_KEY?.ON_CONFIRM,
       "",
       "weightment"
     );
   }

		const responseMessage = {
			order: {
				...order,
				status: (context.domain===SERVICES_DOMAINS.SERVICES)?ORDER_STATUS.ACCEPTED.toUpperCase():ORDER_STATUS.ACCEPTED,
				fulfillments: updatedFulfillments,
				provider: {
					...order.provider,
					rateable: true,
				},
        payments:(context.domain===SERVICES_DOMAINS.WEIGHMENT)?[order.payments[0]]:order.payments
			},
		};
    
    if(context.domain===SERVICES_DOMAINS.ASTRO_SERVICE||context.domain===SERVICES_DOMAINS.WEIGHMENT){
      delete responseMessage.order.payments[0].params.transaction_id
     
    }
    if(context.domain===SERVICES_DOMAINS.AGRI_EQUIPMENT){
      responseMessage.order.cancellation_terms=[
        {
          "fulfillment_state": {
            "descriptor": {
              "code": "PENDING",
              "short_desc": "002"
            }
          },
          "cancellation_fee": {
            "percentage": "0.00",
            "amount": {
              "currency": "INR",
              "value": "0.00"
            }
          }
        },
        {
          "fulfillment_state": {
            "descriptor": {
              "code": "IN_TRANSIT",
              "short_desc": "002"
            }
          },
          "cancellation_fee": {
            "percentage": "0.00",
            "amount": {
              "currency": "INR",
              "value": "0.00"
            }
          }
        },
        {
          "fulfillment_state": {
            "descriptor": {
              "code": "AT_LOCATION",
              "short_desc": "002"
            }
          },
          "cancellation_fee": {
            "percentage": "0.00",
            "amount": {
              "currency": "INR",
              "value": "0.00"
            }
          }
        }
      ]
      responseMessage.order.fulfillments=[{...responseMessage.order.fulfillments[0],tracking:false}]
    }

    console.log("responseMEssageatonconfm",JSON.stringify(responseMessage))

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? ON_ACTION_KEY.ON_CONFIRM : `/${ON_ACTION_KEY.ON_CONFIRM}`
			}`,
			`${ON_ACTION_KEY.ON_CONFIRM}`,
			"services"
		);
	} catch (error) {
		next(error);
	}
};

export const confirmServiceCustomizationController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      context,
      message: { order },
    } = req.body;
    const { fulfillments } = order;
    const timestamp = new Date();
    const end_time = new Date(timestamp.getTime() + 30 * 60 * 1000);
    // const fulfillments = response.value.message.order.fulfillments

    context.action = "on_confirm";
    fulfillments[0].stops?.splice(0, 0, {
      id: "L1",
      type: "start",
      location: {
        id: "L1",
        descriptor: {
          name: "ABC Store",
        },
        gps: "12.956399,77.636803",
      },
      time: {
        range: {
          start: timestamp.toISOString(),
          end: end_time.toISOString(),
        },
      },
      contact: {
        phone: "9886098860",
        email: "nobody@nomail.com",
      },
      person: {
        name: "Kishan",
      },
    });
    fulfillments[0].stops.forEach((itm: Stop) => {
      if (itm.type === "end") {
        itm.id = "L2";
        itm.authorization = {
          type: "OTP",
          token: "1234",
          valid_from: "2023-11-16T09:30:00.000Z",
          valid_to: "2023-11-16T09:35:00.000Z",
          status: "valid",
        };
        itm.person = { name: itm?.customer?.person?.name || "" };
        itm.customer = undefined;
      }
    });
    const responseMessage = {
      order: {
        ...order,
        status: (context.domain===SERVICES_DOMAINS.SERVICES)?ORDER_STATUS.ACCEPTED.toUpperCase():ORDER_STATUS.ACCEPTED,
        provider: {
          ...order?.provider,
          rateable: true,
        },
        fulfillments: [
          {
            ...fulfillments[0],
            // state hard coded
            state: {
              descriptor: {
                code: "Pending",
              },
            },
            rateable: true,
            // stops:
          },
        ],
      },
    };
    return responseBuilder(
      res,
      next,
      context,
      responseMessage,
      `${req.body.context.bap_uri}${
        req.body.context.bap_uri.endsWith("/") ? "on_confirm" : "/on_confirm"
      }`,
      `on_confirm`,
      "services"
    );
  } catch (error) {
    return next(error);
  }
};