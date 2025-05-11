import { Toaster } from 'react-hot-toast';
import SideBar from './SideBar';

export default function RootLayout({ children }) {
  return (
    <section className="flex ">
      <SideBar />
      <main className="w-full h-screen overflow-auto bg-primary-950">
        <Toaster />
        {children}
      </main>
    </section>
  );
}
