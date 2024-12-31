import { NextFunction, Request, Response } from "express";
import { SubscriberDetail } from "../interfaces";
import {  redis, split_auth_header } from "../lib/utils";
export const rateLimiter = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const mode = req.query.mode;
	if (process.env.RATE_LIMIT_MODE=== "true" && mode === "sandbox") {
		const header = req.headers["authorization"] || "";
		const parts = split_auth_header(header);
		if (!parts || Object.keys(parts).length === 0) {
			throw new Error("Header parsing failed");
		}

		const subscriber_id = parts["keyId"].split("|")[0] as string;
		const rateLimit = parseInt(process.env.RATE_LIMIT_24HR || "1000", 10);
		const redisKey = `${subscriber_id}-count`;
		try {
			const currentCount = await redis.get(redisKey);

			if (!currentCount) {
				// Key does not exist, set it with an initial value of 1 and an expiration of 24 hours
				await redis.set(redisKey, 1, "EX", 24 * 60 * 60); // Expire in 24 hours
				return next();
			}
	
			// Key exists, check the value
			const count = parseInt(currentCount, 10);
	
			if (count < rateLimit) {
				// Increment the count and allow the request
				await redis.incr(redisKey);
				return next();
			}
				else {
					// Rate limit exceeded
					return res.status(429).json({
						message: {
							ack: {
								status: "NACK",
							},
						},
						error: {
							message: "Rate Limit Exceeded",
						},
					});
				}
			}  catch (error) {
				console.error("Error in rate limiter:", error);
				return res.status(500).json({
					message: {
						ack: {
							status: "NACK",
						},
					},
					error: {
						message: "Internal Server Error",
					},
				});
		}
		// const unique_key_id = parts["keyId"].split("|")[1] as string;
		// const subscriber = await prisma.user.findFirst({
		// 	where: {
		// 		subscriber_id,
		// 	},
		// });
	// 	if (
	// 		new Date().getTime() - subscriber?.lastAccessed?.getTime()! <
	// 		24 * 60 * 60 * 1000
	// 	) {
	// 		if (subscriber?.accessCount! > parseInt(process.env.RATE_LIMIT_24HR!)) {
	// 			res.status(401).json({
	// 				message: {
	// 					ack: {
	// 						status: "NACK",
	// 					},
	// 				},
	// 				error: {
	// 					message: "Rate Limit Exceeded",
	// 				},
	// 			});
	// 		}
	// 	}
	 }
	next();
};
