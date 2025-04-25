"use client";

import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance;

export const initMessageApi = (instance: MessageInstance) => {
  messageApi = instance;
};

export const handleSuccess = (content: string, duration: number = 3) => {
  if (messageApi) {
    return messageApi.success({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  } else {
    return message.success({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  }
};

export const handleError = (content: string, duration: number = 5) => {
  if (messageApi) {
    return messageApi.error({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  } else {
    return message.error({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  }
};

export const handleWarning = (content: string, duration: number = 4) => {
  if (messageApi) {
    return messageApi.warning({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  } else {
    return message.warning({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  }
};

export const handleInfo = (content: string, duration: number = 3) => {
  if (messageApi) {
    return messageApi.info({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  } else {
    return message.info({
      content,
      duration,
      style: {
        marginTop: "20px",
      },
    });
  }
};
