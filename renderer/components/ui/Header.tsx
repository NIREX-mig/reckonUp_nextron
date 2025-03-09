import Link from "next/link";
import React from "react";
import { MdPendingActions } from "react-icons/md";

type Header = {
  title: string;
  extraStyle?: string;
};

const Header = ({ title, extraStyle }: Header) => {
  return (
    <div
      className={`sticky  top-1  z-[100] bg-primary-200  rounded-lg border border-primary-500 flex items-center justify-between ${extraStyle}`}
    >
      <h1 className="text-2xl font-bold text-primary-800 px-3 py-3">{title}</h1>
      <Link
        href="/dashboard/duehistory"
        draggable="false"
        className="bg-btn mr-10 py-2 px-5 text-white rounded-lg flex justify-center items-center gap-2 active:scale-95 transition-all duration-300 "
      >
        <MdPendingActions size={20} />
        Dues
      </Link>
    </div>
  );
};

export default Header;
