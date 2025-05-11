import Link from 'next/link';
import React from 'react';
import { FaRegUser } from 'react-icons/fa';
import Button from '../ui/Button';
import { AiOutlineLoading } from 'react-icons/ai';

const ForgotContainer = ({ handleOnChange, username, handleUsernameSubmit, loading }) => {
  return (
    <div className="w-[30rem] bg-primary-50">
      <h3 className="text-center font-bold text-4xl mb-4 text-primary-900">Forgot Password</h3>
      <p className="text-center text-lg mb-5 text-primary-800">
        Provide Your Username To Reset Your Password!
      </p>

      <form onSubmit={handleUsernameSubmit} className="p-4 w-[27rem] mx-auto">
        <div className="mb-5">
          <label htmlFor="username" className="block mb-2 text-sm font-semibold text-primary-900">
            Username
          </label>
          <div className="relative">
            <FaRegUser className="absolute left-3 top-2.5 h-5 w-5 text-primary-700" />
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="off"
              value={username}
              onChange={handleOnChange}
              className="bg-primary-100 border border-primary-900 text-primary-900 text-md rounded-md focus:outline-primary-900 block w-full p-2 font-semibold indent-8"
              placeholder="Username"
              required
            />
          </div>
        </div>

        <Button
          buttonType="submit"
          title={loading ? 'Wait...' : 'Next'}
          extraClass="font-semibold py-2"
          icon={<AiOutlineLoading size={20} />}
          loading={loading}
          disabled={loading}
        />
      </form>
      <p className=" px-8 flex text-base font-bold text-primary-800">
        Want Login in account{' '}
        <Link
          href="/home"
          draggable="false"
          className="font-medium text-base mx-1 text-secondry-600 hover:underline"
        >
          Login
        </Link>
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mx-1 my-1 text-secondry-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </span>
      </p>
    </div>
  );
};

export default ForgotContainer;
