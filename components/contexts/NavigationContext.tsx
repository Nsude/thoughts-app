"use client";

import { createContext, useContext, useState, PropsWithChildren } from "react";

interface NavigationContextType {
  showNavigation: boolean;
  setShowNavigation: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigationContext must be used within a NavigationProvider");
  }
  return context;
}

export function NavigationProvider({ children }: PropsWithChildren) {
  const [showNavigation, setShowNavigation] = useState(false);

  return (
    <NavigationContext.Provider value={{ showNavigation, setShowNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}