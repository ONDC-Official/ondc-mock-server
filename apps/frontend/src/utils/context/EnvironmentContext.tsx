import { createContext, useState } from "react";

type EnvironmentProviderType = {
	children: React.ReactNode;
};
type EnvironmentContextType = {
	environment: string;
	setEnvironment: React.Dispatch<React.SetStateAction<string>>;
};

export const EnvironmentContext = createContext<EnvironmentContextType>({
	environment: "",
	setEnvironment: () => {},
});

export const EnvironmentProvider = ({ children }: EnvironmentProviderType) => {
	const [environment, setEnvironment] = useState("");
	console.log("Environment",environment)
	return (
		<EnvironmentContext.Provider value={{ environment, setEnvironment }}>
			{children}
		</EnvironmentContext.Provider>
	);
};
