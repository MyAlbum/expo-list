import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface ComposerHeightContextType {
  composerHeight: number;
  setComposerHeight: (height: number) => void;
}

const ComposerHeightContext = createContext<ComposerHeightContextType | undefined>(undefined);

interface ComposerHeightProviderProps {
  children: ReactNode;
}

export const ComposerHeightProvider = ({ children }: ComposerHeightProviderProps) => {
  const [composerHeight, setComposerHeightState] = useState<number>(0);

  const setComposerHeight = useCallback((height: number) => {
    setComposerHeightState(height);
  }, []);

  const value = useMemo(() => ({ composerHeight, setComposerHeight }), [composerHeight, setComposerHeight]);

  return (
    <ComposerHeightContext.Provider value={value}>
      {children}
    </ComposerHeightContext.Provider>
  );
};

export const useComposerHeight = (): ComposerHeightContextType => {
  const context = useContext(ComposerHeightContext);
  if (context === undefined) {
    throw new Error('useComposerHeight must be used within a ComposerHeightProvider');
  }
  return context;
};

