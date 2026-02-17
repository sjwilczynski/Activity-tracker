import { useEffect, useRef, useState } from "react";
import { useFunAnimations } from "../../styles/StylesProvider";

export function useIsAnimating(isPending: boolean, isSuccess: boolean) {
  const [funAnimations] = useFunAnimations();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevIsSuccess = useRef(isSuccess);

  useEffect(() => {
    if (isPending) {
      prevIsSuccess.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    if (isSuccess && !prevIsSuccess.current && funAnimations) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevIsSuccess.current = isSuccess;
  }, [isSuccess, funAnimations]);

  return isAnimating;
}
