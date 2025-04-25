// components/providers/MessageProvider.tsx
"use client";

import React, { ReactNode } from "react";
import { message } from "antd";
import { initMessageApi } from "../utils/messageUtils";

interface MessageProviderProps {
  children: ReactNode;
}

const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  // Initialize and configure the message instance
  const [messageApi, contextHolder] = message.useMessage({
    maxCount: 3, // Limit the number of messages displayed simultaneously
  });

  // Initialize our global message utility with this instance
  React.useEffect(() => {
    initMessageApi(messageApi);
  }, [messageApi]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export default MessageProvider;
