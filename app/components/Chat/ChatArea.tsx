"use client";

import { useState, useEffect, useRef } from "react";
import { backendURL, getToken } from "@/app/utils/config";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { ChatAreaProps, Message, Resource } from "@/app/interfaces";
import { useChatrooms } from "@/app/providers/ChatroomContext";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/app/utils/handleApiError";
import { useAuth } from "@/app/providers/AuthContext";
import ChatResources from "./ChatResources";
import { HiOutlineDocument } from "react-icons/hi";

interface ConversationItem {
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
  image?: string | null;
  references?: Resource[];
}

export default function ChatArea({
  // createNewChatroom,
  chatroomId,
  isSidebarOpen,
  onToggleSidebar,
  setCurrentChatroomId,
}: ChatAreaProps) {
  const router = useRouter();
  const token = getToken();
  const { logout } = useAuth();
  const { fetchChatrooms, chatrooms } = useChatrooms();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantMessageId = useRef<string>("");
  const toggleResources = () => setIsResourcesOpen((prev) => !prev);

  const fetchMessages = async () => {
    if (!chatroomId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${backendURL}/api/chatrooms/${chatroomId}/conversations?page=1&page_size=15`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch messages");

      if (response.status === 401) {
        handleApiError({ status: 401, message: "Unauthorized" }, logout);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.conversations && Array.isArray(data.conversations)) {
        const formattedMessages: Message[] = data.conversations.map(
          (conv: ConversationItem) => {
            const attachments = conv.image
              ? [
                  {
                    url: conv.image.startsWith("data:")
                      ? conv.image
                      : `data:image/jpeg;base64,${conv.image}`,
                    type: "image/jpeg",
                  },
                ]
              : [];

            return {
              id: conv.conversation_id,
              content: conv.content,
              sender: conv.role === "user" ? "user" : "assistant",
              created_at: conv.created_at,
              references: conv.references || [],
              attachments,
            };
          }
        );
        setMessages(formattedMessages);
      } else if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatroomId) {
      fetchMessages();
    } else {
      setMessages([]);
      setResources([]);
    }
  }, [chatroomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchResources = async () => {
    if (!chatroomId) return;

    try {
      setIsLoadingResources(true);
      const response = await fetch(
        `${backendURL}/api/get_reference_chunks?chatroom_id=${chatroomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch resources");
      if (response.status === 401) {
        const authError = {
          status: 401,
          message: "Unauthorized",
        };

        handleApiError(authError, logout);

        setIsLoadingResources(false);
        return;
      }

      const data = await response.json();

      if (data && data.chunks && Array.isArray(data.chunks)) {
        setResources(data.chunks);
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResources([]);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleSendMessage = async (
    content: string,
    attachments: File[] = []
  ) => {
    if (!content.trim() && attachments.length === 0) return;
    const formData = new FormData();

    setIsSending(true);

    if (!chatroomId) {
      const newChatroomId = uuidv4();

      await new Promise<void>((resolve) => {
        setCurrentChatroomId(newChatroomId);
        router.push(`/chat?chatroom_id=${newChatroomId}`, { scroll: false });

        formData.append("chatroom_id", newChatroomId);

        setTimeout(() => {
          setCurrentChatroomId(newChatroomId);
          resolve();
        }, 100);
      });
    }

    formData.append("user_text_query", content);

    if (attachments.length > 0) {
      formData.append("image_query", attachments[0]);
    }

    if (chatroomId) {
      formData.append("chatroom_id", chatroomId);
    }

    if (selectedResources.length > 0) {
      selectedResources.forEach((fileName) => {
        formData.append("filenames", fileName);
      });
    }

    try {
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        sender: "user",
        created_at: new Date().toISOString(),
        attachments: attachments.map((file) => ({
          type: file.type,
          url: URL.createObjectURL(file),
        })),
      };

      setMessages((prev) => [...prev, tempUserMessage]);
      const streamingMessageId = `assistant-${Date.now()}`;
      assistantMessageId.current = streamingMessageId;

      const streamingMessage: Message = {
        id: streamingMessageId,
        content: "Generating response...",
        sender: "assistant",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, streamingMessage]);

      const response = await fetch(`${backendURL}/api/generate_response`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send message");

      if (response.status === 401) {
        const authError = {
          status: 401,
          message: "Unauthorized",
        };

        handleApiError(authError, logout);

        setIsSending(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      let receivedText = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        receivedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId
              ? { ...msg, content: receivedText }
              : msg
          )
        );
      }

      fetchResources();

      const isNewChatroom = !chatrooms.some(
        (room) => room.room_id === chatroomId
      );

      if (isNewChatroom) {
        fetchChatrooms();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId.current
            ? {
                ...msg,
                content: "Error generating response. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto flex flex-col h-full bg-white relative">
      <ChatHeader
        chatroomId={chatroomId}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="absolute top-15 right-0 z-10 p-4">
        <button
          onClick={toggleResources}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <HiOutlineDocument className="w-5 h-5" />
          <span>Resources</span>
        </button>
      </div>

      <div className="md:max-w-[48rem] md:min-w-[48rem] mx-auto w-full flex-1 flex flex-col relative overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-gray-500">
              <h2 className="text-2xl font-semibold mb-4">
                What can I help with?
              </h2>
              <p className="text-gray-400">
                Send a message to begin conversation
              </p>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            resources={resources}
            isLoadingResources={isLoadingResources}
            // @ts-expect-error - React refs are initially null but will be assigned at runtime
            messagesEndRef={messagesEndRef}
          />
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
          hasMessages={messages.length > 0}
        />
        {isResourcesOpen && (
          <aside
            className={`fixed top-0 z-30 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
             ${isResourcesOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="text-lg font-medium">Resources</h3>
              <button
                onClick={toggleResources}
                className="flex items-center justify-center px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 transition-all duration-200"
              >
                Done
              </button>
            </div>
            <div>
              <ChatResources
                selectedResources={selectedResources}
                onSelectionChange={setSelectedResources}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
