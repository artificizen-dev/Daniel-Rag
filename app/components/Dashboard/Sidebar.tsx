"use client";
import Link from "next/link";
import { IoCloudUploadOutline, IoTimeOutline, IoClose } from "react-icons/io5";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  pathname: string;
}

export default function DashboardSidebar({
  isSidebarOpen,
  isMobile,
  toggleSidebar,
  pathname,
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      name: "Upload Resource",
      path: "/dashboard",
      icon: <IoCloudUploadOutline size={20} />,
    },
    {
      name: "Previous Resources",
      path: "/dashboard/previous-resources",
      icon: <IoTimeOutline size={20} />,
    },
    {
      name: "Previous Chats",
      path: "/dashboard/previous-chats",
      icon: <IoTimeOutline size={20} />,
    },
  ];

  return (
    <aside
      className={`fixed md:relative h-full z-20 bg-white border-r border-gray-200 transition-all duration-300 ${
        isSidebarOpen
          ? "translate-x-0 w-64"
          : "-translate-x-full md:translate-x-0 md:w-0 w-0 overflow-hidden"
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Close sidebar"
        >
          <IoClose size={20} className="text-black" />
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
