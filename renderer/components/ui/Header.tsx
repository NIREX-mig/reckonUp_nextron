import Link from 'next/link';
import React from 'react';
import { MdPendingActions } from 'react-icons/md';

type Header = {
  title: string;
  extraStyle?: string;
};

const Header = ({ title, extraStyle }: Header) => {
  return (
    <div
      className={`sticky  top-1  z-[100] bg-primary-800  rounded-lg border border-primary-900 flex items-center justify-between ${extraStyle}`}
    >
      <h1 className="text-2xl font-bold text-primary-100 px-3 py-3">{title}</h1>
    </div>
  );
};

export default Header;
