import { Router } from "express";
import { searchController } from "./search";
import { initController } from "./init";
import { selectController } from "./select";
import { confirmController } from "./confirm";
import { statusController } from "./status";
import { updateController } from "./update";
import { cancelController } from "./cancel";
import { jsonSchemaValidator, redisRetriever } from "../../../middlewares";
import { ratingController } from "./rating";

export const bppRouter = Router();

bppRouter.post(
	"/search",
	jsonSchemaValidator({ domain: "subscription", action: "search" }),
	redisRetriever,
	searchController
);

bppRouter.post(
	"/init",
	// jsonSchemaValidator({ domain: "subscription", action: "init" }),
	redisRetriever,
	initController
);

bppRouter.post(
	"/select",
	jsonSchemaValidator({ domain: "subscription", action: "select" }),
	redisRetriever,
	selectController
);

bppRouter.post(
	"/confirm",
	jsonSchemaValidator({ domain: "subscription", action: "confirm" }),
	redisRetriever,
	confirmController
);

bppRouter.post(
	"/update",
	jsonSchemaValidator({ domain: "subscription", action: "update" }),
	redisRetriever,
	updateController
);

bppRouter.post(
	"/status",
	jsonSchemaValidator({ domain: "subscription", action: "status" }),
	redisRetriever,
	statusController
);

bppRouter.post(
	"/cancel",
	jsonSchemaValidator({ domain: "subscription", action: "cancel" }),
	redisRetriever,
	cancelController
);

bppRouter.post(
	"/rating",
	jsonSchemaValidator({ domain: "subscription", action: "rating" }),
	redisRetriever,
	ratingController
);
