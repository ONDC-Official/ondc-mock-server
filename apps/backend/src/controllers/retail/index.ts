import { Router } from "express";
import { bapRouter } from "./bap";
import { bppRouter } from "./bpp";
import { authValidatorMiddleware } from "../../middlewares";
import { rateLimiter } from "../../middlewares/rateLimiter";
import { initiateRouter } from "./initiate";

export const retailRouter = Router();
retailRouter.get("/ping", (req, res) => {
	res.status(200).send("Retail OK");
});
retailRouter.use(authValidatorMiddleware);
retailRouter.use(rateLimiter);
retailRouter.use("/bap", bapRouter);
retailRouter.use("/bpp", bppRouter);
retailRouter.use("/initiate", initiateRouter)