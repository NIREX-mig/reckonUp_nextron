import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { FaSave } from "react-icons/fa";
import { useRouter } from "next/router";
import { APiRes } from "../../types";
import Header from "../../components/ui/Header";
import FileInput from "../../components/ui/FileInput";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";

const SettingPage: NextPageWithLayout = () => {
  const router = useRouter();

  const [settingData, setSettingData] = useState({
    ownerName: "",
    mobileNumber: "",
    whatsappNumber: "",
    address: "",
    shopName: "",
    GSTNO: "",
  });

  const handleSaveSettings = () => {
    window.ipc.send("createsetting", {
      ownerName: settingData.ownerName,
      mobileNumber: settingData.mobileNumber,
      whatsappNumber: settingData.whatsappNumber,
      address: settingData.address,
      shopName: settingData.shopName,
      GSTNO: settingData.GSTNO,
    });

    window.ipc.on("createsetting", (res: APiRes) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleExportToExcel = () => {
    toast("Sorry This Feature Is Not WorKing!", {
      icon: "😭",
    });

    // window.ipc.send("export2excel", {});

    // window.ipc.on("export2excel", (res: APiRes) => {
    //   if (!res.success) {
    //     toast.error(res.message);
    //   }
    //   toast.success("Saved Successfully.");
    // });
  };

  useEffect(() => {
    const getSetting = async () => {
      window.ipc.send("fetchsetting", {});

      window.ipc.on("fetchsetting", (res: APiRes) => {
        if (res.success) {
          setSettingData({
            ownerName: res.data.ownerName,
            mobileNumber: res.data.mobileNumber,
            whatsappNumber: res.data.whatsappNumber,
            address: res.data.address,
            shopName: res.data.shopName,
            GSTNO: res.data.GSTNO,
          });
        } else {
          toast.error(res.message);
        }
      });
    };

    getSetting();
  }, [router]);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <div className="px-4 py-2 bg-primary-50 h-full">
        <Header title="Settings" extraStyle="mb-3" />

        <div className="bg-primary-200 border-primary-500 border text-primary-900 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={settingData.shopName}
                    onChange={(e) =>
                      setSettingData((prev) => ({
                        ...prev,
                        shopName: e.target.value,
                      }))
                    }
                    className=" bg-primary-100 w-full px-4 py-2 rounded-lg border border-primary-800 text-primary-900 font-semibold focus:outline-purple-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={settingData.ownerName}
                    onChange={(e) =>
                      setSettingData((prev) => ({
                        ...prev,
                        ownerName: e.target.value,
                      }))
                    }
                    className=" bg-primary-100 w-full px-4 py-2 rounded-lg border border-primary-800 text-primary-900 font-semibold focus:outline-purple-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={settingData.GSTNO}
                    onChange={(e) =>
                      setSettingData((prev) => ({
                        ...prev,
                        GSTNO: e.target.value,
                      }))
                    }
                    className=" bg-primary-100 w-full px-4 py-2 rounded-lg border border-primary-800 text-primary-900 font-semibold focus:outline-purple-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={settingData.address}
                    onChange={(e) =>
                      setSettingData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    rows={3}
                    className=" bg-primary-100 w-full px-4 py-2 rounded-lg border border-primary-800 text-primary-900 font-semibold focus:outline-purple-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settingData.mobileNumber}
                    onChange={(e) =>
                      setSettingData((prev) => ({
                        ...prev,
                        mobileNumber: e.target.value,
                      }))
                    }
                    className=" bg-primary-100 w-full px-4 py-2 rounded-lg border border-primary-800 text-primary-900 font-semibold focus:outline-purple-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Whatsapp Number
                  </label>
                  <input
                    type="tel"
                    value={settingData.whatsappNumber}
                    onChange={(e) =>
                      setSettingData((prev) => ({
                        ...prev,
                        whatsappNumber: e.target.value,
                      }))
                    }
                    className=" bg-primary-100 w-full px-4 py-2 rounded-lg border border-primary-800 text-primary-900 font-semibold focus:outline-purple-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Invoice Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Export all invoice in CSV file:
                  </label>
                  <Button
                    buttonType="button"
                    title="Export to Excel"
                    extraClass="sm:w-auto"
                    handleClick={handleExportToExcel}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment QR:
                  </label>
                  <FileInput />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-btn/95 text-white hover:bg-btn"
            >
              <FaSave className="h-5 w-5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

SettingPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default SettingPage;
