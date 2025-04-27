// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   IoDocumentOutline,
//   IoTrashOutline,
//   IoDownloadOutline,
//   IoPencilOutline,
// } from "react-icons/io5";
// import { format } from "date-fns";
// import {
//   Table,
//   message,
//   Popconfirm,
//   Modal,
//   Form,
//   Button,
//   Empty,
//   Upload,
// } from "antd";
// import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
// import { UploadOutlined } from "@ant-design/icons";
// import { backendURL, getToken } from "@/app/utils/config";
// import { Resource, ResourceResponse } from "@/app/interfaces";
// import { handleApiError } from "@/app/utils/handleApiError";
// import { useAuth } from "@/app/providers/AuthContext";
// import { useRouter } from "next/navigation";

// export default function PreviousResourcesPage() {
//   const token = getToken();
//   const router = useRouter();
//   const { logout, user } = useAuth();
//   const [messageApi, contextHolder] = message.useMessage();
//   const [resources, setResources] = useState<Resource[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 10,
//     total: 0,
//   });
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editingResource, setEditingResource] = useState<Resource | null>(null);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (user?.role !== "admin") {
//       messageApi.open({
//         type: "error",
//         content: "You are not authorized to access this page.",
//         duration: 10,
//       });
//       router.push("/");
//     }
//   }, []);

//   // Fetch resources from API
//   const fetchResources = async (page = 1, pageSize = 10) => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${backendURL}/api/list_resources?page=${page}&page_size=${pageSize}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch resources");
//       }
//       if (response.status === 401) {
//         // Create error object with status
//         const authError = {
//           status: 401,
//           message: "Unauthorized",
//         };
//         console.log("response");
//         handleApiError(authError, logout);

//         setLoading(false);
//         return;
//       }

//       const data: ResourceResponse = await response.json();
//       setResources(data.resources);
//       setPagination({
//         current: data.page,
//         pageSize: data.page_size,
//         total: data.total_count,
//       });
//     } catch (err) {
//       message.error("Unable to load resources. Please try again later.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial fetch
//   useEffect(() => {
//     fetchResources();
//   }, []);

//   const handleDelete = async (resourceId: string) => {
//     try {
//       const formData = new FormData();
//       formData.append("action", "delete");
//       formData.append("file_id", resourceId);

//       const response = await fetch(`${backendURL}/api/update_resources`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete resource");
//       }

//       // Remove the deleted resource from state
//       setResources((prevResources) =>
//         prevResources.filter((resource) => resource.file_id !== resourceId)
//       );
//       messageApi.open({
//         type: "success",
//         content: "resource deleted successfully",
//         duration: 10,
//       });
//     } catch (err) {
//       console.error("Deletion error:", err);
//       messageApi.open({
//         type: "error",
//         content: "File Deletion error",
//         duration: 10,
//       });
//     }
//   };

//   // Handle opening edit modal
//   const showEditModal = (resource: Resource) => {
//     setEditingResource(resource);
//     form.resetFields();
//     setEditModalVisible(true);
//   };

//   const handleEdit = async (values: {
//     upload: { fileList: { originFileObj: File }[] };
//   }) => {
//     if (!editingResource) return;

//     try {
//       setIsUpdating(true);

//       const fileObj = values.upload?.fileList?.[0]?.originFileObj;

//       if (!fileObj) {
//         message.error("Please select a file to upload");
//         setIsUpdating(false);
//         return;
//       }

//       const formData = new FormData();
//       formData.append("action", "update");
//       formData.append("file_id", editingResource.file_id);
//       formData.append("files", fileObj);

//       const response = await fetch(`${backendURL}/api/update_resources`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update resource");
//       }

//       messageApi.open({
//         type: "success",
//         content: "resource updated successfully",
//         duration: 10,
//       });
//       setEditModalVisible(false);

//       fetchResources(pagination.current, pagination.pageSize);
//     } catch (err) {
//       console.error("Update error:", err);
//       messageApi.open({
//         type: "error",
//         content: "Resource Update error",
//         duration: 10,
//       });
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const formatFileSize = (fileSize: string): string => {
//     return fileSize;
//   };

//   // Determine icon based on file type
//   const getFileTypeIcon = (type: string) => {
//     const iconMap: { [key: string]: React.ReactNode } = {
//       "image/jpeg": <IoDocumentOutline className="text-blue-500" />,
//       "image/png": <IoDocumentOutline className="text-green-500" />,
//       "application/pdf": <IoDocumentOutline className="text-red-500" />,
//       "text/plain": <IoDocumentOutline className="text-gray-500" />,
//       default: <IoDocumentOutline className="text-gray-400" />,
//     };

//     return iconMap[type] || iconMap["default"];
//   };

//   // Table columns configuration
//   const columns: ColumnsType<Resource> = [
//     {
//       title: "Name",
//       dataIndex: "file_name",
//       key: "file_name",
//       render: (name, record) => (
//         <div className="flex items-center space-x-3">
//           {getFileTypeIcon(record.file_type)}
//           <span className="font-medium text-gray-800 truncate max-w-[200px]">
//             {name}
//           </span>
//         </div>
//       ),
//     },
//     {
//       title: "Type",
//       dataIndex: "file_type",
//       key: "file_type",
//     },
//     {
//       title: "Size",
//       dataIndex: "file_size",
//       key: "file_size",
//       render: (size) => formatFileSize(size),
//     },
//     {
//       title: "Chunks",
//       dataIndex: "chunk_count",
//       key: "chunk_count",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => (
//         <span
//           className={`${
//             status === "processed" ? "text-green-600" : "text-yellow-600"
//           } font-medium`}
//         >
//           {status === "processed" ? "Processed" : "Failed"}
//         </span>
//       ),
//     },
//     {
//       title: "Uploaded At",
//       dataIndex: "uploaded_at",
//       key: "uploaded_at",
//       render: (date) => format(new Date(date), "MMM dd, yyyy HH:mm"),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <div className="flex justify-center space-x-2">
//           {record.file_link && (
//             <a
//               href={record.file_link}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-500 hover:text-blue-700
//                        focus:outline-none p-2 rounded-full
//                        hover:bg-blue-50 transition-colors"
//               title="Download"
//             >
//               <IoDownloadOutline size={20} />
//             </a>
//           )}

//           <button
//             onClick={() => showEditModal(record)}
//             className="text-blue-500 hover:text-blue-700
//                      focus:outline-none p-2 rounded-full
//                      hover:bg-blue-50 transition-colors"
//             title="Edit"
//           >
//             <IoPencilOutline size={20} />
//           </button>

//           <Popconfirm
//             title="Delete Resource"
//             description="Are you sure you want to delete this resource? This action cannot be undone."
//             onConfirm={() => handleDelete(record.file_id)}
//             okText="Yes, Delete"
//             cancelText="Cancel"
//             okButtonProps={{ danger: true }}
//           >
//             <button
//               className="text-red-500 hover:text-red-700
//                        focus:outline-none p-2 rounded-full
//                        hover:bg-red-50 transition-colors"
//               title="Delete"
//             >
//               <IoTrashOutline size={20} />
//             </button>
//           </Popconfirm>
//         </div>
//       ),
//     },
//   ];

//   // Handle table changes (pagination, filters, etc.)
//   const handleTableChange = (newPagination: TablePaginationConfig) => {
//     if (newPagination.current && newPagination.pageSize) {
//       fetchResources(newPagination.current, newPagination.pageSize);
//     }
//   };

//   return (
//     <>
//       {contextHolder}

//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">
//           Previous Resources
//         </h1>

//         <Table
//           columns={columns}
//           dataSource={resources}
//           rowKey="file_id"
//           pagination={{
//             current: pagination.current,
//             pageSize: pagination.pageSize,
//             total: pagination.total,
//             showSizeChanger: true,
//           }}
//           loading={loading}
//           onChange={handleTableChange}
//           className="bg-white rounded-lg shadow-md"
//           style={{ minHeight: "200px" }}
//           locale={{
//             emptyText: (
//               <Empty
//                 description="No resources found"
//                 style={{ margin: "80px 0" }}
//               />
//             ),
//           }}
//         />

//         {/* Edit Resource Modal */}
//         <Modal
//           title="Edit Resource"
//           open={editModalVisible}
//           onCancel={() => setEditModalVisible(false)}
//           footer={null}
//         >
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleEdit}
//             className="mt-4"
//           >
//             <Form.Item
//               name="upload"
//               label="Replace File"
//               rules={[
//                 { required: true, message: "Please select a file to upload" },
//               ]}
//             >
//               <Upload beforeUpload={() => false} maxCount={1}>
//                 <Button icon={<UploadOutlined />}>Select File</Button>
//               </Upload>
//             </Form.Item>

//             <div className="flex justify-end space-x-2 mt-6">
//               <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
//               <Button type="primary" htmlType="submit" loading={isUpdating}>
//                 {isUpdating ? "Updating..." : "Upload File"}
//               </Button>
//             </div>
//           </Form>
//         </Modal>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IoDocumentOutline,
  IoTrashOutline,
  IoDownloadOutline,
  IoPencilOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { format } from "date-fns";
import {
  Table,
  message,
  Popconfirm,
  Modal,
  Form,
  Button,
  Empty,
  Upload,
  Input,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import { backendURL, getToken } from "@/app/utils/config";
import { Resource, ResourceResponse, User } from "@/app/interfaces";
import { handleApiError } from "@/app/utils/handleApiError";
import { useAuth } from "@/app/providers/AuthContext";
import { useRouter } from "next/navigation";

export default function PreviousResourcesPage() {
  const token = getToken();
  const router = useRouter();
  const { logout } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    let userObject: User | null = null;

    if (typeof user === "string") {
      try {
        userObject = JSON.parse(user);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    } else if (user && typeof user === "object") {
      userObject = user as User;
    }

    if (!userObject || userObject.role !== "admin") {
      messageApi.open({
        type: "error",
        content: "You are not authorized to access this page.",
        duration: 10,
      });
      router.push("/");
    }
  }, []);

  // Fetch resources from API
  const fetchResources = async (page = 1, pageSize = 10, query = "") => {
    try {
      setLoading(true);
      let apiUrl = `${backendURL}/api/list_resources?page=${page}&page_size=${pageSize}`;

      // Use search API if query exists
      if (query.trim()) {
        setIsSearching(true);
        apiUrl = `${backendURL}/api/search_resources?search_query=${encodeURIComponent(
          query
        )}&page=${page}&page_size=${pageSize}`;
      } else {
        setIsSearching(false);
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      if (response.status === 401) {
        // Create error object with status
        const authError = {
          status: 401,
          message: "Unauthorized",
        };
        console.log("response");
        handleApiError(authError, logout);

        setLoading(false);
        return;
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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to first page on new search
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchResources(1, pagination.pageSize, query);
    }, 500);
  };

  // Initial fetch
  useEffect(() => {
    fetchResources();

    // Cleanup function to clear any pending timeouts when component unmounts
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = async (resourceId: string) => {
    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("file_id", resourceId);

      const response = await fetch(`${backendURL}/api/update_resources`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      // Remove the deleted resource from state
      setResources((prevResources) =>
        prevResources.filter((resource) => resource.file_id !== resourceId)
      );
      messageApi.open({
        type: "success",
        content: "resource deleted successfully",
        duration: 10,
      });
    } catch (err) {
      console.error("Deletion error:", err);
      messageApi.open({
        type: "error",
        content: "File Deletion error",
        duration: 10,
      });
    }
  };

  // Handle opening edit modal
  const showEditModal = (resource: Resource) => {
    setEditingResource(resource);
    form.resetFields();
    setEditModalVisible(true);
  };

  const handleEdit = async (values: {
    upload: { fileList: { originFileObj: File }[] };
  }) => {
    if (!editingResource) return;

    try {
      setIsUpdating(true);

      const fileObj = values.upload?.fileList?.[0]?.originFileObj;

      if (!fileObj) {
        message.error("Please select a file to upload");
        setIsUpdating(false);
        return;
      }

      const formData = new FormData();
      formData.append("action", "update");
      formData.append("file_id", editingResource.file_id);
      formData.append("files", fileObj);

      const response = await fetch(`${backendURL}/api/update_resources`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update resource");
      }

      messageApi.open({
        type: "success",
        content: "resource updated successfully",
        duration: 10,
      });
      setEditModalVisible(false);

      fetchResources(pagination.current, pagination.pageSize, searchQuery);
    } catch (err) {
      console.error("Update error:", err);
      messageApi.open({
        type: "error",
        content: "Resource Update error",
        duration: 10,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatFileSize = (fileSize: string): string => {
    return fileSize;
  };

  // Determine icon based on file type
  const getFileTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "image/jpeg": <IoDocumentOutline className="text-blue-500" />,
      "image/png": <IoDocumentOutline className="text-green-500" />,
      "application/pdf": <IoDocumentOutline className="text-red-500" />,
      "text/plain": <IoDocumentOutline className="text-gray-500" />,
      default: <IoDocumentOutline className="text-gray-400" />,
    };

    return iconMap[type] || iconMap["default"];
  };

  // Table columns configuration
  const columns: ColumnsType<Resource> = [
    {
      title: "Name",
      dataIndex: "file_name",
      key: "file_name",
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          {getFileTypeIcon(record.file_type)}
          <span className="font-medium text-gray-800 truncate max-w-[200px]">
            {name}
          </span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "file_type",
      key: "file_type",
    },
    {
      title: "Size",
      dataIndex: "file_size",
      key: "file_size",
      render: (size) => formatFileSize(size),
    },
    {
      title: "Chunks",
      dataIndex: "chunk_count",
      key: "chunk_count",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`${
            status === "processed" ? "text-green-600" : "text-yellow-600"
          } font-medium`}
        >
          {status === "processed" ? "Processed" : "Failed"}
        </span>
      ),
    },
    {
      title: "Uploaded At",
      dataIndex: "uploaded_at",
      key: "uploaded_at",
      render: (date) => format(new Date(date), "MMM dd, yyyy HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          {record.file_link && (
            <a
              href={record.file_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 
                       focus:outline-none p-2 rounded-full 
                       hover:bg-blue-50 transition-colors"
              title="Download"
            >
              <IoDownloadOutline size={20} />
            </a>
          )}

          <button
            onClick={() => showEditModal(record)}
            className="text-blue-500 hover:text-blue-700 
                     focus:outline-none p-2 rounded-full 
                     hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <IoPencilOutline size={20} />
          </button>

          <Popconfirm
            title="Delete Resource"
            description="Are you sure you want to delete this resource? This action cannot be undone."
            onConfirm={() => handleDelete(record.file_id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <button
              className="text-red-500 hover:text-red-700 
                       focus:outline-none p-2 rounded-full 
                       hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <IoTrashOutline size={20} />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Handle table changes (pagination, filters, etc.)
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    if (newPagination.current && newPagination.pageSize) {
      fetchResources(
        newPagination.current,
        newPagination.pageSize,
        searchQuery
      );
    }
  };

  return (
    <>
      {contextHolder}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Previous Resources
          </h1>

          {/* Search Input */}
          <div className="w-full md:w-auto relative">
            <Input
              placeholder="Search resources..."
              prefix={<IoSearchOutline className="text-gray-400" />}
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 w-full md:w-80 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              allowClear
            />
            {isSearching && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={resources}
          rowKey="file_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          loading={loading}
          onChange={handleTableChange}
          className="bg-white rounded-lg shadow-md"
          style={{ minHeight: "200px" }}
          locale={{
            emptyText: (
              <Empty
                description={
                  searchQuery
                    ? "No matching resources found"
                    : "No resources found"
                }
                style={{ margin: "80px 0" }}
              />
            ),
          }}
        />

        {/* Edit Resource Modal */}
        <Modal
          title="Edit Resource"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEdit}
            className="mt-4"
          >
            <Form.Item
              name="upload"
              label="Replace File"
              rules={[
                { required: true, message: "Please select a file to upload" },
              ]}
            >
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>

            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                {isUpdating ? "Updating..." : "Upload File"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  );
}
