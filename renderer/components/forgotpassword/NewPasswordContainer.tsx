import React from 'react';
import { FaUnlockAlt } from 'react-icons/fa';
import Button from '../ui/Button';
import { AiOutlineLoading } from 'react-icons/ai';

const NewPasswordContainer = ({ formData, setFormData, handleNewPasswordSubmit, loading }) => {
  const handleOnChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setFormData({ ...formData, [name]: value });
  };
  return (
    <div className="w-[30rem] bg-primary-50">
      <h3 className="text-center font-bold text-4xl mb-4  text-primary-900">New Credentials</h3>
      <p className="text-center text-lg mb-5 text-primary-800">Your identity has been verified!</p>
      <p className="text-center text-lg mb-5 text-primary-800">Set your new password.</p>

      <form onSubmit={handleNewPasswordSubmit} className="p-4 w-[27rem] mx-auto">
        <div className="mb-5">
          <label
            htmlFor="newpassword"
            className="block mb-2 text-sm font-semibold  text-primary-900"
          >
            New Password
          </label>
          <div className="relative">
            <FaUnlockAlt className="absolute left-3 top-2.5 h-5 w-5 text-primary-700" />
            <input
              type="password"
              name="newpassword"
              autoComplete="off"
              value={formData.newpassword}
              onChange={handleOnChange}
              className="bg-primary-100 border border-primary-900 text-primary-900 text-sm rounded-md focus:outline-primary-900 block w-full p-2 font-semibold indent-8"
              placeholder="New Password"
              required
            />
          </div>
        </div>
        <div className="mb-5">
          <label
            htmlFor="confirmpassword"
            className="block mb-2 text-sm font-semibold  text-primary-900"
          >
            Confirm Password
          </label>
          <div className="relative">
            <FaUnlockAlt className="absolute left-3 top-2.5 h-5 w-5 text-primary-700" />
            <input
              type="password"
              name="comfirmpassword"
              autoComplete="off"
              placeholder="Confirm Password"
              value={formData.comfirmpassword}
              onChange={handleOnChange}
              className="bg-primary-100 border border-primary-900 text-primary-900 text-sm rounded-md focus:outline-primary-900 block w-full p-2 font-semibold indent-8"
              required
            />
          </div>
        </div>

        <Button
          buttonType="submit"
          title={loading ? 'Wait...' : 'Submit'}
          extraClass="font-semibold py-2"
          loading={loading}
          disabled={loading}
          icon={<AiOutlineLoading size={20} />}
        />
      </form>
    </div>
  );
};

export default NewPasswordContainer;
