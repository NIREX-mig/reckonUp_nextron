import React from 'react';

const InvoiceFooter = () => {
  return (
    <footer className="mt-5">
      <div className="w-1/3 text-center opacity-55">
        <p className="text-[13px] font-medium tracking-[3px] text-[#666]">Signature</p>
        <div className="mb-[2px] flex justify-center">
          <div className="relative h-[2px] w-[250px]">
            <div className="absolute bottom-0 h-[2px] w-full bg-gray-300" />
          </div>
        </div>
        <p className="text-[13px] tracking-[2px] text-[#666]">DD/MM/YYYY</p>
      </div>
      <p className="mt-4 text-[16px] tracking-[2px] text-center capitalize">
        Thanq for you Bussiness with us!
      </p>
    </footer>
  );
};

export default InvoiceFooter;
