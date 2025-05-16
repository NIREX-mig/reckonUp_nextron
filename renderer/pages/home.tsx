import React, { useCallback, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash, FaRegUser, FaUnlockAlt } from "react-icons/fa";
import { APiRes } from "../types";
import Button from "../components/ui/Button";
import toast, { Toaster } from "react-hot-toast";
import { AiOutlineLoading } from "react-icons/ai";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [isPasswordHidden, setPasswordHidden] = useState(true);

  const [loginData, setLoginData] = useState({
    username: "app-admin",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    window.ipc.send("login", {
      username: loginData.username,
      password: loginData.password,
    });

    window.ipc.on("login", (res: APiRes) => {
      if (res?.success) {
        setLoading(false);
        localStorage.setItem("logedinUser", JSON.stringify(res.data));
        toast.success(res.message);
        setLoginData((prev) => ({
          ...prev,
          password: "",
        }));
        setTimeout(() => {
          router.push("/dashboard/");
        }, 500);
      } else {
        setLoginData((prev) => ({
          ...prev,
          password: "",
        }));
        setLoading(false);
        toast.error(res.message);
      }
    });
  };

  const handlePasswordHidden = useCallback(
    () => setPasswordHidden((prev) => !prev),
    []
  );

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="bg-primary-50 h-screen flex justify-center gap-5 items-center">
        <Toaster />
        <div className="bg-primary-50 rounded-lg p-4">
          <Image
            src="/LoginAnimation.gif"
            alt="loginanimationgif"
            width={500}
            height={500}
            className=""
            draggable="false"
            priority
            unoptimized
          />
        </div>
        <div className="w-[30rem]">
          <h1 className="text-center font-bold text-4xl mb-10  text-primary-950">
            Welcome To ReckonUp
          </h1>
          <h3 className="text-center font-bold text-3xl mb-4 text-primary-900">
            Sign In
          </h3>
          <p className="text-center text-lg mb-5 text-primary-800">
            Enter your Username and Password to Sign In.
          </p>

          <form onSubmit={handleSubmit} className="p-4 w-[27rem] mx-auto">
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-semibold  text-gray-900"
              >
                Username
              </label>
              <div className="relative">
                <FaRegUser className="absolute left-3 top-2.5 h-5 w-5 text-gray-900" />
                <input
                  value={loginData.username}
                  className="bg-primary-50 border border-primary-900 text-primary-900 rounded-md focus:outline-primary-900 block w-full p-2 font-semibold indent-8"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-semibold text-gray-900"
              >
                Password
              </label>
              <div className="relative">
                <FaUnlockAlt className="absolute left-3 top-2.5 h-5 w-5 text-gray-900" />
                <input
                  type={isPasswordHidden ? "password" : "text"}
                  autoComplete="off"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  autoFocus={true}
                  className="bg-primary-50 border border-primary-900 text-primary-800 rounded-md focus:outline-primary-900 block w-full p-2 mb-3 font-semibold indent-8"
                  placeholder="•••••••••"
                  required
                />
                <div className="realtive">
                  <div
                    className="text-gray-900 absolute right-3 inset-y-3 my-auto
                  active:text-gray-600"
                    onClick={handlePasswordHidden}
                  >
                    {isPasswordHidden ? <FaEye /> : <FaEyeSlash />}
                  </div>
                </div>
              </div>
            </div>
            <Link href="/forgot" draggable="false">
              <p className=" font-semibold hover:underline inline-block mb-5 focus:outline-primary-900">
                Forger Password
              </p>
            </Link>
            <Button
              title={loading ? "Wait..." : "Sign In"}
              buttonType="submit"
              loading={loading}
              disabled={loading}
              icon={<AiOutlineLoading size={20} />}
              extraClass="py-2"
            />
          </form>
        </div>
      </section>
    </React.Fragment>
  );
}
