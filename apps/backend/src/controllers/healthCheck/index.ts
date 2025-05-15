import { Router } from "express";
import { healthInfoDetailed } from "./healthInfoDetailed";
import { health } from "./health";


export const healthRouter = Router()

healthRouter.get("/",health)
healthRouter.get("/info",healthInfoDetailed)
