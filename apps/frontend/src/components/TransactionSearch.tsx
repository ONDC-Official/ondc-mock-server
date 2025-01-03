import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import { _getNodesAndEdges, actionComparator } from "../utils";
// import { _getNodesAndEdges, actionComparator } from "../utils";
import axios from "axios";
import * as _ from "lodash";
import { useAnalyse, useMessage } from "../utils/hooks";
import { useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { VITE_SERVER_URL } from "../utils/env";

export const TransactionSearch = () => {
	const theme = useTheme();
	const { setEdges, setNodes } = useAnalyse();
	const [requested, setRequested] = useState(false);
	const { handleMessageToggle, setMessageType } = useMessage();
	const [transactionId, setTransactionId] = useState("");

	const fetchTransaction = async (transaction: string) => {
		console.log('API URL:', VITE_SERVER_URL);
		try {
			const response = await axios.get(
				`${VITE_SERVER_URL}/analyse/${transaction}`
			);
			const formattedResponse = response.data
        .reduce(
          (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            uniqueArr: any[],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: {
              request: {
                context: {
                  action: string;
                  timestamp: string;
                  message_id: string;
                };
              };
              type: string,
							id: string
            }
          ) => {
            // const {
            //   action,
            //   timestamp: strTimestamp,
            //   message_id,
            // } = item.request.context;
            // const timestamp = new Date(strTimestamp);
            // if (
            //   !seenActionMessageId[`${message_id}-${action}-${item.id}`]
            //   // || timestamp > seenActionMessageId[action]
            // ) {
            //   seenActionMessageId[`${message_id}-${action}-${item.id}`] = timestamp; // Update latest timestamp for the action
              // const existingIndex = uniqueArr.findIndex(
              //  (obj) => obj.action === action
              // );
              // if (existingIndex !== -1) {
              //  uniqueArr[existingIndex] = item;
              // } else {
              uniqueArr.push(item);
              // }
            // }
            return uniqueArr;
          },
          []
        )
        .sort(
          // (
          //  a: {
          //    request: { context: { timestamp: string | number | Date } };
          //  },
          //  b: {
          //    request: { context: { timestamp: string | number | Date } };
          //  }
          // ) =>
          //  new Date(a.request.context.timestamp!).getTime() -
          //  new Date(b.request.context.timestamp!).getTime()
          actionComparator
        );

			const {edges, nodes} = _getNodesAndEdges(formattedResponse, theme)

			// const { edges, nodes } = getNodesAndEdges(formattedResponse, theme);
			setNodes(nodes);
			setEdges(edges);
			setRequested(true);
		} catch (error) {
			handleMessageToggle("Error Occurred while fetching transaction!");
			setMessageType("error");
			console.log("Following error occurred while querying", error);
		}
	};

	
	const requestTransaction = _.debounce(
		async (
			event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
		) => {
			setTransactionId(event.target.value);
			await fetchTransaction(event.target.value);
		},
		500
	);

	const handleFetch = async () => {
		await fetchTransaction(transactionId);
	};

	return (
		<Grow in={true} timeout={1000}>
			<Paper
				sx={{
					maxWidth: "sm",
					width: "100%",
					p: 0.5,
					borderRadius: theme.shape.borderRadius * 2,
				}}
				elevation={5}
			>
				<Box
					sx={{
						height: "100%",
						width: "100%",
						borderStyle: "solid",
						borderColor: theme.palette.divider,
						borderRadius: theme.shape.borderRadius * 2,
						borderWidth: 1,
						px: 1,

						display: "flex",
						alignItems: "center",
					}}
				>
					<InputBase
						sx={{ ml: 1, flex: 1, p: 0 }}
						placeholder="Enter your Transaction ID"
						inputProps={{ "aria-label": "Enter your Transaction ID" }}
						onChange={requestTransaction}
					/>

					<IconButton
						type="button"
						sx={{ p: 1 }}
						aria-label="search"
						onClick={handleFetch}
					>
						{requested ? <RefreshIcon /> : <SearchIcon />}
					</IconButton>
				</Box>
			</Paper>
		</Grow>
	);
};