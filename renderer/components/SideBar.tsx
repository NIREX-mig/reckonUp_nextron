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
    { name: "New Invoice", path: "/dashboard/invoice/", icon: MdOutlinePostAdd},
    { name: "View Invoices", path: "/dashboard/search/", icon: FiFileText },
    { name: "settings", path: "/dashboard/settings/", icon: FiSettings },
  ];

  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <section className="flex">
      <aside
        className={`${
          collapsed ? "w-16" : "w-48"
        } absolute z-[150] h-screen bg-primary-100 border border-primary-700 transition-all duration-500`}
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
            className="p-1.5 rounded-full border border-primary-800 bg-primary-300 hover:bg-primary-400"
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
              </Link>
            );
          })}
        </nav>
      </aside>
    </section>
  );
};

export default SideBar;
