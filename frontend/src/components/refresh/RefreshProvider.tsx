interface RefreshProviderProps {
  children: JSX.Element[];
}

const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export default RefreshProvider;
