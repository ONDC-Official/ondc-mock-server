import Redis, { RedisOptions } from "ioredis";
const redisOptions: RedisOptions = {
	host: process.env.REDIS_HOST || "localhost",
	port: (process.env.REDIS_PORT || 6379) as number,
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
};

export type TransactionType = {
	request: object;
	response?: object
};

console.log("REDIS OPTIONS", redisOptions);


export const redis = new Redis(redisOptions);
