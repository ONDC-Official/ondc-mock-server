import { SandboxRequestSection } from "../../../../components";
import Grid from "@mui/material/Grid";
import { InitiateRequestSection } from "../../InitiateRequestSection";
import { SandboxSyncResponseSection } from "../../SandboxSyncResponseSection";

export const B2CSandbox = () => {
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} lg={8}>
				<SandboxRequestSection/>
			</Grid>
			<Grid container item xs={12} lg={4}>
				<Grid item xs={12} sm={6} lg={12}>
					<InitiateRequestSection/>
				</Grid>
				<Grid item xs={12} sm={6} lg={12}>
					<SandboxSyncResponseSection />
				</Grid>
			</Grid>
		</Grid>
	);
};
