import React, { useState } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { APiRes } from "../../types";
import SelectDate from "./SelectDate";
import { AiOutlineLoading } from "react-icons/ai";

const ExportToExel = () => {
  const [date, setDate] = useState({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);

  const handleExportToExcel = () => {
    setLoading(true);
    if (date.start === "" && date.end === "") {
      toast.error("Date not selected!");
      return;
    }
    window.ipc.send("export2excel", { date });

    window.ipc.on("export2excel", (res: APiRes) => {
      if (!res.success) {
        setLoading(false);
        setDate({
          start: undefined,
          end: undefined,
        });
        toast.error(res.message);
      }
      setLoading(false);
      toast.success("Saved Successfully.");
    });
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-primary-900">
        Export Details
      </h2>
      <div className="w-1/2">
        <div>
          <label className=" flex flex-col font-medium text-primary-700 mb-1">
            <span className="my-2">
              {
                "Note : Invoice Details, Customer Details, Exchange Details these data are Exportes"
              }
            </span>
            Select Date:
          </label>
        </div>
        <div className="w-1/2">
          <SelectDate date={date} setDate={setDate} />
          <Button
            buttonType="button"
            title="Export to Excel"
            extraClass="w-auto py-2"
            handleClick={handleExportToExcel}
            loading={loading}
            icon={<AiOutlineLoading size={20} />}
          />
        </div>
      </div>
    </section>
  );
};

export default ExportToExel;
