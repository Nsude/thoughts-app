"use client";

import React, { createContext, useContext, useState, ReactNode, PropsWithChildren } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface ConfirmationContextType {
  confirmAction: () => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
}

export function ConfirmationProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirmAction = (): Promise<boolean> => {
    return new Promise((resolvePromise) => {
      setIsOpen(true);
      setResolve(() => resolvePromise);
    });
  };

  const handleConfirm = (choice: boolean) => {
    if (!resolve) return;
    resolve(choice);
    setIsOpen(false);
    setResolve(null);
  };

  return (
    <ConfirmationContext.Provider value={{ confirmAction }}>
      {children}
      <ConfirmationModal
        display={isOpen}
        onConfirm={handleConfirm}
      />
    </ConfirmationContext.Provider>
  );
}