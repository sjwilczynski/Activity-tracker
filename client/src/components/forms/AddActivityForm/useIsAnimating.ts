import { useEffect, useState } from "react";
import { useFunAnimations } from "../../styles/StylesProvider";

export function useIsAnimating(isPending: boolean, isSuccess: boolean) {
  const [funAnimations] = useFunAnimations();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevIsSuccess, setPrevIsSuccess] = useState(false);
  const [animateCount, setAnimateCount] = useState(0);

  if (isPending && prevIsSuccess) {
    setPrevIsSuccess(false);
  }

  if (isSuccess && !prevIsSuccess && funAnimations) {
    setPrevIsSuccess(true);
    setIsAnimating(true);
    setAnimateCount((c) => c + 1);
  }

  useEffect(() => {
    if (animateCount === 0) return;
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [animateCount]);

  return isAnimating;
}
