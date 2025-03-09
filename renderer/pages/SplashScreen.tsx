import { useEffect, useState } from "react";
import splash from "../public/splash.png";
import Image from "next/image";
import { version } from "os";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  let version = "V1.0.2";
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 80); // Increase progress every 80ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-primary-50 text-xl">
      <p className="absolute right-3 top-3 font-bold text-base">{version}</p>
      <Image src={splash} alt="app_logo" width={180} height={180} unoptimized />
      <div className="min-w-[90%] bg-gray-200 h-2 mx-auto mt-8">
        <div
          className={`bg-purple-900 h-2 transition-all duration-[3000]`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
