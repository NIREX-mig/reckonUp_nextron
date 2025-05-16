import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 60); // Increase progress every 80ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center bg-primary-50 text-xl">
      <img
        src="/splash.png"
        alt="app_logo"
        width={720}
        height={480}
        draggable="false"
        className=""
      />
      <div className=" absolute bottom-2 min-w-[90%] bg-gray-200 h-1 mx-auto">
        <div
          className={`bg-primary-900 h-1 transition-all duration-[3000]`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className=" absolute bottom-48 left-[66px] text-2xl text-white font-mono">V2.0.0</p>
    </div>
  );
}
