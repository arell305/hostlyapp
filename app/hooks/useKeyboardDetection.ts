import { useEffect, useState } from "react";

const useKeyboardDetection = () => {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const threshold = 150; // pixels
    let initialHeight = window.innerHeight;

    const handleResize = () => {
      const heightDiff = initialHeight - window.innerHeight;
      setKeyboardOpen(heightDiff > threshold);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return keyboardOpen;
};

export default useKeyboardDetection;
