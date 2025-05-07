"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { backendURL, getToken } from "@/app/utils/config";
import { useAuth } from "@/app/providers/AuthContext";
import { handleApiError } from "@/app/utils/handleApiError";
import type { Resource } from "@/app/interfaces";
import { message } from "antd";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface ResourceResponse {
  resources: Resource[];
  page: number;
  page_size: number;
  total_count: number;
}

interface ChatResourcesProps {
  selectedResources: string[];
  onSelectionChange: (names: string[]) => void;
}

const ChatResources: React.FC<ChatResourcesProps> = ({
  selectedResources,
  onSelectionChange,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total: number;
  }>({ current: 1, pageSize: 10, total: 0 });

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = getToken();
  const { logout } = useAuth();

  const fetchResources = async (
    page = 1,
    pageSize = 10,
    query = ""
  ): Promise<void> => {
    try {
      setLoading(true);
      // Choose list or search endpoint based on query
      const apiUrl = query.trim()
        ? `${backendURL}/api/search_resources?search_query=${encodeURIComponent(
            query
          )}&page=${page}&page_size=${pageSize}`
        : `${backendURL}/api/list_resources?page=${page}&page_size=${pageSize}`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleApiError({ status: 401, message: "Unauthorized" }, logout);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data: ResourceResponse = await response.json();
      setResources(data.resources);
      setPagination({
        current: data.page,
        pageSize: data.page_size,
        total: data.total_count,
      });
    } catch (err) {
      message.error("Unable to load resources. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(pagination.current, pagination.pageSize, searchQuery);
  }, [pagination.current, pagination.pageSize, searchQuery]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    // Debounce the actual search query update
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);
  };

  const handlePageChange = (newPage: number): void => {
    setPagination((prev) => ({ ...prev, current: newPage }));
  };

  const handleSelectChange = (fileName: string): void => {
    const updated = selectedResources.includes(fileName)
      ? selectedResources.filter((name) => name !== fileName)
      : [...selectedResources, fileName];
    onSelectionChange(updated);
  };

  const clearSelection = (): void => {
    onSelectionChange([]);
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="flex flex-col h-full p-6 bg-white rounded-lg shadow-lg">
      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search resources..."
          value={inputValue}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-pulse text-blue-500">
            Loading...
          </div>
        )}
      </div>

      {/* Resources List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {resources.length === 0 && !loading ? (
          <p className="text-gray-400 text-center py-10">No resources found.</p>
        ) : (
          resources.map((res) => {
            const isSelected = selectedResources.includes(res.file_name);
            return (
              <div
                key={res.file_name}
                onClick={() => handleSelectChange(res.file_name)}
                title={res.file_name}
                className={`flex items-center p-3 transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                } rounded-md`}
              >
                <span className="text-gray-900 truncate">{res.file_name}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 overflow-x-auto">
          <nav className="inline-flex items-center space-x-2">
            <button
              onClick={() =>
                handlePageChange(Math.max(1, pagination.current - 1))
              }
              disabled={pagination.current === 1}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md transition ${
                    pageNum === pagination.current
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, pagination.current + 1))
              }
              disabled={pagination.current === totalPages}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      )}

      {/* Clear Resources Button */}
      <div className="mt-4">
        <button
          onClick={clearSelection}
          disabled={selectedResources.length === 0}
          className={`w-full py-2 rounded-md text-center transition ${
            selectedResources.length > 0
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Clear Resources
        </button>
      </div>
    </div>
  );
};

export default ChatResources;
