// lib/utils/healthChecks.ts
import axios from "axios";
import { redis } from "./redis";

async function ping(url: string): Promise<"Server is Up" | "Server is Down"> {
	try {
		const res = await axios.get(url, { timeout: 2000 });
		return res.status === 200 ? "Server is Up" : "Server is Down";
	} catch {
		return "Server is Down";
	}
}

export async function checkRedis(): Promise<"Redis is Up" | "Redis is down"> {
	try {
		await redis.ping();
		return "Redis is Up";
	} catch {
		return "Redis is down";
	}
}

const BASE_URL = process.env.MOCK_API_BASE_URL || "https://mock.ondc.org/api/";
export const checkAgriHealth = () => ping(`${BASE_URL}/agri/ping`);
export const checkRetailHealth = () => ping(`${BASE_URL}/retail/ping`);
export const checkServicesHealth = () => ping(`${BASE_URL}/services/ping`);
export const checkLogisticsHealth = () => ping(`${BASE_URL}/logistics/ping`);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://mock.ondc.org";

export async function checkFrontendHealth(): Promise<"Server is Up" | "Server is Down"> {
  try {
    const res = await axios.get(`${FRONTEND_URL}/`, { timeout: 2000 });

    if (res.status === 200 && res.data.includes("<html")) {
      return "Server is Up";
    }

    return "Server is Down";
  } catch {
    return "Server is Down";
  }
}