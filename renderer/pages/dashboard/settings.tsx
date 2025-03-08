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
import ExportToExel from "../../components/settings/ExportToExel";

const SettingPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [logo, setlogo] = useState(undefined);
  const [logoPreview, setlogoPreview] = useState(undefined);
  const [logoUploaded, setLogoUploaded] = useState(false);

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

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setlogo(undefined);
      return;
    }
    setlogo(e.target.files[0]);

    const Updatelogo = async (file) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          window.ipc.send("upload-logo", {
            fileName: file.name,
            logo: reader.result,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    Updatelogo(e.target.files[0]);
    setLogoUploaded(true);
  };

  useEffect(() => {
    if (!logo) {
      setlogo(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(logo);

    setlogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logo]);

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

    const getLogo = async () => {
      window.ipc.send("get-logo", {});

      window.ipc.on("get-logo", (res: APiRes) => {
        if (res.success) {
          setLogoUploaded(true);
          setlogoPreview(res.data);
        }
      });
    };
    getLogo();

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
              <div className="flex gap-10">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Payment QR:
                  </label>
                  <FileInput />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Invoice Logo:
                  </label>
                  <div className="w-[200px] h-[200px] border-2 border-dashed border-primary-900 rounded-lg p-1 flex justify-center items-center">
                    <label htmlFor="logo">
                      {!logoUploaded ? (
                        <p>Upload Logo</p>
                      ) : (
                        <img
                          src={logoPreview}
                          alt="logo"
                          className="w-[180px] h-[180px] object-contain"
                        />
                      )}
                    </label>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-btn text-white hover:bg-btn/95 active:scale-95 transition-all duration-300 "
            >
              <FaSave className="h-5 w-5" />
              Save Settings
            </button>
          </div>
        </div>
        <ExportToExel />
      </div>
    </React.Fragment>
  );
};

SettingPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default SettingPage;
