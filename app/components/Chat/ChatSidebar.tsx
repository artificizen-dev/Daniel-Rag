// "use client";

// import { useEffect, useState, useRef, useMemo } from "react";
// import {
//   IoSearch,
//   IoAddCircle,
//   IoClose,
//   IoDocumentTextOutline,
// } from "react-icons/io5";
// import { GoSidebarExpand } from "react-icons/go";
// import { backendURL, getToken } from "@/app/utils/config";
// import { useChatrooms } from "@/app/providers/ChatroomContext";
// import { Chatroom, ChatSidebarProps } from "@/app/interfaces";

// export default function ChatSidebar({
//   isOpen,
//   currentChatroomId,
//   // chatrooms,
//   onSelectChatroom,
//   onCreateNewChat,
//   onToggleSidebar,
// }: ChatSidebarProps) {
//   const token = getToken();
//   const { isLoading, chatrooms, fetchChatrooms } = useChatrooms();
//   const [searchParams, setSearchParams] = useState({
//     name: "",
//     start_date: "",
//     end_date: "",
//   });
//   const [searchResults, setSearchResults] = useState<Chatroom[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const performSearch = () => {
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     setIsSearching(true);
//     searchTimeoutRef.current = setTimeout(async () => {
//       try {
//         const queryParams = new URLSearchParams();
//         if (searchParams.name) queryParams.append("name", searchParams.name);
//         if (searchParams.start_date)
//           queryParams.append("start_date", searchParams.start_date);
//         if (searchParams.end_date)
//           queryParams.append("end_date", searchParams.end_date);

//         const response = await fetch(
//           `${backendURL}/api/search_chatrooms?${queryParams.toString()}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Search failed");

//         const data = await response.json();
//         setSearchResults(data?.chatrooms);
//       } catch (error) {
//         console.error("Error searching chatrooms:", error);
//         setSearchResults([]);
//       } finally {
//         setIsSearching(false);
//       }
//     }, 300);
//   };

//   // Set isMounted to true after component mounts to prevent hydration issues
//   useEffect(() => {
//     setIsMounted(true);
//     fetchChatrooms();
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!isMounted) return;

//     // Only perform search if at least one search parameter is not empty
//     if (
//       searchParams.name.trim() !== "" ||
//       searchParams.start_date !== "" ||
//       searchParams.end_date !== ""
//     ) {
//       performSearch();
//     } else {
//       setSearchResults([]);
//       setIsSearching(false);
//     }
//   }, [searchParams, isMounted]);

//   const displayedChatrooms = useMemo(() => {
//     return searchParams.name.trim() !== "" ||
//       searchParams.start_date !== "" ||
//       searchParams.end_date !== ""
//       ? searchResults
//       : chatrooms;
//   }, [searchParams, searchResults, chatrooms]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSearchParams((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   if (!isMounted) {
//     return (
//       <div
//         className={`flex flex-col bg-gray-50 border-r border-gray-200 h-full transition-all duration-300 ${
//           isOpen ? "w-80" : "w-0"
//         } overflow-hidden`}
//       >
//         {isOpen && <div className="p-4"></div>}
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`flex flex-col border-r border-gray-200 h-full transition-all duration-300 ${
//         isOpen ? "w-70" : "w-0"
//       } overflow-hidden`}
//     >
//       {isOpen && (
//         <>
//           <div className="p-4 flex items-center justify-between border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Conversations
//             </h2>
//             <button
//               onClick={onToggleSidebar}
//               className="p-1 rounded-md hover:bg-gray-200 transition-colors"
//               aria-label="Close sidebar"
//             >
//               <GoSidebarExpand size={20} className="text-gray-600" />
//             </button>
//           </div>

//           {/* Search Section */}
//           <div className="px-4 py-2 space-y-2">
//             <div className="relative">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Search conversations..."
//                 value={searchParams.name}
//                 onChange={handleSearchChange}
//                 className="w-full py-2 pl-9 pr-4 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
//               />
//               <IoSearch
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               {searchParams.name && (
//                 <button
//                   onClick={() =>
//                     setSearchParams((prev) => ({ ...prev, name: "" }))
//                   }
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   <IoClose size={16} />
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="px-4 py-1">
//             <button
//               onClick={onCreateNewChat}
//               className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
//             >
//               <IoAddCircle size={18} />
//               <span>New Conversation</span>
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             {isLoading ? (
//               <div className="p-4 text-center text-gray-500">
//                 Loading conversations...
//               </div>
//             ) : isSearching ? (
//               <div className="p-4 text-center text-gray-500">Searching...</div>
//             ) : displayedChatrooms.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 {searchParams.name.trim() !== "" ||
//                 searchParams.start_date !== "" ||
//                 searchParams.end_date !== ""
//                   ? "No conversations found"
//                   : "No conversations yet"}
//               </div>
//             ) : (
//               <ul className="divide-y divide-gray-200">
//                 {displayedChatrooms.map((chatroom) => (
//                   <li
//                     key={chatroom.room_id}
//                     className="hover:bg-gray-100 transition cursor-pointer"
//                   >
//                     <button
//                       onClick={() => onSelectChatroom(chatroom.room_id)}
//                       className={`w-full p-4 text-left flex items-start space-x-3 ${
//                         currentChatroomId === chatroom.room_id
//                           ? "bg-blue-50"
//                           : ""
//                       }`}
//                     >
//                       <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
//                         <IoDocumentTextOutline size={20} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex flex-col">
//                           <div className="flex justify-between items-center">
//                             <h3 className="font-semibold text-gray-800 truncate max-w-[180px]">
//                               {chatroom.name || "Untitled Conversation"}
//                             </h3>
//                           </div>
//                         </div>
//                       </div>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  IoSearch,
  IoAddCircle,
  IoClose,
  IoDocumentTextOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { GoSidebarExpand } from "react-icons/go";
import { backendURL, getToken } from "@/app/utils/config";
import { useChatrooms } from "@/app/providers/ChatroomContext";
import { Chatroom, ChatSidebarProps } from "@/app/interfaces";
import { Popconfirm, message } from "antd";

export default function ChatSidebar({
  isOpen,
  currentChatroomId,
  // chatrooms,
  onSelectChatroom,
  onCreateNewChat,
  onToggleSidebar,
}: ChatSidebarProps) {
  const token = getToken();
  const { isLoading, chatrooms, fetchChatrooms } = useChatrooms();
  const [searchParams, setSearchParams] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [searchResults, setSearchResults] = useState<Chatroom[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [deletingChatroomId, setDeletingChatroomId] = useState<string | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log(deletingChatroomId);

  const performSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchParams.name) queryParams.append("name", searchParams.name);
        if (searchParams.start_date)
          queryParams.append("start_date", searchParams.start_date);
        if (searchParams.end_date)
          queryParams.append("end_date", searchParams.end_date);

        const response = await fetch(
          `${backendURL}/api/search_chatrooms?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setSearchResults(data?.chatrooms);
      } catch (error) {
        console.error("Error searching chatrooms:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Delete chatroom function
  const handleDeleteChatroom = async (
    chatroomId: string,
    e: React.MouseEvent
  ) => {
    // Stop event propagation to prevent selecting the chatroom when clicking delete
    e.stopPropagation();

    try {
      const response = await fetch(
        `${backendURL}/api/chatrooms/${chatroomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete conversation");

      messageApi.success("Conversation deleted successfully");

      // If the deleted chatroom was the current one, clear it
      if (chatroomId === currentChatroomId) {
        onSelectChatroom("");
      }

      // Refresh the chatroom list
      fetchChatrooms();

      // Also update search results if search is active
      if (
        searchParams.name ||
        searchParams.start_date ||
        searchParams.end_date
      ) {
        performSearch();
      }
    } catch (error) {
      console.error("Error deleting chatroom:", error);
      messageApi.error("Failed to delete conversation");
    } finally {
      setDeletingChatroomId(null);
    }
  };

  // Set isMounted to true after component mounts to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    fetchChatrooms();
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Only perform search if at least one search parameter is not empty
    if (
      searchParams.name.trim() !== "" ||
      searchParams.start_date !== "" ||
      searchParams.end_date !== ""
    ) {
      performSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchParams, isMounted]);

  const displayedChatrooms = useMemo(() => {
    return searchParams.name.trim() !== "" ||
      searchParams.start_date !== "" ||
      searchParams.end_date !== ""
      ? searchResults
      : chatrooms;
  }, [searchParams, searchResults, chatrooms]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isMounted) {
    return (
      <div
        className={`flex flex-col bg-gray-50 border-r border-gray-200 h-full transition-all duration-300 ${
          isOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        {isOpen && <div className="p-4"></div>}
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div
        className={`flex flex-col border-r border-gray-200 h-full transition-all duration-300 ${
          isOpen ? "w-70" : "w-0"
        } overflow-hidden`}
      >
        {isOpen && (
          <>
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Conversations
              </h2>
              <button
                onClick={onToggleSidebar}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                aria-label="Close sidebar"
              >
                <GoSidebarExpand size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Search Section */}
            <div className="px-4 py-2 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Search conversations..."
                  value={searchParams.name}
                  onChange={handleSearchChange}
                  className="w-full py-2 pl-9 pr-4 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
                <IoSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                {searchParams.name && (
                  <button
                    onClick={() =>
                      setSearchParams((prev) => ({ ...prev, name: "" }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <IoClose size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 py-1">
              <button
                onClick={onCreateNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
              >
                <IoAddCircle size={18} />
                <span>New Conversation</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading conversations...
                </div>
              ) : isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  Searching...
                </div>
              ) : displayedChatrooms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchParams.name.trim() !== "" ||
                  searchParams.start_date !== "" ||
                  searchParams.end_date !== ""
                    ? "No conversations found"
                    : "No conversations yet"}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {displayedChatrooms.map((chatroom) => (
                    <li
                      key={chatroom.room_id}
                      className="hover:bg-gray-100 transition cursor-pointer group"
                    >
                      <div
                        onClick={() => onSelectChatroom(chatroom.room_id)}
                        className={`w-full p-4 text-left ${
                          currentChatroomId === chatroom.room_id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                            <IoDocumentTextOutline size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 truncate max-w-[180px]">
                                  {chatroom.name || "Untitled Conversation"}
                                </h3>
                              </div>

                              {/* Delete button with confirmation - only visible on hover */}
                              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Popconfirm
                                  title="Delete Conversation"
                                  description="Are you sure you want to delete this conversation? This action cannot be undone."
                                  onConfirm={(e) =>
                                    handleDeleteChatroom(
                                      chatroom.room_id,
                                      e as React.MouseEvent
                                    )
                                  }
                                  okText="Delete"
                                  cancelText="Cancel"
                                  okButtonProps={{ danger: true }}
                                  placement="bottom"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingChatroomId(chatroom.room_id);
                                    }}
                                    className="flex items-center text-gray-400 hover:text-red-500 text-xs font-medium transition-colors"
                                    aria-label="Delete conversation"
                                  >
                                    <IoTrashOutline
                                      size={14}
                                      className="mr-1"
                                    />
                                    Delete
                                  </button>
                                </Popconfirm>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
