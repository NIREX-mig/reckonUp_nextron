import React from "react";

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className="flex justify-between items-center  mt-1">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="flex items-center px-5 py-2 text-sm text-white capitalize bg-primary-900 border rounded-md gap-x-2 hover:bg-primary-950 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        <span>Previous</span>
      </button>

      <div className="items-center font-semibold md:flex gap-x-3">
        {` Page ${currentPage} of ${totalPages} (Show 40 Invoices in 1 page) `}
      </div>

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="flex items-center px-5 py-2 text-sm text-white capitalize bg-primary-900 border rounded-md gap-x-2 hover:bg-primary-950  disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all duration-300"
      >
        <span>Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
