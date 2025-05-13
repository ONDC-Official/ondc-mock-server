// lib/utils/healthChecks.ts
import axios from "axios";
import { redis } from "./redis";

async function ping(url: string): Promise<"ok" | "fail"> {
	try {
		const res = await axios.get(url, { timeout: 2000 });
		return res.status === 200 ? "ok" : "fail";
	} catch {
		return "fail";
	}
}

export async function checkRedis(): Promise<"ok" | "fail"> {
	try {
		await redis.ping();
		return "ok";
	} catch {
		return "fail";
	}
}

const BASE_URL = process.env.MOCK_API_BASE_URL || "https://mock.ondc.org/api/";
export const checkAgriHealth = () => ping(`${BASE_URL}/agri/ping`);
export const checkRetailHealth = () => ping(`${BASE_URL}/retail/ping`);
export const checkServicesHealth = () => ping(`${BASE_URL}/services/ping`);
export const checkLogisticsHealth = () => ping(`${BASE_URL}/logistics/ping`);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://mock.ondc.org";

export async function checkFrontendHealth(): Promise<"ok" | "fail"> {
  try {
    const res = await axios.get(`${FRONTEND_URL}/`, { timeout: 2000 });

    if (res.status === 200 && res.data.includes("<html")) {
      return "ok";
    }

    return "fail";
  } catch {
    return "fail";
  }
}