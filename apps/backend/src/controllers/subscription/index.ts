import { Router } from "express";
import { bapRouter } from "./bap";
import { bppRouter } from "./bpp";
import { authValidatorMiddleware } from "../../middlewares";
import { rateLimiter } from "../../middlewares/rateLimiter";
import { initiateRouter } from "./initiate";

export const subscriptionRouter = Router();
subscriptionRouter.get("/ping", (req, res) => {
	res.status(200).send("Subscription OK");
});
subscriptionRouter.use(authValidatorMiddleware);
subscriptionRouter.use(rateLimiter);
subscriptionRouter.use("/bap", bapRouter);
subscriptionRouter.use("/bpp", bppRouter);
subscriptionRouter.use("/initiate", initiateRouter);
