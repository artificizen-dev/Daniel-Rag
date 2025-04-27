"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Avatar from "boring-avatars";
import { IoMenuOutline, IoChatbubbleOutline } from "react-icons/io5";
import { User } from "@/app/interfaces";

interface HeaderProps {
  user: User | null;
  pathname: string;
  toggleSidebar: () => void;
  handleSignOut: () => void;
}

export default function DashboardHeader({
  user,
  pathname,
  toggleSidebar,
  handleSignOut,
}: HeaderProps) {
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@example.com";

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Upload Resource";
    if (pathname === "/dashboard/previous-resources")
      return "Previous Resources";
    return "Dashboard";
  };

  return (
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
          {getPageTitle()}
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
        <UserAvatar
          displayName={displayName}
          displayEmail={displayEmail}
          isMenuOpen={isAvatarMenuOpen}
          setIsMenuOpen={setIsAvatarMenuOpen}
          handleSignOut={handleSignOut}
          menuRef={menuRef}
        />
      </div>
    </div>
  );
}

// User Avatar component with dropdown
interface UserAvatarProps {
  displayName: string;
  displayEmail: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  handleSignOut: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

function UserAvatar({
  displayName,
  displayEmail,
  isMenuOpen,
  setIsMenuOpen,
  handleSignOut,
  menuRef,
}: UserAvatarProps) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center cursor-pointer rounded-full overflow-hidden hover:opacity-90 transition-opacity"
        aria-label="User menu"
      >
        <Avatar
          size={32}
          name={displayName}
          variant="beam"
          colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
        />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-30">
          <div className="py-2 px-4 border-b border-gray-100">
            <p className="font-medium text-gray-800">{displayName}</p>
            <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
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
  );
}
