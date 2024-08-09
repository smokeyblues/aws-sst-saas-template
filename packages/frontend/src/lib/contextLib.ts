import { createContext, useContext } from "react";

export interface AppContextType {
  isAuthenticated: boolean;
  userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isSubscribed: boolean;
  userHasSubscribed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
  isAuthenticated: false,
  userHasAuthenticated: useAppContext,
  isSubscribed: false,
  userHasSubscribed: useAppContext,
});

export function useAppContext() {
  return useContext(AppContext);
}