// components/chat/ChatHeader.tsx
"use client";

import Avatar from "boring-avatars";
import { useState, useRef, useEffect } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { IoSettingsSharp } from "react-icons/io5";
import Link from "next/link";
import { ChatHeaderProps } from "@/app/interfaces";

export default function ChatHeader({
  chatroomId,
  isSidebarOpen,
  onToggleSidebar,
}: ChatHeaderProps) {
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <GoSidebarCollapse size={20} className="text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-800">
            {chatroomId ? "Conversation" : "New Conversation"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="flex items-center cursor-pointer rounded-full overflow-hidden hover:opacity-90 transition-opacity"
              aria-label="User menu"
            >
              <Avatar
                size={30}
                name="Margaret Brent"
                variant="beam"
                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
              />
            </button>

            {isAvatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                <div className="py-2 px-4 border-b border-gray-100">
                  <p className="font-medium text-gray-800">Margaret Brent</p>
                  <p className="text-sm text-gray-500 truncate">
                    margaret@example.com
                  </p>
                </div>
                <ul className="py-2">
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <IoSettingsSharp className="mr-2 text-gray-600" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button className="w-full text-left flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
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
    </header>
  );
}
