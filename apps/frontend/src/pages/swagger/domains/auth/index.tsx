import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { Toolbar } from "@mui/material";
import swaggerSpec from "openapi-specs/auth.json";
import { SwaggerDownloadButton } from "../../../../components";
import { VITE_SERVER_URL } from "../../../../utils/env";

export const AuthSwagger = () => {
	swaggerSpec.servers = swaggerSpec.servers.map(({ url }: { url: string }) =>
		url.startsWith(VITE_SERVER_URL)
			? { url }
			: {
					url: VITE_SERVER_URL + url.replace("/api", ""),
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  }
	);

	return (
		<>
			<Toolbar
				sx={{
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<SwaggerDownloadButton swaggerYaml={swaggerSpec} fileName="Auth.yaml" />
			</Toolbar>
			<SwaggerUI spec={swaggerSpec} />
		</>
	);
};
