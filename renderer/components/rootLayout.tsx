import { Toaster } from "react-hot-toast";
import SideBar from "./SideBar";

export default function RootLayout({ children }) {
  return (
    <section className="flex bg-primary-100">
      <SideBar />
      <main className="w-full h-screen overflow-auto ml-[65px]">
        <Toaster />
        {children}
      </main>
    </section>
  );
}
