import React from "react";

type Header = {
  title: string;
  extraStyle?: string;
};

const Header = ({ title, extraStyle }: Header) => {
  return (
    <div className={`bg-primary-200 px-3 py-3 rounded-lg border border-primary-500 ${extraStyle}`}>
      <h1 className="text-2xl font-bold text-primary-800">
        {title}
      </h1>
    </div>
  );
};

export default Header;
