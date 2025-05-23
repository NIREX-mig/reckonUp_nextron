import React from 'react';
import { TbPasswordUser } from 'react-icons/tb';
import Button from '../ui/Button';
import { AiOutlineLoading } from 'react-icons/ai';

const OtpContainer = ({ finalOtp, setFinalOtp, handleOtpSumbmit, loading }) => {
  return (
    <div className="w-[30rem] bg-primary-50">
      <h3 className="text-center font-bold text-4xl mb-4 text-primary-900">OTP Verification</h3>
      <p className="text-center text-lg mb-5 text-primary-900">
        Enter The 6-Digit OTP You Have Received!
      </p>

      <form onSubmit={handleOtpSumbmit} className="p-4 w-[27rem] mx-auto">
        <div className="mb-5">
          <div className="relative">
            <TbPasswordUser className="absolute left-3 top-2.5 h-5 w-5 text-primary-700" />

            <input
              type="text"
              name="otp"
              autoComplete="off"
              value={finalOtp}
              onChange={(e) => setFinalOtp(e.target.value)}
              className="bg-primary-100 border border-primary-900 text-primary-900 text-sm rounded-md focus:outline-primary-900 block w-full p-2 font-semibold indent-8"
            />
          </div>
        </div>

        <Button
          buttonType="submit"
          title={loading ? 'Wait...' : 'Verify OTP'}
          extraClass="font-semibold py-2"
          loading={loading}
          disabled={loading}
          icon={<AiOutlineLoading size={20} />}
        />
      </form>
    </div>
  );
};

export default OtpContainer;
