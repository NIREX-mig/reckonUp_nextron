import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuLayoutDashboard } from 'react-icons/lu';
import { FiFileText, FiLogOut, FiSettings } from 'react-icons/fi';
import { ImStatsBars } from 'react-icons/im';
import { MdOutlinePostAdd, MdPayment } from 'react-icons/md';

const SideBar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard/', icon: LuLayoutDashboard },
    {
      name: 'New Invoice',
      path: '/dashboard/invoice/',
      icon: MdOutlinePostAdd,
    },
    { name: 'View Invoices', path: '/dashboard/search/', icon: FiFileText },
    { name: 'Due Payments', path: '/dashboard/duehistory/', icon: MdPayment },
    { name: 'Reports', path: '/dashboard/reports/', icon: ImStatsBars },
    { name: 'Settings', path: '/dashboard/settings/', icon: FiSettings },
  ];

  const handleLogOut = () => {};

  return (
    <section className="flex">
      <aside className="w-44 h-screen bg-primary-950">
        <div className={`flex items-center  border-b border-primary-800 p-2`}>
          <img src="/app_logo.png" alt="logo" className="w-[40px]" draggable="false" />
          <p className="font-bold text-2xl">
            <span className="text-primary-400">Reckon</span>
            <span className="text-primary-200">Up</span>
          </p>
        </div>

        <nav className={`flex items-center flex-1 flex-col gap-y-1 p-2`}>
          {menuItems.map((menu, index) => {
            return (
              <Link
                key={index}
                href={menu.path}
                draggable="false"
                className={`w-full flex items-center py-2 px-3 hover:bg-primary-300 hover:rounded-lg group
                ${
                  pathname === menu.path &&
                  "rounded-lg bg-primary-300 before:absolute before:content-[''] before:w-[3px] before:h-5 before:bg-primary-700"
                }
                `}
              >
                <menu.icon
                  size={26}
                  className={`rounded-lg p-1 group-hover:text-primary-900  ${
                    pathname === menu.path ? 'text-primary-900' : 'text-primary-200'
                  }`}
                />
                <span
                  className={`ml-1 font-medium group-hover:text-primary-900 ${
                    pathname === menu.path ? 'text-primary-950' : 'text-primary-200'
                  }`}
                >
                  {menu.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogOut}
          className="flex w-[155px] items-center gap-1 p-2  group bg-primary-600 hover:bg-primary-300 rounded-lg py-2 px-3 mx-2 absolute bottom-5"
        >
          <FiLogOut
            size={26}
            className="rounded-lg p-1 group-hover:text-primary-900 text-primary-200"
          />
          <span className="ml-1 font-medium text-primary-200 group-hover:text-primary-900">
            Logout
          </span>
        </button>
      </aside>
    </section>
  );
};

export default SideBar;
