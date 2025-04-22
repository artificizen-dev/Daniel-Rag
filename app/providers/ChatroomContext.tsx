// contexts/ChatroomContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { backendURL } from "@/app/utils/config";

// Define the chatroom type
export interface Chatroom {
  room_id: string;
  name: string;
  created_at: string;
  last_message?: string;
}

// Define the context type
interface ChatroomContextType {
  chatrooms: Chatroom[];
  isLoading: boolean;
  error: string | null;
  fetchChatrooms: () => Promise<void>;
  addChatroom: (chatroom: Chatroom) => void;
  removeChatroom: (roomId: string) => void;
}

// Create the context
const ChatroomContext = createContext<ChatroomContextType | undefined>(
  undefined
);

// Provider component
export const ChatroomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chatrooms
  const fetchChatrooms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendURL}/api/chatrooms`);

      if (!response.ok) {
        throw new Error("Failed to fetch chatrooms");
      }

      const data = await response.json();

      // Handle different possible response structures
      const fetchedChatrooms = data.chatrooms
        ? data.chatrooms
        : Array.isArray(data)
        ? data
        : [];

      setChatrooms(fetchedChatrooms);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      setError(errorMessage);
      setChatrooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new chatroom
  const addChatroom = (chatroom: Chatroom) => {
    setChatrooms((prev) => {
      // Prevent duplicates
      const exists = prev.some((room) => room.room_id === chatroom.room_id);
      return exists ? prev : [...prev, chatroom];
    });
  };

  // Remove a chatroom
  const removeChatroom = (roomId: string) => {
    setChatrooms((prev) => prev.filter((room) => room.room_id !== roomId));
  };

  // Fetch chatrooms on initial load
  useEffect(() => {
    fetchChatrooms();
  }, []);

  // Context value
  const contextValue = {
    chatrooms,
    isLoading,
    error,
    fetchChatrooms,
    addChatroom,
    removeChatroom,
  };

  return (
    <ChatroomContext.Provider value={contextValue}>
      {children}
    </ChatroomContext.Provider>
  );
};

// Custom hook to use the chatroom context
export const useChatrooms = () => {
  const context = useContext(ChatroomContext);

  if (context === undefined) {
    throw new Error("useChatrooms must be used within a ChatroomProvider");
  }

  return context;
};
