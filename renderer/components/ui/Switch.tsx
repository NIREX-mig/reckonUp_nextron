import React, { useState } from 'react';

const Switch = ({ isSwitchOn, setSwitchOn, setExchangeDetails }) => {
  const handleSwitch = () => {
    setSwitchOn((prev) => !prev);
    setExchangeDetails({
      exchangeCategory: 'select',
      weight: '',
      percentage: '',
      exchangeAmt: '',
    });
  };

  return (
    <label className="inline-flex items-center mb-5 cursor-pointer">
      <input
        type="checkbox"
        checked={isSwitchOn}
        onChange={handleSwitch}
        className="sr-only peer"
      />
      <div className="relative w-9 h-5 bg-primary-600 peer-focus:outline-none  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-900"></div>
    </label>
  );
};

export default Switch;
