"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Spin, Pagination } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import { backendURL, getToken } from "@/app/utils/config";

// Define more specific type for references
type Reference = {
  id: string;
  title: string;
  url?: string;
  [key: string]: unknown;
};

// Types
type Conversation = {
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  content_type: string;
  created_at: string;
  references?: Reference[];
};

type Chatroom = {
  room_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  total_conversation_count: number;
  conversations?: Conversation[];
};

type ConversationsResponse = {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  conversations: Conversation[];
};

type ChatModalProps = {
  isVisible: boolean;
  onClose: () => void;
  chatroom: Chatroom | null;
  specificConversations?: Conversation[];
  title?: string;
};

const ChatModal: React.FC<ChatModalProps> = ({
  isVisible,
  onClose,
  chatroom,
  specificConversations,
  title,
}) => {
  const token = getToken();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchConversations = useCallback(
    async (roomId: string, page: number, pageSize: number) => {
      if (!roomId) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("page_size", pageSize.toString());

        const response = await fetch(
          `${backendURL}/api/chatrooms/${roomId}/conversations?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data: ConversationsResponse = await response.json();
        setConversations(data.conversations);
        setTotalCount(data.total_count);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    // Reset to first page when modal is opened
    if (isVisible) {
      setCurrentPage(1);
    }

    // If specific conversations are provided, use them directly
    if (isVisible && specificConversations) {
      setConversations(specificConversations);
      setTotalCount(specificConversations.length);
      setLoading(false);
    }
    // Otherwise, fetch conversations if a chatroom is provided
    else if (isVisible && chatroom) {
      // If chatroom already has conversations property, use those
      if (chatroom.conversations && chatroom.conversations.length > 0) {
        setConversations(chatroom.conversations);
        setTotalCount(chatroom.total_conversation_count);
        setLoading(false);
      } else {
        // Otherwise fetch conversations from API
        fetchConversations(chatroom.room_id, currentPage, pageSize);
      }
    }
  }, [
    isVisible,
    chatroom,
    specificConversations,
    currentPage,
    pageSize,
    fetchConversations,
  ]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const exportToPdf = () => {
    if ((!chatroom && !specificConversations) || conversations.length === 0)
      return;

    const doc = new jsPDF();
    let yPos = 10;

    // Add header info
    doc.setFontSize(16);
    if (chatroom) {
      doc.text(`Chatroom: ${chatroom.name}`, 10, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(
        `Created: ${new Date(chatroom.created_at).toLocaleString()}`,
        10,
        yPos
      );
      yPos += 10;

      doc.text(
        `Total messages: ${chatroom.total_conversation_count}`,
        10,
        yPos
      );
      yPos += 15;
    } else if (title) {
      doc.text(title, 10, yPos);
      yPos += 15;
    }

    // Add conversations
    doc.setFontSize(12);

    // Handle conversations
    conversations.forEach((convo) => {
      const role = convo.role.charAt(0).toUpperCase() + convo.role.slice(1);
      const timestamp = new Date(convo.created_at).toLocaleString();

      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 10;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${role} (${timestamp}):`, 10, yPos);
      yPos += 7;

      doc.setFont("helvetica", "normal");

      // Handle content (splitting long text across multiple lines)
      const contentLines = doc.splitTextToSize(convo.content, 180);
      contentLines.forEach((line: string) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 10;
        }

        doc.text(line, 15, yPos);
        yPos += 7;
      });

      yPos += 5; // Add space between conversations
    });

    // If we're showing a paginated view and there are more conversations than shown, add a note
    if (chatroom && totalCount > conversations.length) {
      yPos += 10;
      doc.setFont("helvetica", "italic");
      doc.text(
        `Note: This PDF contains only ${conversations.length} of ${totalCount} total messages.`,
        10,
        yPos
      );
    }

    // Determine filename
    let filename = "chat-";
    if (chatroom) {
      filename += `${chatroom.name}-`;
    } else if (title) {
      filename += `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-`;
    }
    filename += `${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(filename);
  };

  const modalTitle =
    title || (chatroom ? `Conversations - ${chatroom.name}` : "Conversations");

  return (
    <Modal
      title={modalTitle}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportToPdf}
          disabled={conversations.length === 0}
        >
          Export as PDF
        </Button>,
      ]}
      width={800}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
    >
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No conversations to display.
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4 mb-6">
              {conversations.map((convo) => (
                <div
                  key={convo.conversation_id}
                  className={`p-3 rounded-lg ${
                    convo.role === "user"
                      ? "bg-blue-50 ml-auto"
                      : "bg-gray-50 mr-auto"
                  } max-w-[80%]`}
                >
                  <div
                    className={`flex justify-between mb-1 ${
                      convo.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span className="text-xs text-gray-500">
                      {new Date(convo.created_at).toLocaleString()}
                    </span>
                    <span className="font-semibold">
                      {convo.role === "user" ? "You" : "Assistant"}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">
                    {convo.role === "assistant" ? (
                      <ReactMarkdown>{convo.content}</ReactMarkdown>
                    ) : (
                      <p>{convo.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for conversations from a chatroom (not for specific conversations) */}
            {!specificConversations && chatroom && totalCount > pageSize && (
              <div className="flex justify-center mt-4">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={["5", "10", "20", "50"]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default ChatModal;
