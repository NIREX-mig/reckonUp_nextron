import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import toast from "react-hot-toast";
import { APiRes } from "../../types";

const SelectCategory = ({
  currentPage,
  setCurrentPage,
  setTotalPages,
  setFilteredData,
  search,
  setSearch,
}) => {
  const [selectedOption, setSelectedOption] = useState("invoiceNo");

  const fetchInvoicesBySelection = async () => {
    if (search?.trim().length === 0) {
      toast.error("Please Enter custormer Name or Invoice No");
      return;
    }

    if (selectedOption === "invoiceNo") {
      window.ipc.send("fetchbyinvoiceno", { invoiceNo: search?.toUpperCase() });

      window.ipc.on("fetchbyinvoiceno", (res: APiRes) => {
        if (res.success) {
          setFilteredData(res.data.invoices);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error(res.message);
        }
      });
    } else if (selectedOption === "customerName") {
      window.ipc.send("fetchbycustomername", {
        name: search?.toLowerCase(),
        pageNo: currentPage,
      });

      window.ipc.on("fetchbycustomername", (res: APiRes) => {
        if (res.success) {
          setFilteredData(res.data.invoices);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error(res.message);
        }
      });
    }
  };

  const handleFetchInvoiceBySelection = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoicesBySelection();
  };

  useEffect(() => {
    if (search) {
      fetchInvoicesBySelection();
    }
  }, [currentPage]);

  return (
    <div>
      <form
        onSubmit={handleFetchInvoiceBySelection}
        className=" pt-2 pr-2 pb-1 flex gap-2"
      >
        <select
          className="bg-primary-100 border border-primary-900 text-gray-900 text-sm rounded-md focus:outline-primary-900 block w-30 px-2"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option defaultValue="invoiceNo">invoiceNo</option>
          <option value="customerName">Customer Name</option>
        </select>
        <Input
          type="text"
          placeholder="Search"
          value={search}
          handleChangeText={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Button title="Search" buttonType="submit" />
      </form>
    </div>
  );
};

export default SelectCategory;
