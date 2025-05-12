import { Router } from "express";
import { checkAgriHealth, checkLogisticsHealth, checkRedis, checkRetailHealth, checkServicesHealth } from "../../lib/utils/health";
import { logger } from "../../lib/utils";

export const healthController = async (req: Request, res: any) => {
	try {
		const [redis, agri, retail, services, logistics] = await Promise.all([
			checkRedis(),
			checkAgriHealth(),
			checkRetailHealth(),
			checkServicesHealth(),
			checkLogisticsHealth(),
		]);

		const healthResults = { redis, agri, retail, services, logistics };
		const allOk = Object.values(healthResults).every(status => status === "ok");

		res.status(allOk ? 200 : 500).json({
			status: allOk ? "ok" : "fail",
			services: healthResults,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		logger.error("Health check failed", error);
		res.status(500).json({
			status: "fail",
			error: "Unhandled exception in health check",
			timestamp: new Date().toISOString(),
		});
	}
};