import { Router } from "express";
import { bapRouter } from "./bap";
import { bppRouter } from "./bpp";
import { authValidatorMiddleware } from "../../middlewares";
import { rateLimiter } from "../../middlewares/rateLimiter";
import { initiateRouter } from "./initiate";
import { getCatalogController } from "./getCatalogController";
export const logisticsRouter = Router();
logisticsRouter.get("/ping", (req, res) => {
	res.status(200).send("logisticsRouter OK");
});
logisticsRouter.use(authValidatorMiddleware);
logisticsRouter.use(rateLimiter);
logisticsRouter.use("/bap", bapRouter);
logisticsRouter.use("/bpp", bppRouter);
logisticsRouter.use("/initiate", initiateRouter)
logisticsRouter.post("/getCatalog", getCatalogController);