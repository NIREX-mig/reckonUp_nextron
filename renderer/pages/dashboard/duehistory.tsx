import React, { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import RootLayout from "../../components/rootLayout";
import Head from "next/head";
import Header from "../../components/ui/Header";

const DueHistoryPage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="bg-primary-50 py-2 px-4 h-full">
        <Header title="Due Invoices History" extraStyle="mb-3" />
        <div className="rounded-lg border border-primary-500 bg-primary-200">
          due history
        </div>
      </section>
    </React.Fragment>
  );
};

DueHistoryPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default DueHistoryPage;
