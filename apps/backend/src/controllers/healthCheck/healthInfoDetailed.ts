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
		let responseText = "";

		for (const [key, value] of Object.entries(healthResults)) {
			const state = value === "Server is Up" ? "UP" : "DOWN";
			responseText += `${key.toLocaleUpperCase()}=${state}\n`;
		}

		responseText += `TIME=${new Date().toISOString()}`;

		res.setHeader("Content-Type", "text/plain");
		res.status(allOk ? 200 : 299).send(responseText);
	} catch (error) {
		logger.error("Health check failed", error);
		res.status(500).json({
			status: "fail",
			error: "Unhandled exception in health check",
			timestamp: new Date().toISOString(),
		});
	}
};