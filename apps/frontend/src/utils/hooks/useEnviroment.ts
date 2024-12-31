import { useContext } from "react";
import { EnvironmentContext } from "../context";

export const useEnvironment = () => useContext(EnvironmentContext); 