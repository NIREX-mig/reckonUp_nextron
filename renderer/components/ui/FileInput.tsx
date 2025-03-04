import Image from "next/image";
import React, { useEffect, useState } from "react";
import { APiRes } from "../../types";

const FileInput = () => {
  const [qrImage, setQrImage] = useState(undefined);
  const [imageUploded, setImageUploded] = useState(false);
  const [imagePreview, setImagePreview] = useState(undefined);

  useEffect(() => {
    if (!qrImage) {
      setQrImage(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(qrImage);

    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [qrImage]);

  useEffect(() => {
    const getQr = async () => {
      window.ipc.send("getqr", {});

      window.ipc.on("getqr", (res: APiRes) => {
        if (res.success) {
          setImageUploded(true);
          setImagePreview(res.data);
        }
      });
    };
    getQr();
  }, []);

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setQrImage(undefined);
      return;
    }
    setQrImage(e.target.files[0]);

    const Updateqr = async (file) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          window.ipc.send("uploadqr", {
            fileName: file.name,
            qrimg: reader.result,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    Updateqr(e.target.files[0]);
    setImageUploded(true);
  };

  return (
    <div
      className="w-[200px] h-[200px] rounded-lg border-2 border-dashed border-primary-900 flex items-center
justify-center"
    >
      <label htmlFor="file" className="cursor-pointer text-center p-2 md:p-1">
        {!imageUploded ? (
          <div>
            <svg
              className="w-10 h-10 mx-auto"
              viewBox="0 0 41 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1667 26.6667C8.48477 26.6667 5.5 23.6819 5.5 20C5.5 16.8216
7.72428 14.1627 10.7012 13.4949C10.5695 12.9066 10.5 12.2947 10.5 11.6667C10.5 7.0643
14.231 3.33334 18.8333 3.33334C22.8655 3.33334 26.2288 6.19709 27.0003
10.0016C27.0556 10.0006 27.1111 10 27.1667 10C31.769 10 35.5 13.731 35.5 18.3333C35.5
22.3649 32.6371 25.7279 28.8333 26.5M25.5 21.6667L20.5 16.6667M20.5 16.6667L15.5
21.6667M20.5 16.6667L20.5 36.6667"
                stroke="#4F46E5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-3 text-gray-700 max-w-xs mx-auto">
              Click to{" "}
              <span className="font-medium text-indigo-600">
                Upload your file
              </span>{" "}
              or drag and drop your file here
            </p>
          </div>
        ) : (
          <img
            src={imagePreview}
            alt="Qr"
            className="w-[180px] h-[180px] object-contain"
          />
        )}
      </label>
      <input
        id="file"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileInput;
