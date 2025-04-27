"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { backendURL, getToken } from "@/app/utils/config";
import { handleError, handleSuccess } from "../utils/messageUtils";
import { Chatroom, ChatroomContextType } from "../interfaces";
import { handleApiError } from "../utils/handleApiError";
import { useAuth } from "./AuthContext";

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
  const { logout } = useAuth();

  // Fetch chatrooms
  const fetchChatrooms = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      setError("Authentication required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendURL}/api/chatrooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log("auth error");
        // Create error object with status
        const authError = {
          status: 401,
          message: "Unauthorized",
        };

        // Hand off to error handler with the status information
        handleApiError(authError, logout);

        // Exit function early
        setIsLoading(false);
        return;
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
  const addChatroom = async (chatroom: Chatroom) => {
    setChatrooms((prev) => {
      // Prevent duplicates
      const exists = prev.some((room) => room.room_id === chatroom.room_id);
      if (exists) return prev;

      handleSuccess(`Joined chatroom: ${chatroom.name}`);
      return [...prev, chatroom];
    });
  };

  // Create a new chatroom
  const createChatroom = async (name: string): Promise<Chatroom | null> => {
    const token = getToken();
    if (!token) {
      handleError("Authentication required to create a chatroom");
      return null;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${backendURL}/api/chatrooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create chatroom");
      }

      const newChatroom = await response.json();

      setChatrooms((prev) => [...prev, newChatroom]);
      handleSuccess(`Chatroom "${name}" created successfully`);

      return newChatroom;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      handleError(`Failed to create chatroom: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a chatroom
  const removeChatroom = async (roomId: string) => {
    const token = getToken();
    if (!token) {
      handleError("Authentication required to remove a chatroom");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/api/chatrooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete chatroom");
      }

      setChatrooms((prev) => {
        const filtered = prev.filter((room) => room.room_id !== roomId);
        const removedRoom = prev.find((room) => room.room_id === roomId);
        if (removedRoom) {
          handleSuccess(`Chatroom "${removedRoom.name}" removed`);
        }
        return filtered;
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      handleError(`Failed to remove chatroom: ${errorMessage}`);
    }
  };

  // Fetch chatrooms on initial load, but only if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchChatrooms();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Context value
  const contextValue = {
    chatrooms,
    isLoading,
    error,
    fetchChatrooms,
    addChatroom,
    createChatroom,
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
