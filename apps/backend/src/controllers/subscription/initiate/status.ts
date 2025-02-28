import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	send_response,
	send_nack,
	redisFetchToServer,
	redis,
	SUBSCRIPTION_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";

import { v4 as uuidv4 } from "uuid";
import {
	PRINT_MEDIA_STATUS,
} from "../../../lib/utils/apiConstants";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";

let senarios: string[] = PRINT_MEDIA_STATUS;

export const initiateStatusController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;
		const transactionKeys = await redis.keys(`${transactionId}-*`);
		const on_confirm = await redisFetchToServer(
			ON_ACTION_KEY.ON_CONFIRM,
			transactionId
		);
		if (!on_confirm) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}
		const statusIndex = transactionKeys.filter((e) =>
			e.includes("-status-to-server")
		).length;
		return intializeRequest(res, next, on_confirm, statusIndex);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	statusIndex: number
) => {
	try {
		const { context } = transaction;
		const { transaction_id } = context;

		const status = {
			context: {
				...context,
				message_id: uuidv4(),
				timestamp: new Date().toISOString(),
				action: "status",
				bap_id: MOCKSERVER_ID,
				bap_uri: SUBSCRIPTION_BAP_MOCKSERVER_URL,
			},
			message: {
				order_id: transaction.message.order.id,
			},
		};
	
	// satus index is always witin boundary of senarios array
		statusIndex = Math.min(Math.max(statusIndex, 0), senarios.length - 1);

		await send_response(
			res,
			next,
			status,
			transaction_id,
			"status",
			""
			// senarios[statusIndex]
		);
		
	} catch (error) {
		next(error);
	}
};
