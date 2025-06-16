import { Router } from "express";
import { bapRouter } from "./bap";
import { bppRouter } from "./bpp";
import { authValidatorMiddleware } from "../../middlewares";
import { rateLimiter } from "../../middlewares/rateLimiter";
import { initiateRouter } from "./initiate";

export const agriRouter = Router();
agriRouter.get("/ping", (req, res) => {
	res.status(200).send("agri OK");
});
agriRouter.use(authValidatorMiddleware);
agriRouter.use(rateLimiter);
agriRouter.use("/bap", bapRouter);
agriRouter.use("/bpp", bppRouter);
agriRouter.use("/initiate", initiateRouter);
