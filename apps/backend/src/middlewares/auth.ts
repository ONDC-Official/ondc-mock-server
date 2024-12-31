import { NextFunction, Request, Response } from "express";
import { verifyHeader } from "../lib/utils/auth";
import { Locals } from "../interfaces";
import { B2B_BAP_MOCKSERVER_URL, logger } from "../lib/utils";

export const authValidatorMiddleware = async (
	req: Request,
	res: Response<{}, Locals>,
	next: NextFunction
) => {
	try {
		// console.log("====>",req.headers)
		const mode = req.query.mode as string;
		res.setHeader("mode", mode ? mode : "sandbox");
		if (
			mode === "mock" 
			||
			(req.body.context.bap_uri === B2B_BAP_MOCKSERVER_URL &&
				req.body.context.action === "search")
		) {
			next(); //skipping auth header validation in "mock" mode
			return;
		} else {
			const auth_header = req.headers["authorization"] || "";
			 let env;
			// const valid=(req as any).rawBody.toString()
			
		const part=req.body.context.domain.split(":")
		const includesLOGorRET = part.some((part:any) => part.includes("LOG") || part.includes("RET"));
			if(includesLOGorRET){
				env=req.headers["environment"] ||""
				// console.log("============>",req.headers)
			}
			let verified = await verifyHeader(auth_header, (req as any).rawBody.toString(),env as string);

			if (!verified) {
				return res.status(401).json({
					message: {
						ack: {
							status: "NACK",
						},
					},
					error: {
						message: "Authentication failed",
					},
				});
			}
			next();
		}
	} catch (err) {
		logger.error(err)
		return res.status(401).json({
			message: {
				ack: {
					status: "NACK",
				},
			},
			error: {
				message: "Authentication failed",
			},
		});
	}
};
