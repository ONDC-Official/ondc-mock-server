import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

import { responseBuilder, LOGISTICS_EXAMPLES_PATH } from "../../../lib/utils";

// function getRandomFile(directory: string): string | null {
// 	const files = fs.readdirSync(directory);
// 	const yamlFiles = files.filter((file) => file.endsWith(".yaml"));

// 	if (yamlFiles.length === 0) {
// 		console.error(`No YAML files found in directory: ${directory}`);
// 		return null;
// 	}

// 	const randomIndex = Math.floor(Math.random() * yamlFiles.length);

// 	return path.join(directory, yamlFiles[randomIndex]);
// }

export const onConfirmController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sandboxMode = res.getHeader("mode") === "sandbox";
  const { scenario } = req.query;
    try {
      // const domain = req.body.context.domain;
			// let directory: string;

      // switch (domain) {
			// 	case "ONDC:LOG10":
			// 		directory = path.join(
			// 			LOGISTICS_EXAMPLES_PATH,
			// 			"/B2B_Dom_Logistics_yaml/update"
			// 		);
			// 		break;

			// 	case "ONDC:LOG11":
			// 		directory = path.join(
			// 			LOGISTICS_EXAMPLES_PATH,
			// 			"/B2B_Int_Logistics_yaml/update"
			// 		);
			// 		break;

			// 	default:
			// 		// Fallback to the LOG10 directory if the domain is not recognized
			// 		directory = path.join(
			// 			LOGISTICS_EXAMPLES_PATH,
			// 			"/B2B_Dom_Logistics_yaml/update"
			// 		);
			// 		break;
			// }
      // let file;
      // switch(scenario){
      //   case "rts":
      //     file = path.join(directory, "update_air.yaml");
      //     break;
      //   default:
      //     file = path.join(directory, "update_air_diff.yaml");

      // };
			// if (!file) {
			// 	return null; // Return null or handle this case as needed
			// }

			// const fileContent = fs.readFileSync(file, "utf8");
			// const response = YAML.parse(fileContent);

			return responseBuilder(
				res,
				next,
				{},
				{},
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "update" : "/update"
				}`,
				`update`,
				"logistics"
			);
    } catch (error) {
      return next(error)
    }
};