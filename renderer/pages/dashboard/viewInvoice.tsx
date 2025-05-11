import React, { ReactElement, useEffect, useRef, useState } from 'react';
import RootLayout from '../../components/rootLayout';
import { NextPageWithLayout } from '../_app';
import Head from 'next/head';
import { FaArrowLeft, FaCloudDownloadAlt, FaShare, FaShareSquare } from 'react-icons/fa';
import { FiPrinter } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useReactToPrint } from 'react-to-print';
import { APiRes } from '../../types';
import toast from 'react-hot-toast';
import InvoiceHeader from '../../components/invoices/InvoiceHeader';
import InvoiceDetailsCards from '../../components/invoices/InvoiceDetailsCards';
import InvoiceItemsList from '../../components/invoices/InvoiceItemsList';
import BillingSection from '../../components/invoices/BillingSection';
import InvoiceFooter from '../../components/invoices/InvoiceFooter';

const ViewInvoicePage: NextPageWithLayout = () => {
  const [finalInvoiceData, setFinalInvoiceData] = useState(undefined);
  const [setting, setSetting] = useState(undefined);
  const contentRef = useRef();
  const [qr, setQr] = useState(undefined);
  const [logo, setLogo] = useState(undefined);

  const router = useRouter();

  const reactToPrintFn = useReactToPrint({
    contentRef,
  });

  const handlePrintInvoice = () => {
    reactToPrintFn();
    localStorage.removeItem('finalInvoice');
  };

  useEffect(() => {
    const getsettingData = () => {
      window.ipc.send('fetchsetting', { finalInvoiceData });
      window.ipc.on('fetchsetting', (res: APiRes) => {
        if (res.success) {
          setSetting(res.data);
        } else {
          toast.error('Something Went Wrong!');
          router.back();
        }
      });
    };

    const getPaymentQrImage = () => {
      window.ipc.send('getqr', {});
      window.ipc.on('getqr', (res: APiRes) => {
        if (res.success) {
          setQr(res?.data);
        }
      });
    };

    const getInvoiceLog = () => {
      window.ipc.send('get-logo', {});
      window.ipc.on('get-logo', (res: APiRes) => {
        if (res.success) {
          setLogo(res?.data);
        }
      });
    };

    const setinvoice = async () => {
      const jsonInvoice = localStorage.getItem('finalInvoice');
      const ObjInvoice = await JSON.parse(jsonInvoice);
      setFinalInvoiceData(ObjInvoice);
    };
    getPaymentQrImage();
    getInvoiceLog();
    setinvoice();
    getsettingData();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <div className="p-6 h-full">
        <div className="flex justify-between items-center mb-6 sticky top-6">
          <button
            onClick={() => {
              localStorage.removeItem('finalInvoice');
              router.back();
            }}
            className="flex items-center gap-2 text-primary-50 hover:text-primary-300"
          >
            <FaArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          <div className="flex gap-4">
            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-btn/95 text-white rounded-lg hover:bg-btn active:scale-95 transition-all duration-300"
            >
              <FiPrinter className="h-5 w-5" />
              Print
            </button>

            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-btn/95 text-white rounded-lg hover:bg-btn active:scale-95 transition-all duration-300"
            >
              <FaCloudDownloadAlt className="h-5 w-5" />
              Save
            </button>
          </div>
        </div>

        <div ref={contentRef} className="max-w-4xl mx-auto overflow-scroll bg-[#ffffff] p-5">
          <div className="relative mx-auto max-w-[1200px]">
            <InvoiceHeader
              shopName={setting?.shopName}
              address={setting?.address}
              invoiceNo={finalInvoiceData?.invoiceNo}
              date={finalInvoiceData?.createdAt}
              logoSrc={logo}
              whatsappNo={setting?.mobileNo}
              mobileNo={setting?.whatsappNo}
            />

            <InvoiceDetailsCards
              category={finalInvoiceData?.exchangeCategory}
              percentage={finalInvoiceData?.exchangePercentage}
              customername={finalInvoiceData?.name}
              customeraddress={finalInvoiceData?.address}
              customerphone={finalInvoiceData?.phone}
              exchange={Boolean(finalInvoiceData?.exchange)}
            />

            <InvoiceItemsList productList={finalInvoiceData?.products} />

            <BillingSection
              subtotal={finalInvoiceData?.grossAmount}
              GSTAmount={finalInvoiceData?.gstAmount}
              GstPercentage={finalInvoiceData?.gstPercentage}
              discount={finalInvoiceData?.discount}
              exchange={Boolean(finalInvoiceData?.exchange)}
              exchangeAmount={finalInvoiceData?.exchangeAmount}
              gst={Boolean(finalInvoiceData?.gst)}
              paidAmount={finalInvoiceData?.payments?.paidAmount}
              qrSrc={qr}
              totalAmount={finalInvoiceData?.totalAmount}
            />

            <InvoiceFooter />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

ViewInvoicePage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default ViewInvoicePage;
