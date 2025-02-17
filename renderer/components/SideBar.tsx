import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  FiFileText,
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { MdOutlinePostAdd } from "react-icons/md";

const SideBar = () => {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard/", icon: LuLayoutDashboard },
    {
      name: "New Invoice",
      path: "/dashboard/invoice/",
      icon: MdOutlinePostAdd,
    },
    { name: "View Invoices", path: "/dashboard/search/", icon: FiFileText },
    { name: "settings", path: "/dashboard/settings/", icon: FiSettings },
  ];

  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <section className="flex">
      <aside
        className={`${
          collapsed ? "w-16" : "w-48"
        } absolute z-50 h-screen bg-primary-100 border border-primary-700 transition-all duration-500`}
      >
        <div className={`flex items-center  border-b border-gray-200 p-2`}>
          <img src="/app_logo.png" alt="logo" className="w-[40px]" />
          {!collapsed && (
            <p className="font-bold text-2xl duration-500">
              <span className="">Reckon</span>
              <span className="text-primary-800">Up</span>
            </p>
          )}
        </div>
        <div
          className={`absolute ${
            collapsed ? "translate-x-10" : "translate-x-[172px]"
          } -translate-y-5 p-1 duration-500 z-10`}
        >
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-full bg-primary-300 hover:bg-primary-400"
          >
            {collapsed ? (
              <FiChevronRight className="w-5 h-5" />
            ) : (
              <FiChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className={`flex items-center flex-1 flex-col gap-y-3 py-2 mt-3`}>
          {menuItems.map((menu, index) => {
            return (
              <Link
                key={index}
                href={menu.path}
                className={`w-full flex items-center py-2 px-3 hover:bg-primary-300  ${
                  collapsed ? "hover:rounded-s-full" : "hover:rounded-s-full"
                }
                ${
                  pathname === menu.path &&
                  "rounded-s-full bg-primary-300 before:absolute before:content-[''] before:w-[3px] before:h-5 before:bg-primary-800"
                }
                `}
              >
                <menu.icon
                  size={37}
                  className={`rounded-xl p-2 ${
                    pathname === menu.path
                      ? "text-primary-900"
                      : "text-primary-700"
                  }`}
                />
                {!collapsed && (
                  <span
                    className={`ml-3 font-semibold ${
                      pathname === menu.path
                        ? "text-primary-900"
                        : "text-primary-700"
                    }`}
                  >
                    {menu.name}
                  </span>
                )}

                {/* {collapsed && (
                  <div className="absolute inset-y-0 left-12 hidden items-center group-hover:flex">
                    <div className="relative whitespace-nowrap rounded-md bg-primary-200 px-4 py-2 text-sm text-primary-600 drop-shadow-lg">
                      <div className="absolute inset-0 -left-1 flex items-center">
                        <div className="h-2 w-2 rotate-45 bg-primary-200"></div>
                      </div>
                      {menu.name}
                    </div>
                  </div>
                )} */}
              </Link>
            );
          })}
        </nav>
      </aside>
    </section>

    // <section className="flex bg-green-300 text-gray-900">
    //   <aside className="flex w-16 flex-col items-center bg-green-300 rounded-xl">
    //     <div className="flex h-[4.5rem] w-full items-center justify-center border-b border-gray-200 p-2">
    //       <Image src="/app_logo.png" alt="logo" width={170} height={170} />
    //     </div>
    //     <nav className="flex flex-1 flex-col gap-y-3 pt-5">
    //       {menuItems.map((menu, index) => {
    //         return (
    //           <Link
    //             key={index}
    //             href={menu.path}
    //             className={`group relative rounded-xl p-3 ${
    //               pathname === menu.path
    //                 ? "text-white bg-black/80 hover:shadow-lg"
    //                 : "hover:bg-black/50 hover:text-white"
    //             }`}
    //           >
    //             <menu.icon size={22} />

    //             <div className="absolute inset-y-0 left-12 hidden items-center group-hover:flex">
    //               <div className="relative whitespace-nowrap rounded-md bg-white px-4 py-2 text-sm   text-gray-900 drop-shadow-lg">
    //                 <div className="absolute inset-0 -left-1 flex items-center">
    //                   <div className="h-2 w-2 rotate-45 bg-white"></div>
    //                 </div>
    //                 {menu.name}
    //               </div>
    //             </div>
    //           </Link>
    //         );
    //       })}
    //     </nav>
    //   </aside>
    // </section>
  );
};

export default SideBar;
