import React, { createContext, useContext } from 'react';
import { SamsConfig } from './types';

const SamsContext = createContext<SamsConfig | null>(null);

export { SamsContext };

export interface SamsProviderProps extends SamsConfig {
  children: React.ReactNode;
}

export function SamsProvider({ children, ...config }: SamsProviderProps) {
  return (
    <SamsContext.Provider value={config}>
      {children}
    </SamsContext.Provider>
  );
}

export function useSamsConfig(): SamsConfig {
  const config = useContext(SamsContext);
  if (!config) {
    throw new Error('useSamsConfig must be used within a SamsProvider');
  }
  return config;
}
