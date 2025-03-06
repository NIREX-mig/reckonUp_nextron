import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { APiRes } from "../../types";

const DateRange = ({
  currentPage,
  setCurrentPage,
  setTotalPages,
  setFilteredData,
}) => {
  const [date, setDate] = useState({
    start: "",
    end: "",
  });

  // Fetch invoices by date range with pagination
  const handleFetchInvoiceByDateRange = async (e) => {
    e.preventDefault();
    window.ipc.send("fetchbydaterange", {
      startingDate: date.start,
      endingDate: date.end,
      pageNo: currentPage,
    });

    window.ipc.on("fetchbydaterange", (res: APiRes) => {
      if (res.success) {
        setFilteredData(res.data.invoices);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div>
      <form
        onSubmit={handleFetchInvoiceByDateRange}
        className="max-w-sm p-4 flex gap-2"
      >
        <Input
          type="date"
          value={date.start}
          handleChangeText={(e) =>
            setDate((prev) => ({
              ...prev,
              start: e.target.value,
            }))
          }
        />
        <span className="my-auto text-black font-bold">to</span>
        <Input
          type="date"
          value={date.end}
          otherStyle=""
          handleChangeText={(e) =>
            setDate((prev) => ({
              ...prev,
              end: e.target.value,
            }))
          }
        />

        <Button title="Search" buttonType="submit" extraClass="px-5 py-1" />
        <button
          type="button"
          onClick={() => {
            setDate({ start: "", end: "" });
          }}
          className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm sm:w-auto px-5 py-1.5 text-center active:scale-95 transition-all duration-300"
        >
          Clear
        </button>
      </form>
    </div>
  );
};

export default DateRange;
