import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import Input from "@mui/joy/Input";
import FormControl from "@mui/joy/FormControl";
import Textarea from "@mui/joy/Textarea";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { MessageDialog } from "../../components";
import { useMessage } from "../../utils/hooks";

export const Sign = () => {
	const theme = useTheme();
	const [authHeader, setAuthHeader] = useState<string>();
	const [requestBody, setRequestBody] = useState<string>();
	const { handleMessageToggle, setMessageType } = useMessage();

	const handleSubmit = async () => {
		try {
			const response = await axios.post(
				`${import.meta.env.VITE_SERVER_URL || 'https://mock.ondc.org/api'}/auth/signCheck`,
				requestBody,
				{
					headers: {
						"Content-Type": "application/json",
						authorization: authHeader,
					},
				}
			);
			if (response.status === 200) {
				handleMessageToggle("This is a Valid Header.");
				setMessageType("success");
			}
			console.log("RESPONSE", response);
		} catch (error) {
			setMessageType("error");
			if (error instanceof AxiosError) {
				if (error.response?.status === 401)
					handleMessageToggle("Invalid Header !");
				else handleMessageToggle(error.message);
				console.log("ERROR:", error);
			}
		}
	};

	return (
		<Container
			sx={{
				height: `calc(100% - ${
					(theme.mixins.toolbar.minHeight as number) + 10
				}px)`,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Typography variant="h3" mt={2}>
				Sign Check
			</Typography>
			<Typography my={1}>
				This utility lets you verify the validity of your signature. It can help
				you integrate the ONDC Crypto SDK or a language specific wrapper with
				better fidelity.
			</Typography>
			<Fade in={true}>
				<Paper sx={{ p: 2, minWidth: "75%" }} elevation={6}>
					<Input
						fullWidth
						placeholder="Enter Your Auth Header..."
						value={authHeader}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setAuthHeader(e.target.value)
						}
					/>
					<FormControl sx={{ width: "100%" }}>
						<Textarea
							minRows={10}
							maxRows={15}
							sx={{ width: "100%", mt: 1 }}
							placeholder="Request Body..."
							value={requestBody}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setRequestBody(e.target.value)
							}
						/>
					</FormControl>
					<Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
						<Button
							variant="contained"
							disabled={!authHeader || !requestBody}
							onClick={handleSubmit}
						>
							Check
						</Button>
					</Box>
				</Paper>
			</Fade>
			<MessageDialog />
		</Container>
	);
};
