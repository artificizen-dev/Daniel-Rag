"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Message, MessageListProps, Resource } from "@/app/interfaces";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Avatar from "boring-avatars";
import { FaRobot } from "react-icons/fa";
import {
  HiOutlineDocument,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import { BsDownload } from "react-icons/bs";

// Update MessageListProps to include resources
interface ExtendedMessageListProps extends MessageListProps {
  resources?: Resource[];
  isLoadingResources?: boolean;
}

export default function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  resources = [],
  isLoadingResources,
}: ExtendedMessageListProps) {
  // State to track expanded resource accordions
  const [expandedResources, setExpandedResources] = useState<
    Record<string, boolean>
  >({});

  // Toggle accordion for a specific message
  const toggleResourceAccordion = (messageId: string) => {
    setExpandedResources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if a message has image attachments
  const hasImageAttachments = (message: Message) => {
    return message.attachments?.some((attachment) =>
      attachment.type.startsWith("image/")
    );
  };

  // Get image attachments from a message
  const getImageAttachments = (message: Message) => {
    return message.attachments?.filter((attachment) =>
      attachment.type.startsWith("image/")
    );
  };

  // Helper function to get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <HiOutlineDocument className="text-red-500" size={18} />;
    }
    return <HiOutlineDocument className="text-blue-500" size={18} />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
      {messages.length === 0 && !isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Start a new conversation
            </h3>
            <p className="text-gray-500">
              Send a message to begin chatting. Your conversations will be saved
              here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-pulse flex space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender !== "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                      <FaRobot className="text-blue-600" size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-4 ${
                      message.sender === "user"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-white text-gray-800"
                    } ${
                      message.id.startsWith("loading-") ? "animate-pulse" : ""
                    }`}
                  >
                    {message.id.startsWith("loading-") ? (
                      <div className="flex space-x-2 justify-center items-center h-6">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    ) : (
                      <>
                        {hasImageAttachments(message) && (
                          <div className="mb-3 space-y-2">
                            {getImageAttachments(message)?.map(
                              (attachment, idx) => (
                                <div
                                  key={idx}
                                  className="relative overflow-hidden rounded-md"
                                >
                                  <Image
                                    src={attachment.url}
                                    alt="Attached image"
                                    width={300}
                                    height={200}
                                    className="max-w-full object-cover rounded-md"
                                    style={{ maxHeight: "200px" }}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <div className="markdown-message prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc pl-5 my-2"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-decimal pl-5 my-2"
                                  {...props}
                                />
                              ),
                              li: ({ ...props }) => (
                                <li className="my-1" {...props} />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Show references for each assistant message */}
                        {message.sender === "assistant" && (
                          <>
                            {/* Case 1: Message has references in its data structure */}
                            {message.references &&
                              message.references.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <button
                                    onClick={() =>
                                      toggleResourceAccordion(message.id)
                                    }
                                    className="flex items-center justify-between w-full text-xs font-medium text-gray-500 mb-2 hover:text-gray-700"
                                  >
                                    <span>
                                      Referenced resources (
                                      {message.references.length})
                                    </span>
                                    {expandedResources[message.id] ? (
                                      <HiChevronDown className="h-4 w-4" />
                                    ) : (
                                      <HiChevronRight className="h-4 w-4" />
                                    )}
                                  </button>

                                  {expandedResources[message.id] && (
                                    <div className="space-y-2 mt-2">
                                      {message.references.map((chunk) => (
                                        <>
                                          <a
                                            key={chunk.chunk_id}
                                            href={`${chunk.gcp_bucket_url}#page=${chunk.page_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
                                          >
                                            <div className="mr-3 p-2 rounded-md bg-white border border-gray-200 text-gray-500">
                                              {getFileIcon(
                                                chunk.file_name
                                                  .split(".")
                                                  .pop() || ""
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {chunk.file_name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                Page {chunk.page_number}
                                              </p>
                                            </div>
                                            <div className="text-gray-400 group-hover:text-blue-500">
                                              <BsDownload size={16} />
                                            </div>
                                          </a>
                                          <div className="mt-2 w-full">
                                            <h3 className="text-md font-semibold mb-2">
                                              Reference Text
                                            </h3>
                                            <div className="text-sm bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto prose prose-sm">
                                              <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                  ul: ({ ...props }) => (
                                                    <ul
                                                      className="list-disc pl-5 my-2"
                                                      {...props}
                                                    />
                                                  ),
                                                  ol: ({ ...props }) => (
                                                    <ol
                                                      className="list-decimal pl-5 my-2"
                                                      {...props}
                                                    />
                                                  ),
                                                  li: ({ ...props }) => (
                                                    <li
                                                      className="my-1"
                                                      {...props}
                                                    />
                                                  ),
                                                }}
                                              >
                                                {chunk.text_content}
                                              </ReactMarkdown>
                                            </div>
                                          </div>
                                        </>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Case 2: Last message with resources from chunks API */}
                            {(!message.references ||
                              message.references.length === 0) &&
                              index === messages.length - 1 &&
                              resources &&
                              resources.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <button
                                    onClick={() =>
                                      toggleResourceAccordion(
                                        `external-${message.id}`
                                      )
                                    }
                                    className="flex items-center justify-between w-full text-xs font-medium text-gray-500 mb-2 hover:text-gray-700"
                                  >
                                    <span>
                                      Referenced resources ({resources.length})
                                    </span>
                                    {expandedResources[
                                      `external-${message.id}`
                                    ] ? (
                                      <HiChevronDown className="h-4 w-4" />
                                    ) : (
                                      <HiChevronRight className="h-4 w-4" />
                                    )}
                                  </button>

                                  {expandedResources[
                                    `external-${message.id}`
                                  ] && (
                                    <div className="space-y-2 mt-2">
                                      {resources.map((chunk) => (
                                        <>
                                          <a
                                            key={chunk.chunk_id}
                                            href={`${chunk.gcp_bucket_url}#page=${chunk.page_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
                                          >
                                            <div className="mr-3 p-2 rounded-md bg-white border border-gray-200 text-gray-500">
                                              {getFileIcon(
                                                chunk.file_name
                                                  .split(".")
                                                  .pop() || ""
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {chunk.file_name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                Page {chunk.page_number}
                                              </p>
                                            </div>
                                            <div className="text-gray-400 group-hover:text-blue-500">
                                              <BsDownload size={16} />
                                            </div>
                                          </a>
                                          <div className="mt-2 w-full">
                                            <h3 className="text-md font-semibold mb-2">
                                              Reference Text
                                            </h3>
                                            <div className="text-sm bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto prose prose-sm">
                                              <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                  ul: ({ ...props }) => (
                                                    <ul
                                                      className="list-disc pl-5 my-2"
                                                      {...props}
                                                    />
                                                  ),
                                                  ol: ({ ...props }) => (
                                                    <ol
                                                      className="list-decimal pl-5 my-2"
                                                      {...props}
                                                    />
                                                  ),
                                                  li: ({ ...props }) => (
                                                    <li
                                                      className="my-1"
                                                      {...props}
                                                    />
                                                  ),
                                                }}
                                              >
                                                {chunk.text_content}
                                              </ReactMarkdown>
                                            </div>
                                          </div>
                                        </>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Loading state */}
                            {(!message.references ||
                              message.references.length === 0) &&
                              index === messages.length - 1 &&
                              isLoadingResources && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-medium text-gray-500 mb-2">
                                    Referenced resources:
                                  </p>
                                  <div className="flex justify-center py-4">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                                      <span className="text-sm text-gray-500">
                                        Loading resources...
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </>
                        )}

                        <div className="text-xs mt-2 text-gray-500 text-right">
                          {formatTime(message.created_at)}
                        </div>
                      </>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                      <Avatar
                        size={32}
                        name={message.id}
                        variant="beam"
                        colors={[
                          "#92A1C6",
                          "#146A7C",
                          "#F0AB3D",
                          "#C271B4",
                          "#C20D90",
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
