// app/dashboard/upload/page.tsx
"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import {
  IoCloudUploadOutline,
  IoDocumentOutline,
  IoTrashOutline,
} from "react-icons/io5";
import Image from "next/image";
import { message } from "antd";
import { backendURL, getToken } from "@/app/utils/config";
import { handleApiError } from "@/app/utils/handleApiError";
import { useAuth } from "@/app/providers/AuthContext";

// Define file type interface
interface UploadedFile {
  file: File;
  preview?: string;
}

export default function UploadResourcesPage() {
  const token = getToken();
  const { logout } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles: UploadedFile[] = Array.from(selectedFiles).map(
        (file) => ({
          file,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
        })
      );

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Remove a specific file
  const removeFile = (fileToRemove: File) => {
    setFiles((prevFiles) =>
      prevFiles.filter(({ file }) => file !== fileToRemove)
    );
  };

  // Handle file upload
  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();

    if (files.length === 0) {
      message.error("Please select at least one file to upload.");
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add action
      formData.append("action", "upload");

      // Add files
      files.forEach(({ file }) => {
        formData.append("files", file);
      });

      const response = await fetch(`${backendURL}/api/update_resources`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      if (response.status === 401) {
        // Create error object with status
        const authError = {
          status: 401,
          message: "Unauthorized",
        };

        handleApiError(authError, logout);

        setUploading(false);
        return;
      }

      messageApi.open({
        type: "success",
        content: "File Uploaded Successfully",
        duration: 10,
      });
      // Reset files after successful upload
      setFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      messageApi.open({
        type: "error",
        content: "Failed to upload files. Please try again.",
        duration: 10,
      });
    } finally {
      setUploading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {contextHolder}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Upload Resources
        </h1>

        <form
          onSubmit={handleUpload}
          className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto"
        >
          {/* File Drop Zone */}
          <div
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center 
                     hover:border-blue-500 hover:bg-blue-50 transition-colors 
                     cursor-pointer mb-6"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <IoCloudUploadOutline
              className="mx-auto text-gray-400 mb-4"
              size={48}
            />
            <p className="text-gray-600">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOC, TXT, JPG, PNG, GIF
            </p>
          </div>

          {/* File Preview List */}
          {files.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Files to Upload ({files.length})
              </h2>
              <div className="space-y-3">
                {files.map(({ file, preview }) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between 
                             bg-gray-100 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-4">
                      {preview ? (
                        <Image
                          src={preview}
                          alt={file.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <IoDocumentOutline
                          className="text-gray-500"
                          size={48}
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-700 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="text-red-500 hover:text-red-700 
                               focus:outline-none p-2 rounded-full 
                               hover:bg-red-50 transition-colors"
                    >
                      <IoTrashOutline size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            type="submit"
            disabled={files.length === 0 || uploading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg 
                     hover:bg-blue-700 transition-colors 
                     disabled:bg-gray-400 disabled:cursor-not-allowed 
                     flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <IoCloudUploadOutline size={24} />
                <span>
                  Upload {files.length} File{files.length !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
