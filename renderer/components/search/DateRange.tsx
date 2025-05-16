import React, { useEffect, useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { APiRes } from '../../types';

const DateRange = ({ currentPage, setCurrentPage, setTotalPages, setFilteredData, clear }) => {
  const [date, setDate] = useState({
    start: '',
    end: '',
  });

  // Fetch invoices by date range with pagination
  const fetchInvoicesByDateRange = async () => {
    if (!date.start || !date.end) {
      toast.error('Please select both start and end dates.');
      return;
    }

    window.ipc.send('fetchbydaterange', {
      startingDate: date.start,
      endingDate: date.end,
      pageNo: currentPage,
    });

    window.ipc.on('fetchbydaterange', (res: APiRes) => {
      if (res.success) {
        setFilteredData(res.data.invoices);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleFetchInvoiceByDateRange = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoicesByDateRange();
  };

  useEffect(() => {
    if (date.start && date.end) {
      fetchInvoicesByDateRange();
    }
  }, [currentPage]);

  return (
    <div>
      <form onSubmit={handleFetchInvoiceByDateRange} className="max-w-sm pt-2 pl-2 flex gap-2">
        <Input
          type="date"
          value={date.start}
          handleChangeText={(e) =>
            setDate((prev) => ({
              ...prev,
              start: e.target.value,
            }))
          }
          otherStyle="h-9"
        />
        <span className="my-auto text-black font-bold">to</span>
        <Input
          type="date"
          value={date.end}
          handleChangeText={(e) =>
            setDate((prev) => ({
              ...prev,
              end: e.target.value,
            }))
          }
          otherStyle="h-9"
        />

        <Button title="Search" buttonType="submit" extraClass="px-5" />
        <button
          type="button"
          onClick={() => {
            setDate({ start: '', end: '' });
            clear();
          }}
          className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-md text-sm sm:w-auto px-5 py-1 text-center active:scale-95 transition-all duration-300"
        >
          Clear
        </button>
      </form>
    </div>
  );
};

export default DateRange;
