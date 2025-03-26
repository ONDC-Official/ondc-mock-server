import { Handle, NodeProps, Position } from "reactflow";
import "./index.css";
import Box from "@mui/material/Box";
import { useAnalyse } from "../../utils/hooks";
export type CustomNodeData = {
	title: string;
	subline?: string;
	uri?: string;
	log?: object;
	toBeSent?: boolean;
};
import FileOpenIcon from "@mui/icons-material/FileOpen";
import IconButton from "@mui/material/IconButton";

export const CustomNode = ({
	data: { title, uri, log, subline, toBeSent },
}: NodeProps<CustomNodeData>) => {
	const { setOpenLogDialog, setLogToShow } = useAnalyse();
	return (
		<Box className="wrapper gradient">
			<Box className="inner">
				<Box className="body">
					<Box>
						<div className="title">{title}</div>
						{(log || toBeSent) && (
							<IconButton
								onClick={() => {
									setLogToShow({...log, toBeSent});
									setOpenLogDialog(true);
								}}
							>
								<FileOpenIcon />
							</IconButton>
						)}
						{subline && <div className="subline">{subline}</div>}
						{uri && <div className="subline">{uri}</div>}
					</Box>
				</Box>
				<Handle type="target" position={Position.Top} id="top" />
				<Handle type="source" position={Position.Bottom} id="bottom" className="1"/>
				<Handle type="source" position={Position.Right} id="right" />
				<Handle type="target" position={Position.Left} id="left" />
			</Box>
		</Box>
	);
};
