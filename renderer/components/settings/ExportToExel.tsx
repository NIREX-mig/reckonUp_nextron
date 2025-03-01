import React, { useState } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { APiRes } from "../../types";
import SelectData from "./SelectData";
import SelectDate from "./SelectDate";

const ExportToExel = () => {
  const [date, setDate] = useState({
    start: "",
    end: "",
  });
  const [checked, setChecked] = useState(false);

  const handleExportToExcel = () => {
    window.ipc.send("export2excel", { date, exchangeDetails: checked });

    window.ipc.on("export2excel", (res: APiRes) => {
      if (!res.success) {
        toast.error(res.message);
      }
      toast.success("Saved Successfully.");
    });
  };

  return (
    <section className="bg-primary-200 border-primary-500 border text-primary-900 rounded-lg p-6 my-2">
      <h2 className="text-lg font-semibold mb-4">Export Details</h2>
      <div className="w-1/2">
        <div>
          <label className=" flex flex-col font-medium text-primary-900 mb-1">
            Select Export Data:
            <span className="my-2">
              {
                "Note : Invoice Details & Customer Details these data by default Selected"
              }
            </span>
          </label>
          <SelectData checked={checked} setChecked={setChecked} />
        </div>
        <div>
          <label className="block font-medium text-primary-900 mb-1">
            Select Date:
          </label>
          <SelectDate date={date} setDate={setDate} />
          <Button
            buttonType="button"
            title="Export to Excel"
            extraClass="sm:w-auto"
            handleClick={handleExportToExcel}
          />
        </div>
      </div>
    </section>
  );
};

export default ExportToExel;
