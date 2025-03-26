import { Router } from "express";
import { analyseController } from "./analyse";
import { pingController } from "./ping";
import { initiateServicesController } from "./initiate";
import { miscSchemaValidator } from "../../lib/schema/misc";
import { getAllTransactionIdController } from "./getAllTransactionId";
import { getAllScenarios } from "./getAllScenarios";
import { proxy } from "./proxy";
import { getPayload } from "./getPayload";

export const miscRouter = Router();

miscRouter.get("/", pingController);
miscRouter.post(
	"/initiate/services",
	miscSchemaValidator("initiate/services"),
	initiateServicesController
);
miscRouter.get("/scan", getAllTransactionIdController);
miscRouter.get("/analyse/:transactionId", analyseController);
miscRouter.get("/scenario/:domain/:action", getAllScenarios);
miscRouter.get("/get-data", getPayload)
miscRouter.post("/proxy", proxy)
