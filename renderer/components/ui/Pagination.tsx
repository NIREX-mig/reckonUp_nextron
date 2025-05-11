import React from 'react';

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className="text-center my-3">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="bg-primary-900 hover:bg-primary-950 px-3 py-1 rounded-lg text-white mx-3 disabled:bg-gray-400 disabled:text-gray-800 active:scale-95 transition-all duration-300"
      >
        Previous
      </button>
      <span className="font-semibold">{` Page ${currentPage} of ${totalPages} `}</span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-primary-900 hover:bg-primary-950 px-3 py-1 rounded-lg text-white mx-3 disabled:bg-gray-400 disabled:text-gray-900 active:scale-95 transition-all duration-300"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
