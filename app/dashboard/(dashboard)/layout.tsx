// // "use client";
// // import { useState } from "react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import {
// //   IoCloudUploadOutline,
// //   IoTimeOutline,
// //   IoMenuOutline,
// //   IoClose,
// // } from "react-icons/io5";

// // interface NavItem {
// //   name: string;
// //   path: string;
// //   icon: React.ReactNode;
// // }

// // export default function DashboardLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
// //   const pathname = usePathname();

// //   const navItems: NavItem[] = [
// //     {
// //       name: "Upload Resource",
// //       path: "/dashboard",
// //       icon: <IoCloudUploadOutline size={20} />,
// //     },
// //     {
// //       name: "Previous Resources",
// //       path: "/dashboard/previous-resources",
// //       icon: <IoTimeOutline size={20} />,
// //     },
// //   ];

// //   const toggleSidebar = () => {
// //     setIsSidebarOpen(!isSidebarOpen);
// //   };

// //   return (
// //     <div className="flex h-screen bg-gray-50">
// //       {/* Sidebar */}
// //       <aside
// //         className={`${
// //           isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
// //         } bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative h-full z-10`}
// //       >
// //         <div className="p-4 border-b border-gray-200 flex items-center justify-between">
// //           <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
// //           <button
// //             onClick={toggleSidebar}
// //             className="p-1 rounded-md hover:bg-gray-100 md:hidden"
// //             aria-label="Close sidebar"
// //           >
// //             <IoClose size={20} className="text-black" />
// //           </button>
// //         </div>

// //         <nav className="p-4">
// //           <ul className="space-y-2">
// //             {navItems.map((item) => (
// //               <li key={item.path}>
// //                 <Link
// //                   href={item.path}
// //                   className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
// //                     pathname === item.path
// //                       ? "bg-blue-50 text-blue-600"
// //                       : "text-gray-700 hover:bg-gray-100"
// //                   }`}
// //                 >
// //                   {item.icon}
// //                   <span>{item.name}</span>
// //                 </Link>
// //               </li>
// //             ))}
// //           </ul>
// //         </nav>
// //       </aside>

// //       {/* Main Content */}
// //       <main className="flex-1 overflow-auto">
// //         <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center">
// //           <button
// //             onClick={toggleSidebar}
// //             className={`p-2 rounded-md hover:bg-gray-100 mr-4 ${
// //               isSidebarOpen ? "md:hidden" : ""
// //             }`}
// //             aria-label="Toggle sidebar"
// //           >
// //             <IoMenuOutline size={20} className="text-gray-600" />
// //           </button>
// //           <h1 className="text-lg font-semibold text-gray-800">
// //             {pathname === "/dashboard/upload"
// //               ? "Upload Resource"
// //               : pathname === "/dashboard/resources"
// //               ? "Previous Resources"
// //               : "Dashboard"}
// //           </h1>
// //         </div>

// //         <div className="p-6">{children}</div>
// //       </main>
// //     </div>
// //   );
// // }

// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   IoCloudUploadOutline,
//   IoTimeOutline,
//   IoMenuOutline,
//   IoClose,
//   IoChatbubbleOutline,
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
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const pathname = usePathname();

//   // Handle responsive behavior
//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//       if (window.innerWidth >= 768) {
//         setIsSidebarOpen(true);
//       } else {
//         setIsSidebarOpen(false);
//       }
//     };

//     // Set initial state
//     checkIfMobile();

//     // Add event listener
//     window.addEventListener("resize", checkIfMobile);

//     // Cleanup
//     return () => window.removeEventListener("resize", checkIfMobile);
//   }, []);

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
//     <div className="flex h-screen bg-gray-50 relative">
//       {/* Overlay for mobile when sidebar is open */}
//       {isMobile && isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-10"
//           onClick={toggleSidebar}
//         ></div>
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed md:relative h-full z-20 bg-white border-r border-gray-200 transition-all duration-300 ${
//           isSidebarOpen
//             ? "translate-x-0 w-64"
//             : "-translate-x-full md:translate-x-0 md:w-0 w-0 overflow-hidden"
//         }`}
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
//                   onClick={isMobile ? toggleSidebar : undefined}
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
//         <div className="px-4 py-2.5 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
//           <div className="flex items-center">
//             <button
//               onClick={toggleSidebar}
//               className="p-2 rounded-md hover:bg-gray-100 mr-4"
//               aria-label="Toggle sidebar"
//             >
//               <IoMenuOutline size={20} className="text-gray-600" />
//             </button>
//             <h1 className="text-lg font-semibold text-gray-800">
//               {pathname === "/dashboard"
//                 ? "Upload Resource"
//                 : pathname === "/dashboard/resources"
//                 ? "Previous Resources"
//                 : "Dashboard"}
//             </h1>
//           </div>

//           <Link
//             href="/chat"
//             className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//           >
//             <IoChatbubbleOutline size={18} />
//             <span className="hidden sm:inline">Go to Chat</span>
//           </Link>
//         </div>

//         <div className="p-6">{children}</div>
//       </main>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Avatar from "boring-avatars";
import {
  IoCloudUploadOutline,
  IoTimeOutline,
  IoMenuOutline,
  IoClose,
  IoChatbubbleOutline,
} from "react-icons/io5";
import { useAuth } from "@/app/providers/AuthContext";
import { handleError } from "@/app/utils/messageUtils";

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
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      handleError("Please login to access this page");
      router.replace("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

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

  // Close avatar menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  // If no user is available, show placeholder name and email
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@example.com";

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Fixed Header */}
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
                : pathname === "/dashboard/previous-resources"
                ? "Previous Resources"
                : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <IoChatbubbleOutline size={18} />
              <span className="hidden sm:inline">Go to Chat</span>
            </Link>

            {/* Avatar with Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                className="flex items-center cursor-pointer rounded-full overflow-hidden hover:opacity-90 transition-opacity"
                aria-label="User menu"
              >
                <Avatar
                  size={32}
                  name={displayName}
                  variant="beam"
                  colors={[
                    "#92A1C6",
                    "#146A7C",
                    "#F0AB3D",
                    "#C271B4",
                    "#C20D90",
                  ]}
                />
              </button>

              {isAvatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-30">
                  <div className="py-2 px-4 border-b border-gray-100">
                    <p className="font-medium text-gray-800">{displayName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {displayEmail}
                    </p>
                  </div>
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        <svg
                          className="mr-2 w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
