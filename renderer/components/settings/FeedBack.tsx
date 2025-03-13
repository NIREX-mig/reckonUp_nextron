import React, { useState } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { APiRes } from "../../types";

const FeedBack = () => {
  const [message, setMessage] = useState("");

  const handleSendFeedback = () => {
    if (message.trim().length === 0) return;
    window.ipc.send("feedback", message);
    window.ipc.on("feedback", async (res: APiRes) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <section className="bg-primary-200 border-primary-500 border text-primary-900 rounded-lg p-6 my-2">
      <h3 className="text-xl font-semibold mb-4 text-primary-900">
        Write Your Feedback And Any Bugs Report
      </h3>
      <textarea
        name="feedback"
        rows={8}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-primary-100 rounded-lg w-[800px] p-3 text-primary-800 font-semibold border border-primary-900"
        placeholder="Say what you think about the app or any bug report"
        required
      />

      <Button
        title="Send Feedback"
        buttonType="button"
        extraClass="sm:w-[800px] mt-5"
        handleClick={handleSendFeedback}
      />
    </section>
  );
};

export default FeedBack;
