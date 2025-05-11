import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import NewPasswordContainer from '../components/forgotpassword/NewPasswordContainer';
import OtpContainer from '../components/forgotpassword/OtpContainer';
import ForgotContainer from '../components/forgotpassword/ForgotContainer';
import { useRouter } from 'next/router';
import { APiRes } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { useIsOnline } from 'react-use-is-online';
import Link from 'next/link';

export default function ForgotPage() {
  const router = useRouter();

  const { isOnline, isOffline, error } = useIsOnline();

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [finalOtp, setFinalOtp] = useState('');
  const [formData, setFormData] = useState({
    newpassword: '',
    comfirmpassword: '',
  });
  const [fpContainer, setFPContainer] = useState(true);
  const [otpContainer, setOtpContainer] = useState(false);
  const [npContainer, setNPContainer] = useState(false);

  const handleOnChange = (e) => {
    setUsername(e.target.value);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    window.ipc.send('forgotpasswordemail', { username });

    window.ipc.on('forgotpasswordemail', (res: APiRes) => {
      if (res.success) {
        setLoading(false);
        localStorage.setItem('tempToken', res.data);
        toast.success(res.message);
        setFPContainer(false);
        setOtpContainer(true);
        setNPContainer(false);
      } else {
        setLoading(false);
        toast.error(res.message);
        setOtpContainer(false);
        setNPContainer(false);
        setFPContainer(true);
      }
    });
  };

  const handleOtpSumbmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('tempToken');
    window.ipc.send('validateotp', { otp: finalOtp, token });

    window.ipc.on('validateotp', (res: APiRes) => {
      if (res.success) {
        setLoading(false);
        toast.success(res.message);
        setFPContainer(false);
        setOtpContainer(false);
        setNPContainer(true);
      } else {
        setLoading(false);
        toast.error(res.message);
        setOtpContainer(true);
        setNPContainer(false);
        setFPContainer(false);
      }
    });
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('tempToken');

    window.ipc.send('forgotpassword', {
      newpassword: formData.newpassword,
      token,
    });

    window.ipc.on('forgotpassword', (res: APiRes) => {
      if (res.success) {
        setLoading(false);
        localStorage.removeItem('tempToken');
        toast.success(res.message);
        setTimeout(() => {
          router.push('/home');
        }, 500);
      } else {
        setLoading(false);
        toast.error(res.message);
        setOtpContainer(false);
        setNPContainer(true);
        setFPContainer(false);
      }
    });
  };

  if (isOffline) {
    return (
      <section className="w-full h-screen flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-10">
          <h1 className="text-red-500 text-3xl font-bold">Please First Connect To The Internet</h1>
          <Link
            href="/home"
            draggable="false"
            className="px-7 py-2 bg-btn rounded-full text-white font-semibold"
          >
            Go Back
          </Link>
        </div>
      </section>
    );
  }

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
          />
        </div>
        {fpContainer && (
          <ForgotContainer
            username={username}
            handleOnChange={handleOnChange}
            handleUsernameSubmit={handleUsernameSubmit}
            loading={loading}
          />
        )}
        {otpContainer && (
          <OtpContainer
            finalOtp={finalOtp}
            setFinalOtp={setFinalOtp}
            handleOtpSumbmit={handleOtpSumbmit}
            loading={loading}
          />
        )}
        {npContainer && (
          <NewPasswordContainer
            formData={formData}
            setFormData={setFormData}
            handleNewPasswordSubmit={handleNewPasswordSubmit}
            loading={loading}
          />
        )}
      </section>
    </React.Fragment>
  );
}
