import { useCallback, useState } from "react";

export const useNavigationState = () => {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const handleNavigationToggle = useCallback(() => {
    setIsNavigationOpen((isOpen) => !isOpen);
  }, []);

  return { isNavigationOpen, handleNavigationToggle };
};
