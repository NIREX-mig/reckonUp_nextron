import { useEffect, useState } from "react";
import splash from "../public/splash.png";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading time (e.g., fetching data, initializing)
    setTimeout(() => {
      setVisible(false);
    }, 3000); // Show splash screen for 3 seconds
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 3;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 50); // Increase progress every 300ms

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-primary-50 text-xl">
      <Image src={splash} alt="app_logo" width={180} height={180} />
      <div className="min-w-[80%] bg-gray-200 h-2 mx-auto mt-8">
        <div
          className="bg-purple-900 h-2"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}