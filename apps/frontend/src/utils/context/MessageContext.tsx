import { createContext, useState , Dispatch, SetStateAction} from "react";

type MessageProviderType = {
	children: React.ReactNode;
};

type MessageContextType = {
	transaction_id:string | undefined,
	setTransaction_Id:(m:string)=>void,
	message: string | undefined;
	messageType: "info" | "error" | "success";
	setMessageType: (m: "info" | "error" | "success") => void;
	copy: string | undefined;
	setCopy: Dispatch<SetStateAction<string | undefined>>;
	showDialog: boolean;
	handleMessageToggle: (m: string) => void;
	closeDialog: () => void;
};

export const MessageContext = createContext<MessageContextType>({
	transaction_id:"",
	setTransaction_Id:()=>{},
	message: "",
	messageType: "info",
	setMessageType: () => {},
	copy: "",
	setCopy: () => {},
	showDialog: true,
	handleMessageToggle: () => {},
	closeDialog: () => {},
});

export const MessageProvider = ({ children }: MessageProviderType) => {
	const[transaction_id,setTransaction_Id]=useState<string>();
	const [message, setMessage] = useState<string>();
	const [messageType, setMessageType] = useState<"info" | "error" | "success">(
		"info"
	);
	const [copy, setCopy] = useState<string>();
	const [showDialog, setShowDialog] = useState<boolean>(false);
	
	const handleMessageToggle = (message: string) => {
		setMessage(message);
		setShowDialog(true);
	};

	const closeDialog = () => {
		setMessage("");
		setShowDialog(false);
		setCopy(undefined);
		setMessageType("info")
	};

	return (
		<MessageContext.Provider
			value={{
				transaction_id,
				setTransaction_Id,
				message,
				messageType,
				setMessageType,
				copy,
				setCopy,
				showDialog,
				handleMessageToggle,
				closeDialog,
			}}
		>
			{children}
		</MessageContext.Provider>
	);
};
