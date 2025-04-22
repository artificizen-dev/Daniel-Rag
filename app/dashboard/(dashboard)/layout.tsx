// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   IoCloudUploadOutline,
//   IoTimeOutline,
//   IoMenuOutline,
//   IoClose,
// } from "react-icons/io5";

// interface NavItem {
//   name: string;
//   path: string;
//   icon: React.ReactNode;
// }

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const pathname = usePathname();

//   const navItems: NavItem[] = [
//     {
//       name: "Upload Resource",
//       path: "/dashboard",
//       icon: <IoCloudUploadOutline size={20} />,
//     },
//     {
//       name: "Previous Resources",
//       path: "/dashboard/previous-resources",
//       icon: <IoTimeOutline size={20} />,
//     },
//   ];

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <aside
//         className={`${
//           isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
//         } bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative h-full z-10`}
//       >
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//           <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
//           <button
//             onClick={toggleSidebar}
//             className="p-1 rounded-md hover:bg-gray-100 md:hidden"
//             aria-label="Close sidebar"
//           >
//             <IoClose size={20} className="text-black" />
//           </button>
//         </div>

//         <nav className="p-4">
//           <ul className="space-y-2">
//             {navItems.map((item) => (
//               <li key={item.path}>
//                 <Link
//                   href={item.path}
//                   className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
//                     pathname === item.path
//                       ? "bg-blue-50 text-blue-600"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   {item.icon}
//                   <span>{item.name}</span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 overflow-auto">
//         <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center">
//           <button
//             onClick={toggleSidebar}
//             className={`p-2 rounded-md hover:bg-gray-100 mr-4 ${
//               isSidebarOpen ? "md:hidden" : ""
//             }`}
//             aria-label="Toggle sidebar"
//           >
//             <IoMenuOutline size={20} className="text-gray-600" />
//           </button>
//           <h1 className="text-lg font-semibold text-gray-800">
//             {pathname === "/dashboard/upload"
//               ? "Upload Resource"
//               : pathname === "/dashboard/resources"
//               ? "Previous Resources"
//               : "Dashboard"}
//           </h1>
//         </div>

//         <div className="p-6">{children}</div>
//       </main>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoCloudUploadOutline,
  IoTimeOutline,
  IoMenuOutline,
  IoClose,
  IoChatbubbleOutline,
} from "react-icons/io5";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="px-4 py-2.5 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 mr-4"
              aria-label="Toggle sidebar"
            >
              <IoMenuOutline size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {pathname === "/dashboard"
                ? "Upload Resource"
                : pathname === "/dashboard/resources"
                ? "Previous Resources"
                : "Dashboard"}
            </h1>
          </div>

          <Link
            href="/chat"
            className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <IoChatbubbleOutline size={18} />
            <span className="hidden sm:inline">Go to Chat</span>
          </Link>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
