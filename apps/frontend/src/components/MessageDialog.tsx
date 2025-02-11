import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useMessage } from "../utils/hooks";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import WarningTwoToneIcon from "@mui/icons-material/WarningTwoTone";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {  useNavigate } from "react-router-dom";
export const MessageDialog = () => {
	const { showDialog, closeDialog, message, messageType, copy ,transaction_id} = useMessage();
	const navigate = useNavigate();
	const copyContent = () => {
		if (copy)
			navigator.clipboard.writeText(copy).catch((err) => {
				console.log(err.message);
			});
	};
	const handlebuttonclick=()=>{
		closeDialog(); 
		navigate(`/analyse?message=${transaction_id}`);
	}

	return (
		<Dialog open={showDialog} onClose={closeDialog}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",
					p: 2,
				}}
			>
				{messageType === "info" && <InfoTwoToneIcon color="info" />}
				{messageType === "error" && <WarningTwoToneIcon color="warning" />}
				{messageType === "success" && (
					<CheckCircleTwoToneIcon color="success" />
				)}
				<Typography variant="h5" ml={1}>
					Message
				</Typography>
			</Box>
			<DialogContent
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-start",
				}}
			>
				<Typography>{message}</Typography>
				{copy && (
					<IconButton onClick={copyContent}>
						<ContentCopyIcon />
					</IconButton>
				)}
			</DialogContent>
			<DialogActions>
			{messageType==="success"    && <Button variant="contained" color="secondary" sx={{ fontSize: '0.8rem' }} onClick={handlebuttonclick} >
					View in Transaction Analyser
			</Button>}
				<Button variant="contained" color="secondary" onClick={closeDialog}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};
