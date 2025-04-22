// "use client";

// import { useState, useEffect, useRef } from "react";
// import { backendURL } from "@/app/utils/config";
// import ChatHeader from "./ChatHeader";
// import MessageList from "./MessageList";
// import ChatInput from "./ChatInput";
// import { ChatAreaProps, Message } from "@/app/interfaces";
// import { useChatrooms } from "@/app/providers/ChatroomContext";

// export default function ChatArea({
//   createNewChatroom,
//   chatroomId,
//   isSidebarOpen,
//   onToggleSidebar,
// }: ChatAreaProps) {
//   const { fetchChatrooms, chatrooms } = useChatrooms();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [resources, setResources] = useState<any[]>([]);
//   // Define messagesEndRef with the correct type to match MessageListProps
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const assistantMessageId = useRef<string>("");

//   useEffect(() => {
//     if (chatroomId) {
//       fetchMessages();
//     } else {
//       setMessages([]);
//       setResources([]);
//     }
//   }, [chatroomId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const fetchMessages = async () => {
//     if (!chatroomId) return;

//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `${backendURL}/api/chatrooms/${chatroomId}/conversations?page=1&page_size=15`
//       );

//       if (response.status === 404) {
//         setIsLoading(false);
//         return;
//       }

//       if (!response.ok) throw new Error("Failed to fetch messages");

//       const data = await response.json();

//       if (data.conversations && Array.isArray(data.conversations)) {
//         const formattedMessages = data.conversations.map((conv: any) => ({
//           id: conv.conversation_id,
//           content: conv.content,
//           sender: conv.role === "user" ? "user" : "assistant",
//           created_at: conv.created_at,
//         }));
//         setMessages(formattedMessages);
//       } else if (Array.isArray(data)) {
//         setMessages(data);
//       } else {
//         setMessages([]);
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       setMessages([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchResources = async () => {
//     if (!chatroomId) return;

//     try {
//       const response = await fetch(
//         `${backendURL}/api/search_resources?chatroom_id=${chatroomId}`
//       );
//       if (!response.ok) throw new Error("Failed to fetch resources");

//       const data = await response.json();

//       if (Array.isArray(data)) {
//         setResources(data);
//       } else if (data && data.resources && Array.isArray(data.resources)) {
//         setResources(data.resources);
//       } else {
//         setResources([]);
//       }
//     } catch (error) {
//       console.error("Error fetching resources:", error);
//       setResources([]);
//     }
//   };

//   const handleSendMessage = async (
//     content: string,
//     attachments: File[] = []
//   ) => {
//     if (!content.trim() && attachments.length === 0) return;

//     setIsSending(true);

//     if (!chatroomId) {
//       createNewChatroom();
//     }

//     const formData = new FormData();
//     formData.append("text_query", content);

//     if (attachments.length > 0) {
//       formData.append("image_query", attachments[0]);
//     }

//     if (chatroomId) {
//       formData.append("chatroom_id", chatroomId);
//     }

//     try {
//       // Add user message to UI
//       const tempUserMessage: Message = {
//         id: `temp-${Date.now()}`,
//         content,
//         sender: "user",
//         created_at: new Date().toISOString(),
//         attachments: attachments.map((file) => ({
//           type: file.type,
//           url: URL.createObjectURL(file),
//         })),
//       };

//       setMessages((prev) => [...prev, tempUserMessage]);

//       // Create empty assistant message for streaming with "Generating response..." text
//       const streamingMessageId = `assistant-${Date.now()}`;
//       assistantMessageId.current = streamingMessageId;

//       const streamingMessage: Message = {
//         id: streamingMessageId,
//         content: "Generating response...",
//         sender: "assistant",
//         created_at: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, streamingMessage]);

//       // Fetch streaming response
//       const response = await fetch(`${backendURL}/api/generate_response`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) throw new Error("Failed to send message");

//       // Handle streaming response
//       const reader = response.body?.getReader();
//       if (!reader) throw new Error("Response body is not readable");

//       let receivedText = "";
//       const decoder = new TextDecoder();

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         receivedText += chunk;

//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg.id === streamingMessageId
//               ? { ...msg, content: receivedText }
//               : msg
//           )
//         );
//       }

//       fetchResources();

//       // Check if the current chatroom exists in the context
//       const isNewChatroom = !chatrooms.some(
//         (room) => room.room_id === chatroomId
//       );

//       if (isNewChatroom) {
//         // Only fetch chatrooms if the chatroom is not in the current list
//         fetchChatrooms();
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       // If error, show error message instead of removing the assistant message
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg.id === assistantMessageId.current
//             ? {
//                 ...msg,
//                 content: "Error generating response. Please try again.",
//               }
//             : msg
//         )
//       );
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <div className="flex-1 w-full overflow-y-auto flex flex-col h-full bg-white relative">
//       <ChatHeader
//         chatroomId={chatroomId}
//         isSidebarOpen={isSidebarOpen}
//         onToggleSidebar={onToggleSidebar}
//       />

//       <div className="md:max-w-[48rem] md:min-w-[48rem] mx-auto w-full flex-1 flex flex-col relative overflow-hidden">
//         {messages.length === 0 ? (
//           <div className="flex-1 flex items-center justify-center text-center">
//             <div className="text-gray-500">
//               <h2 className="text-2xl font-semibold mb-4">
//                 What can I help with?
//               </h2>
//               <p className="text-gray-400">
//                 Send a message to begin conversation
//               </p>
//             </div>
//           </div>
//         ) : (
//           <MessageList
//             messages={messages}
//             isLoading={isLoading}
//             resources={resources}
//             // @ts-expect-error - React refs are initially null but will be assigned at runtime
//             messagesEndRef={messagesEndRef}
//           />
//         )}

//         <ChatInput
//           onSendMessage={handleSendMessage}
//           isSending={isSending}
//           hasMessages={messages.length > 0}
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { backendURL } from "@/app/utils/config";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { ChatAreaProps, Message } from "@/app/interfaces";
import { useChatrooms } from "@/app/providers/ChatroomContext";

// Define the Resource interface
interface Resource {
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  chunk_count: number;
  status: string;
  file_link: string;
  uploaded_at: string;
}

// Define the conversation item from API
interface ConversationItem {
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
}

export default function ChatArea({
  createNewChatroom,
  chatroomId,
  isSidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const { fetchChatrooms, chatrooms } = useChatrooms();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantMessageId = useRef<string>("");

  const fetchMessages = async () => {
    if (!chatroomId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${backendURL}/api/chatrooms/${chatroomId}/conversations?page=1&page_size=15`
      );

      if (response.status === 404) {
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();

      if (data.conversations && Array.isArray(data.conversations)) {
        const formattedMessages = data.conversations.map(
          (conv: ConversationItem) => ({
            id: conv.conversation_id,
            content: conv.content,
            sender: conv.role === "user" ? "user" : "assistant",
            created_at: conv.created_at,
          })
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
      const response = await fetch(
        `${backendURL}/api/search_resources?chatroom_id=${chatroomId}`
      );
      if (!response.ok) throw new Error("Failed to fetch resources");

      const data = await response.json();

      if (Array.isArray(data)) {
        setResources(data);
      } else if (data && data.resources && Array.isArray(data.resources)) {
        setResources(data.resources);
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResources([]);
    }
  };

  const handleSendMessage = async (
    content: string,
    attachments: File[] = []
  ) => {
    if (!content.trim() && attachments.length === 0) return;

    setIsSending(true);

    if (!chatroomId) {
      createNewChatroom();
    }

    const formData = new FormData();
    formData.append("text_query", content);

    if (attachments.length > 0) {
      formData.append("image_query", attachments[0]);
    }

    if (chatroomId) {
      formData.append("chatroom_id", chatroomId);
    }

    try {
      // Add user message to UI
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

      // Create empty assistant message for streaming with "Generating response..." text
      const streamingMessageId = `assistant-${Date.now()}`;
      assistantMessageId.current = streamingMessageId;

      const streamingMessage: Message = {
        id: streamingMessageId,
        content: "Generating response...",
        sender: "assistant",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, streamingMessage]);

      // Fetch streaming response
      const response = await fetch(`${backendURL}/api/generate_response`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Handle streaming response
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

      // Check if the current chatroom exists in the context
      const isNewChatroom = !chatrooms.some(
        (room) => room.room_id === chatroomId
      );

      if (isNewChatroom) {
        // Only fetch chatrooms if the chatroom is not in the current list
        fetchChatrooms();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // If error, show error message instead of removing the assistant message
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
            // @ts-expect-error - React refs are initially null but will be assigned at runtime
            messagesEndRef={messagesEndRef}
          />
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
}
