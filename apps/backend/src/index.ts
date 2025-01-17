import 'dotenv/config'
import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron"; // Import node-cron
import {
	authRouter,
	miscRouter,
	servicesRouter,
	subscriptionRouter,
	logisticsRouter,
	agriRouter,
} from "./controllers";
import cors from "cors";
import {
	authSwagger,
	b2bSwagger,
	b2cSwagger,
	miscSwagger,
	requestParser,
	servicesSwagger,
	agriServiceSwagger,
	globalErrorHandler,
	errorHandlingWrapper,
	healthcareServiceSwagger,
} from "./middlewares";
import { retailRouter } from "./controllers/retail";
import { sendUpsolicieatedOnStatus } from "./lib/utils/sendUpsolicieatedOnStatus";
import { loadConfig } from "./lib/utils";
import 'dotenv/config'
import path from 'path';
import { sub } from 'date-fns/fp';
const fs = require('fs');


export const app: Express = express();
const port = process.env.PORT || 3000;
loadConfig();
app.use(cors());

app.use("/api-docs/auth", swaggerUi.serve, authSwagger("/api-docs/auth"));
app.use("/api-docs/misc", swaggerUi.serve, miscSwagger("/api-docs/misc"));
app.use("/api-docs/b2b", swaggerUi.serve, b2bSwagger("/api-docs/b2b"));
app.use("/api-docs/b2c", swaggerUi.serve, b2cSwagger("/api-docs/b2c"));

app.use(
	"/api-docs/services",
	swaggerUi.serve,
	servicesSwagger("/api-docs/services")
);

app.use(
	"/api-docs/agri-services",
	swaggerUi.serve,
	agriServiceSwagger("/api-docs/agri-services")
);

app.use(
	"/api-docs/healthcare-services",
	swaggerUi.serve,
	healthcareServiceSwagger("/api-docs/healthcare-services")
);

app.use(
	"/api-docs/healthcare-services",
	swaggerUi.serve,
	healthcareServiceSwagger("/api-docs/agri-equipment-services")
);

app.use(express.raw({ type: "*/*", limit: "1mb" }));
app.use(requestParser);
app.use("/", miscRouter);
app.use("/retail", errorHandlingWrapper(retailRouter));
app.use("/auth", errorHandlingWrapper(authRouter));
app.use("/services", errorHandlingWrapper(servicesRouter));
app.use("/subscription", errorHandlingWrapper(subscriptionRouter));
app.use("/logistics", errorHandlingWrapper(logisticsRouter));
app.use("/agri", errorHandlingWrapper(agriRouter));
app.use("/get-data", async (req, res) => {
	// console.log("action",req.query,__dirname)
	let { action, domain, subdomain,version } = req.query
	console.log("---->",action, domain, subdomain,version)
	let baseDir=""
	switch (domain) {
		case "agri":
			baseDir = (subdomain === "ONDC:AGR11") ? path.join(__dirname, `../domain-repos/@${domain}/draft-agri_output/api/components/Examples/Agri_Bids_And_Auction/${action}/`) : path.join(__dirname, `../domain-repos/@${domain}/draft-agri_input/api/components/Examples/Agri_Products/${action}/`)
			break;
		case "logistics":
			baseDir = (subdomain === "ONDC:LOG10")?path.join(__dirname, `../domain-repos/@${domain}/draft-2.x/api/components/Examples/B2B_Dom_Logistics/${action}/`):path.join(__dirname, `../domain-repos/@${domain}/draft-2.x/api/components/Examples/B2B_Int_Logistics/${action}/`)
			break;
		case "services":
			switch (subdomain) {
				case "ONDC:SRV11":
					baseDir = path.join(__dirname, `../domain-repos/@${domain}/draft-services/api/components/Examples/Services_home_service/${action}/`)
					break
				case "ONDC:SRV13":
					baseDir = path.join(__dirname, `../domain-repos/@${domain}/draft-healthcare-service/api/components/Examples/Health_care_services/${action}/`)
					break;
				case "ONDC:SRV16":
					baseDir = path.join(__dirname, `../domain-repos/@${domain}/draft-astro/api/components/Examples/Astro_services/${action}/`)
					break;
				case "ONDC:SRV14":
					baseDir = path.join(__dirname, `../domain-repos/@${domain}/draft-agri-services/api/components/Examples/Agriculture_services/${action}/`)
					break
				case "ONDC:SRV18":
					baseDir = path.join(__dirname, `../domain-repos/@${domain}/draft-agri_bids_and_auction/api/components/Examples/Agri_Bids_And_Auction/${action}/`)
					break;
				case "ONDC:SRV18":
					baseDir = path.join(__dirname, `../domain-repos/@${domain}/draft-agri_equipment/api/components/Examples/Agri_Equipment_Hiring/${action}/`)
					break
			}
			break;
		case "retail":
			baseDir = (version==="b2c")?path.join(__dirname, `../domain-repos/@${domain}-b2b/b2c_exports_2.0/api/components/Examples/B2C_Exports_Json/${action}/`):path.join(__dirname, `../domain-repos/@${domain}-b2b/release-2.0.2/api/components/Examples/B2B_json/${action}/`)
			break;
		case "subscription":
			baseDir = path.join(__dirname, `../domain-repos/@mec/draft-print_media/api/components/Examples/Print_Content/${action}/`)
			break;
	}
	try {
    // Read all files in the directory
    const files = fs.readdirSync(baseDir);

    // Find the first JSON file in the directory
    const jsonFile = files.find((file:any) => file.endsWith(".json"));

    if (jsonFile) {
      // Construct the full file path
      const filePath = path.join(baseDir, jsonFile);
      console.log("File path:", filePath);

      // Read the content of the JSON file
      fs.readFile(filePath, "utf8", (err:any, data:any) => {
        if (err) {
          console.error("Error reading file:", err);
          return res.status(500).send({ error: "Error reading file" });
        }

        try {
          // Parse JSON and send as a response
          const jsonData = JSON.parse(data);
          res.send({ data: jsonData });
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          res.status(500).send({ error: "Invalid JSON format in the file" });
        }
      });

    } else {
			res.send({ data: "No file exist for this" });
      // throw new Error(`No JSON file found in directory: ${baseDir}`);
    }

		
	} catch (error) {
		console.log(error)
	}
	
})
app.use("/detect_app_installation", (req: Request, res: Response) => {
	const headers = req.headers;
	return res.json({
		headers: headers,
	});
});
app.use(globalErrorHandler);

//Schedule the function to run every 30 seconds using node-cron
cron.schedule("*/30 * * * * *", async () => {
	try {
		await sendUpsolicieatedOnStatus();
	} catch (error) {
		console.log("error occured in cron");
	}
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app