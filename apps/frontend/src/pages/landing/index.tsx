import Container from "@mui/material/Container";
import { SUPPORTED_DOMAINS } from "../../utils";
import { Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import ONDC_logo from "../../assets/images/ONDC_logo.png";
import {
	BackgroundContainer,
	CustomButton,
	InfoPanel,
	StyledBox,
} from "./styles";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
	const navigate = useNavigate();
	const openReadme = () => {
		navigate("/user-guide");
	};

	return (
		<>
			<BackgroundContainer style={{ position: "fixed", right: 0, width: "90%", height: "100vh" }}>
				<Container
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width:"80%",
					}}
					maxWidth="xl"
				>
					<img
						src={ONDC_logo}
						style={{ marginRight: "16px", height: "55px" }}
					/>
					<CustomButton
						onClick={openReadme}
						color="primary"
						variant="contained"
					>
						Open User Guide
					</CustomButton>
				</Container>

				<Container
					style={{
						display: "flex",
						justifyContent: "flex-start",
						height: "100%",
						width:"80%",
					}}
					maxWidth="xl"
				>
					<InfoPanel sx={{ height: "80%" }}>
						<Typography
							variant="h5"
							fontSize="25px"
							fontWeight="500"
							color="text.secondary"
							gutterBottom
						>
							<b>About Us</b>
						</Typography>
						<Typography fontSize="15px" color="GrayText">
							<b>
								This platform aids in developing and testing Buyer and Seller
								Network participants by providing a simulated environment.
								Developers can test and validate integrations without needing a
								counterpart. It supports B2B and Services domains, allowing for
								Seller testing via sandbox or payload uploads. Mock requests to
								BPP (Seller) and BAP (Buyer) servers are facilitated, with
								schema validation required for all requests. Sandbox mode
								requires an authorization header, while Mock mode does not.
								Schema validation failures result in a NACK response, while
								successful validations result in an ACK response. Curl requests
								can also be made to sandbox environments.
							</b>
						</Typography>
					</InfoPanel>
					<StyledBox  sx={{ height: "80%" }}>
						<Typography variant="h3" fontSize="50px">
							Welcome to ONDC Mock/Sandbox
						</Typography>
						<Typography
							gutterBottom
							color="GrayText"
							sx={{ marginBottom: "50px" }}
							maxWidth="90%"
						>
							Let's imitate the characteristics of ONDC production environment
							in a dedicated testing environment.
						</Typography>
						<Container sx={{ marginBottom: "30px" }}>
							<Typography
								color="text.secondary"
								gutterBottom
								sx={{ textAlign: "left" }}
							>
								Currently supported domains are:
							</Typography>
							<ul
								style={{
									margin: 0,
									paddingLeft: "20px",
									listStyleType: "none",
								}}
							>
								{SUPPORTED_DOMAINS.map((domain, index) => (
									<li
										key={"domain-" + index}
										style={{
											display: "flex",
											alignItems: "center",
											marginBottom: "8px",
										}}
									>
										<CheckCircle
											style={{ color: "#4caf50", marginRight: "8px" }}
										/>
										<Typography variant="body2" color="text.secondary">
											{domain}
										</Typography>
									</li>
								))}
							</ul>
						</Container>
						<Typography variant="h5" gutterBottom sx={{ alignItems: "left" }}>
							To get started
						</Typography>
						<Typography variant="h5" gutterBottom sx={{ alignItems: "left" }}>
							select a domain from the Navigation menu.
						</Typography>
					</StyledBox>
				</Container>
			</BackgroundContainer>
		</>
	);
};
