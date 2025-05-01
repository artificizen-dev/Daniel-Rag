"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Input, DatePicker, Space, Spin, Tooltip } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { jsPDF } from "jspdf";
import type { TableRowSelection } from "antd/es/table/interface";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { backendURL, getToken } from "@/app/utils/config";
import ChatModal from "@/app/components/Previous-Chats/ChatModal";

// Define more specific type for references
type Reference = {
  id: string;
  title: string;
  url?: string;
  [key: string]: unknown;
};

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
  key?: string;
};

type ChatHistoryResponse = {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  chatrooms: Chatroom[];
};

type FilterState = {
  searchName: string;
  searchText: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  currentPage: number;
};

// Define a more specific type for responsive array
type ResponsiveArray = ("xs" | "sm" | "md" | "lg" | "xl")[];

const { RangePicker } = DatePicker;

// Debounce hook to delay API calls
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ChatHistoryDashboard: React.FC = () => {
  const token = getToken();
  const [chatData, setChatData] = useState<ChatHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Group filter states together
  const [filters, setFilters] = useState<FilterState>({
    searchName: "",
    searchText: "",
    dateRange: null,
    currentPage: 1,
  });

  // Flag to determine if we should trigger the API call
  const shouldFetchRef = useRef<boolean>(false);

  // Debounced filter values for auto-search
  const debouncedFilters = useDebounce(filters, 2000);

  const [pageSize, setPageSize] = useState<number>(15);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentChatroom, setCurrentChatroom] = useState<Chatroom | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [specificConversations, setSpecificConversations] = useState<
    Conversation[] | null
  >(null);
  const [isSpecificModalVisible, setIsSpecificModalVisible] =
    useState<boolean>(false);
  const [searchResultTitle, setSearchResultTitle] = useState<string>("");

  // Function to fetch data
  const fetchChatHistories = useCallback(
    async (filtersToUse: FilterState) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (filtersToUse.searchName)
          params.append("name", filtersToUse.searchName);
        if (filtersToUse.searchText)
          params.append("conversation_text", filtersToUse.searchText);
        if (filtersToUse.dateRange && filtersToUse.dateRange[0])
          params.append(
            "start_date",
            filtersToUse.dateRange[0].format("YYYY-MM-DD")
          );
        if (filtersToUse.dateRange && filtersToUse.dateRange[1])
          params.append(
            "end_date",
            filtersToUse.dateRange[1].format("YYYY-MM-DD")
          );
        params.append("page", filtersToUse.currentPage.toString());
        params.append("page_size", pageSize.toString());

        // Make API call with authorization header
        const response = await fetch(
          `${backendURL}/api/chat_histories?${params.toString()}`,
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

        const data: ChatHistoryResponse = await response.json();

        const chatroomsWithKeys = data.chatrooms.map((room) => ({
          ...room,
          key: room.room_id,
        }));

        setChatData({ ...data, chatrooms: chatroomsWithKeys });
      } catch (error) {
        console.error("Error fetching chat histories:", error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, token]
  );

  // Initial fetch on component mount
  useEffect(() => {
    fetchChatHistories(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when debounced filters change
  useEffect(() => {
    if (shouldFetchRef.current) {
      fetchChatHistories(debouncedFilters);
    } else {
      // Skip the first render effect, but enable for subsequent changes
      shouldFetchRef.current = true;
    }
  }, [debouncedFilters, fetchChatHistories]);

  // Update individual filter values
  const updateFilter = (key: keyof FilterState, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Immediate search without debounce
  const handleSearch = () => {
    fetchChatHistories(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchName: "",
      searchText: "",
      dateRange: null,
      currentPage: 1,
    };

    // Set the filters immediately
    setFilters(resetFilters);

    // Perform an immediate fetch with reset values without waiting for debounce
    fetchChatHistories(resetFilters);
  };

  const rowSelection: TableRowSelection<Chatroom> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  const showConversations = (record: Chatroom) => {
    setCurrentChatroom(record);
    setIsModalVisible(true);
  };

  const showSpecificConversations = (record: Chatroom) => {
    if (record.conversations && record.conversations.length > 0) {
      setSpecificConversations(record.conversations);
      setSearchResultTitle(`Search Results - ${record.name}`);
      setIsSpecificModalVisible(true);
    }
  };

  const exportToPdf = () => {
    if (!selectedRowKeys.length || !chatData) return;

    const selectedChatrooms = chatData.chatrooms.filter((room) =>
      selectedRowKeys.includes(room.key || "")
    );

    const doc = new jsPDF();
    let yPos = 10;

    selectedChatrooms.forEach((chatroom, index) => {
      if (index > 0) {
        doc.addPage();
        yPos = 10;
      }

      doc.setFontSize(16);
      doc.text(`Chatroom: ${chatroom.name}`, 10, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(
        `Created: ${new Date(chatroom.created_at).toLocaleString()}`,
        10,
        yPos
      );
      yPos += 15;

      doc.text(
        `Total messages: ${chatroom.total_conversation_count}`,
        10,
        yPos
      );
      yPos += 15;

      doc.text(
        "To see full conversation details, please export from the chat view.",
        10,
        yPos
      );
    });

    doc.save(`chat-histories-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const responsiveArray: ResponsiveArray = ["xs", "sm", "md", "lg", "xl"];

  const columns: ColumnsType<Chatroom> = [
    {
      title: "Chatroom Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      responsive: responsiveArray,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString(),
      responsive: ["md", "lg", "xl"] as ResponsiveArray,
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date: string) => new Date(date).toLocaleString(),
      responsive: ["lg", "xl"] as ResponsiveArray,
    },
    {
      title: "Messages",
      dataIndex: "total_conversation_count",
      key: "total_conversation_count",
      responsive: ["sm", "md", "lg", "xl"] as ResponsiveArray,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Chatroom) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showConversations(record)}
            size="small"
          >
            View Chat
          </Button>

          {/* Show View Conversation button only when search results include conversations */}
          {record.conversations && record.conversations.length > 0 && (
            <Tooltip title="View matched conversations from search">
              <Button
                type="default"
                icon={<MessageOutlined />}
                onClick={() => showSpecificConversations(record)}
                size="small"
              >
                View Matches
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
      responsive: responsiveArray,
      width: "220px",
    },
  ];

  const handleTableChange = (page: number, size: number) => {
    // For pagination changes, we want to fetch immediately
    const newFilters = {
      ...filters,
      currentPage: page,
    };
    setFilters(newFilters);
    setPageSize(size);
    fetchChatHistories(newFilters);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Chat History Dashboard
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Chatroom Name
            </label>
            <Input
              placeholder="Search by name"
              value={filters.searchName}
              onChange={(e) => updateFilter("searchName", e.target.value)}
              prefix={<SearchOutlined />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Chat Content
            </label>
            <Input
              placeholder="Search in conversations"
              value={filters.searchText}
              onChange={(e) => updateFilter("searchText", e.target.value)}
              prefix={<SearchOutlined />}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <RangePicker
              className="w-full"
              value={filters.dateRange}
              onChange={(values) => updateFilter("dateRange", values)}
              allowClear={true}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Space>
            <Button onClick={handleReset}>Reset</Button>
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
          </Space>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between mb-4">
        <div>
          <span className="mr-2">
            {selectedRowKeys.length > 0
              ? `Selected ${selectedRowKeys.length} items`
              : ""}
          </span>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportToPdf}
          disabled={selectedRowKeys.length === 0}
        >
          Export Selected
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={chatData?.chatrooms || []}
            pagination={{
              current: filters.currentPage,
              pageSize: pageSize,
              total: chatData?.total_count || 0,
              onChange: handleTableChange,
              showSizeChanger: true,
              pageSizeOptions: ["10", "15", "30", "50"],
            }}
            scroll={{ x: "max-content" }}
          />
        )}
      </div>

      {/* Chat Modal Component - For full chat history */}
      <ChatModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        chatroom={currentChatroom}
      />

      {/* Specific Conversations Modal - For search results */}
      <ChatModal
        isVisible={isSpecificModalVisible}
        onClose={() => setIsSpecificModalVisible(false)}
        chatroom={null}
        specificConversations={specificConversations || []}
        title={searchResultTitle}
      />
    </div>
  );
};

export default ChatHistoryDashboard;
