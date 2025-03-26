import Container from "@mui/material/Container";
import { SandboxProvider } from "../../utils/context";
import { Outlet, useNavigate } from "react-router-dom";
import { MessageDialog, SandboxRequestSection } from "../../components";
import { Grid } from "@mui/material";
import { InitiateRequestSection } from "./InitiateRequestSection";
import { SandboxSyncResponseSection } from "./SandboxSyncResponseSection";
import { useDomain } from "../../utils/hooks";
import { useEffect } from "react";

export const Sandbox = () => {
	const { domain } = useDomain();
	const navigate = useNavigate();

	useEffect(() => {
		if (domain.length === 0) navigate("/");
	}, []);

	return (
		<SandboxProvider>
			<Container sx={{ py: 2 ,width:"80%" }}>
				<Outlet />
				<Grid container spacing={2}>
					<Grid item xs={12} lg={8}>
						<SandboxRequestSection />
					</Grid>
					<Grid container item xs={12} lg={4}>
						<Grid item xs={12} sm={6} lg={12}>
							<InitiateRequestSection />
						</Grid>
						<Grid item xs={12} sm={6} lg={12}>
							<SandboxSyncResponseSection />
						</Grid>
					</Grid>
				</Grid>
				<MessageDialog />
			</Container>
		</SandboxProvider>
	);
};
