import { logger } from "../../lib/utils";
import { checkAgriHealth, checkFrontendHealth, checkLogisticsHealth, checkRedis, checkRetailHealth, checkServicesHealth } from "../../lib/utils/health";

export const healthInfoDetailed = async (req: Request, res: any) => {
	try {
		const [redis, agri, retail, services, logistics ,frontend] = await Promise.all([
			checkRedis(),
			checkAgriHealth(),
			checkRetailHealth(),
			checkServicesHealth(),
			checkLogisticsHealth(),
			checkFrontendHealth()
		]);

		const healthResults = { redis, agri, retail, services, logistics, frontend };
		const allOk = Object.values(healthResults).every(status => status === "Server is Up");
    
    const payload = {
			status: allOk ? "Server is good" : "Server is down",
			services: healthResults,
			timestamp: new Date().toISOString(),
		}

		res.status(allOk ? 200 : 299).json(JSON.stringify(payload));
	} catch (error) {
		logger.error("Health check failed", error);
		res.status(500).json({
			status: "fail",
			error: "Unhandled exception in health check",
			timestamp: new Date().toISOString(),
		});
	}
};