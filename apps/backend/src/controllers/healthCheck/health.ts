import { logger } from "../../lib/utils";

export const health = async (req: Request, res: any) => {
	try {
		const payload = {
			msg: "the health api is working fine"
		};
		return res.status(200).json(JSON.stringify(payload));
	} catch (error) {
		logger.error("Health check failed", error);
		res.status(299).json({
			status: "fail",
			error: "Unhandled exception in health check",
			timestamp: new Date().toISOString(),
		});
	}
};