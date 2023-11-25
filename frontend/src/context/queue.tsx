import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

export interface IQueueContext {
  queueFound: boolean;
  setQueueFound: Dispatch<SetStateAction<boolean>>;
}

export const QueueContext = createContext<IQueueContext>({
  queueFound: false,
  setQueueFound: () => {},
});

interface IQueueProviderProps {
  children: React.ReactNode;
}

export const QueueProvider: React.FC<IQueueProviderProps> = ({ children }) => {
  const [queueFound, setQueueFound] = useState<boolean>(false);

  return (
    <QueueContext.Provider
      value={{ queueFound: queueFound, setQueueFound: setQueueFound }}
    >
      {children}
    </QueueContext.Provider>
  );
};
