// "use client";

// import { useEffect, useState, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { backendURL, getToken } from "../utils/config";
// import ChatArea from "../components/Chat/ChatArea";
// import ChatSidebar from "../components/Chat/ChatSidebar";
// import { v4 as uuidv4 } from "uuid";
// import { Chatroom } from "../interfaces";

// function ChatPageContent() {
//   const router = useRouter();
//   const token = getToken()
//   const searchParams = useSearchParams();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(
//     searchParams.get("chatroom_id") || null
//   );
//   const [isLoading, setIsLoading] = useState(true);
//   const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
//   const [isMounted, setIsMounted] = useState(false);

//   const fetchChatrooms = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${backendURL}/api/chatrooms`);
//       if (!response.ok) throw new Error("Failed to fetch chatrooms");

//       const data = await response.json();

//       let fetchedChatrooms: Chatroom[] = [];
//       if (data && data.chatrooms && Array.isArray(data.chatrooms)) {
//         fetchedChatrooms = data.chatrooms;
//       } else if (Array.isArray(data)) {
//         fetchedChatrooms = data;
//       }

//       setChatrooms(fetchedChatrooms);

//       // If no current chatroom and chatrooms exist, select the first one
//       if (!currentChatroomId && fetchedChatrooms.length > 0) {
//         const firstChatroomId = fetchedChatrooms[0].room_id;
//         setCurrentChatroomId(firstChatroomId);
//         router.push(`/chat?chatroom_id=${firstChatroomId}`, { scroll: false });
//       }
//     } catch (error) {
//       console.error("Error fetching chatrooms:", error);
//       setChatrooms([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     setIsMounted(true);
//     fetchChatrooms();
//   }, []);

//   useEffect(() => {
//     if (!isMounted) return;

//     if (currentChatroomId) {
//       router.push(`/chat?chatroom_id=${currentChatroomId}`, { scroll: false });
//     }
//   }, [currentChatroomId, router, isMounted]);

//   const createNewChatroom = () => {
//     const newChatroomId = uuidv4();
//     setCurrentChatroomId(newChatroomId);

//     router.push(`/chat?chatroom_id=${newChatroomId}`, { scroll: false });

//     setCurrentChatroomId(null);

//     fetchChatrooms();

//     setTimeout(() => {
//       setCurrentChatroomId(newChatroomId);
//     }, 0);
//   };

//   const handleSelectChatroom = (chatroomId: string) => {
//     setCurrentChatroomId(chatroomId);
//     router.push(`/chat?chatroom_id=${chatroomId}`, { scroll: false });
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   if (!isMounted) {
//     return <div className="h-screen bg-white"></div>;
//   }

//   return (
//     <div className="flex h-screen bg-white overflow-hidden">
//       <ChatSidebar
//         isOpen={isSidebarOpen}
//         chatrooms={chatrooms}
//         isloading={isLoading}
//         currentChatroomId={currentChatroomId}
//         onSelectChatroom={handleSelectChatroom}
//         onCreateNewChat={createNewChatroom}
//         onToggleSidebar={toggleSidebar}
//       />

//       <ChatArea
//         chatroomId={currentChatroomId}
//         createNewChatroom={createNewChatroom}
//         onToggleSidebar={toggleSidebar}
//         isSidebarOpen={isSidebarOpen}
//         refreshChatrooms={fetchChatrooms}
//       />
//     </div>
//   );
// }

// export default function ChatPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="h-screen bg-white flex items-center justify-center">
//           Loading...
//         </div>
//       }
//     >
//       <ChatPageContent />
//     </Suspense>
//   );
// }

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { backendURL, getToken } from "../utils/config";
import ChatArea from "../components/Chat/ChatArea";
import ChatSidebar from "../components/Chat/ChatSidebar";
import { v4 as uuidv4 } from "uuid";
import { Chatroom } from "../interfaces";
import { handleError } from "@/app/utils/messageUtils";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(
    searchParams.get("chatroom_id") || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const fetchChatrooms = async () => {
    setIsLoading(true);

    // Get the auth token
    const token = getToken();
    if (!token) {
      handleError("Authentication required to access chat");
      router.push("/");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/api/chatrooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch chatrooms");

      const data = await response.json();

      let fetchedChatrooms: Chatroom[] = [];
      if (data && data.chatrooms && Array.isArray(data.chatrooms)) {
        fetchedChatrooms = data.chatrooms;
      } else if (Array.isArray(data)) {
        fetchedChatrooms = data;
      }

      setChatrooms(fetchedChatrooms);

      // If no current chatroom and chatrooms exist, select the first one
      if (!currentChatroomId && fetchedChatrooms.length > 0) {
        const firstChatroomId = fetchedChatrooms[0].room_id;
        setCurrentChatroomId(firstChatroomId);
        router.push(`/chat?chatroom_id=${firstChatroomId}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error fetching chatrooms:", error);
      setChatrooms([]);

      // Check if the error is due to authentication issues
      if (error instanceof Error && error.message.includes("401")) {
        handleError("Authentication expired. Please log in again.");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for authentication before mounting
    const token = getToken();
    if (!token) {
      handleError("Please login to access chat");
      router.push("/");
      return;
    }

    setIsMounted(true);
    fetchChatrooms();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (currentChatroomId) {
      router.push(`/chat?chatroom_id=${currentChatroomId}`, { scroll: false });
    }
  }, [currentChatroomId, router, isMounted]);

  const createNewChatroom = () => {
    const newChatroomId = uuidv4();
    setCurrentChatroomId(newChatroomId);

    router.push(`/chat?chatroom_id=${newChatroomId}`, { scroll: false });

    setCurrentChatroomId(null);

    fetchChatrooms();

    setTimeout(() => {
      setCurrentChatroomId(newChatroomId);
    }, 0);
  };

  const handleSelectChatroom = (chatroomId: string) => {
    setCurrentChatroomId(chatroomId);
    router.push(`/chat?chatroom_id=${chatroomId}`, { scroll: false });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isMounted) {
    return <div className="h-screen bg-white"></div>;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <ChatSidebar
        isOpen={isSidebarOpen}
        chatrooms={chatrooms}
        isloading={isLoading}
        currentChatroomId={currentChatroomId}
        onSelectChatroom={handleSelectChatroom}
        onCreateNewChat={createNewChatroom}
        onToggleSidebar={toggleSidebar}
      />

      <ChatArea
        chatroomId={currentChatroomId}
        createNewChatroom={createNewChatroom}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        refreshChatrooms={fetchChatrooms}
        setCurrentChatroomId={setCurrentChatroomId}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
