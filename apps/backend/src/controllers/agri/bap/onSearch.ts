import { NextFunction, Request, Response } from "express";
import { logger, responseBuilder } from "../../../lib/utils";

export const onSearchController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		onSearchSelectionController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

const onSearchSelectionController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message } = req.body;
		const resposneMessage = message;
		logger.info(`${context.bpp_uri}`)
		return responseBuilder(
			res,
			next,
			context,
			resposneMessage,
			`${context.bpp_uri}${
				context.bpp_uri.endsWith("/") ? "select" : "/select"
			}`,
			`select`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};
