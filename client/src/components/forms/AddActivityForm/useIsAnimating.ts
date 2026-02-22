import { useEffect, useState } from "react";
import { useFunAnimations } from "../../styles/StylesProvider";

export function useIsAnimating(isPending: boolean, isSuccess: boolean) {
  const [funAnimations] = useFunAnimations();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevIsSuccess, setPrevIsSuccess] = useState(false);
  const [animateCount, setAnimateCount] = useState(0);

  // Reset tracking when a new submission starts
  if (isPending && prevIsSuccess) {
    setPrevIsSuccess(false);
  }

  // Detect success transition — adjust state during render
  if (isSuccess && !prevIsSuccess && funAnimations) {
    setPrevIsSuccess(true);
    setIsAnimating(true);
    setAnimateCount((c) => c + 1);
  }

  // Stop animation after delay
  useEffect(() => {
    if (animateCount === 0) return;
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [animateCount]);

  return isAnimating;
}
