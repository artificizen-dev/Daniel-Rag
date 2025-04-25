// "use client";

// import { ChatInputProps } from "@/app/interfaces";
// import Image from "next/image";
// import { useState, useRef, useEffect } from "react";
// import { IoArrowUp, IoAdd, IoClose } from "react-icons/io5";

// export default function ChatInput({
//   onSendMessage,
//   isSending,
//   hasMessages = false,
// }: ChatInputProps) {
//   const [message, setMessage] = useState("");
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [attachmentPreviews, setAttachmentPreviews] = useState<
//     { file: File; preview: string }[]
//   >([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "24px";
//       textareaRef.current.style.height = `${Math.min(
//         textareaRef.current.scrollHeight,
//         120
//       )}px`;
//     }
//   }, [message]);

//   useEffect(() => {
//     const newPreviews = attachments.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     setAttachmentPreviews(newPreviews);

//     return () => {
//       newPreviews.forEach((item) => URL.revokeObjectURL(item.preview));
//     };
//   }, [attachments]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleSendMessage = () => {
//     if ((message.trim() || attachments.length > 0) && !isSending) {
//       onSendMessage(message, attachments);
//       setMessage("");
//       setAttachments([]);
//       setAttachmentPreviews([]);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newFiles = Array.from(e.target.files);
//       setAttachments((prev) => [...prev, ...newFiles]);
//     }

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleRemoveAttachment = (index: number) => {
//     setAttachments((prev) => prev.filter((_, i) => i !== index));
//   };

//   const isInputEmpty = !message.trim() && attachments.length === 0;

//   return (
//     <div
//       className={`bg-white p-4 w-full ${
//         hasMessages ? "absolute bottom-0" : "relative mt-4"
//       } md:min-w-[48rem]`}
//     >
//       {attachmentPreviews.length > 0 && (
//         <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
//           {attachmentPreviews.map((item, index) => (
//             <div key={index} className="relative">
//               {item.file.type.startsWith("image/") ? (
//                 <div className="relative h-20 w-20 overflow-hidden rounded-md border border-gray-200">
//                   <Image
//                     src={item.preview}
//                     width={50}
//                     height={50}
//                     alt="attachment"
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//               ) : (
//                 <div className="flex h-20 w-20 items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-500">
//                   {item.file.name.split(".").pop()?.toUpperCase()}
//                 </div>
//               )}
//               <button
//                 onClick={() => handleRemoveAttachment(index)}
//                 className="absolute -right-0 -top-0 rounded-full bg-gray-800 p-1 text-white shadow-md hover:bg-gray-900"
//                 aria-label="Remove attachment"
//               >
//                 <IoClose size={14} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="flex items-center">
//         <div className="flex w-full items-center rounded-full bg-gray-100 px-4 py-2">
//           <textarea
//             ref={textareaRef}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Type a message..."
//             className="mr-2 flex-1 resize-none bg-transparent pt-1 text-gray-800 focus:outline-none"
//             style={{ minHeight: "24px", maxHeight: "120px" }}
//             rows={1}
//           />

//           <div className="flex items-center space-x-2 flex-shrink-0">
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
//               aria-label="Add attachment"
//               disabled={isSending}
//             >
//               <IoAdd size={20} />
//             </button>

//             <button
//               onClick={handleSendMessage}
//               disabled={isInputEmpty || isSending}
//               className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
//                 isInputEmpty || isSending
//                   ? "cursor-not-allowed bg-gray-300 text-gray-500"
//                   : "bg-blue-500 text-white hover:bg-blue-600"
//               }`}
//               aria-label="Send message"
//             >
//               <IoArrowUp size={18} />
//             </button>
//           </div>

//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//             className="hidden"
//             accept="image/*"
//             multiple
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { ChatInputProps } from "@/app/interfaces";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IoArrowUp, IoAdd, IoClose } from "react-icons/io5";

export default function ChatInput({
  onSendMessage,
  isSending,
  hasMessages = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<
    { file: File; preview: string }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  useEffect(() => {
    const newPreviews = attachments.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setAttachmentPreviews(newPreviews);

    return () => {
      newPreviews.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [attachments]);

  // Set up drag and drop event handlers
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        e.currentTarget === dropArea &&
        !dropArea.contains(e.relatedTarget as Node)
      ) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);

        // Filter for images only
        const imageFiles = droppedFiles.filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length > 0) {
          setAttachments((prev) => [...prev, ...imageFiles]);
        }
      }
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragenter", handleDragEnter);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragenter", handleDragEnter);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((message.trim() || attachments.length > 0) && !isSending) {
      onSendMessage(message, attachments);
      setMessage("");
      setAttachments([]);
      setAttachmentPreviews([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const isInputEmpty = !message.trim() && attachments.length === 0;

  return (
    <div
      className={`bg-white p-4 w-full ${
        hasMessages ? "absolute bottom-0" : "relative mt-4"
      } md:min-w-[48rem]`}
      ref={dropAreaRef}
    >
      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-300 rounded-md flex items-center justify-center z-10">
          <div className="text-blue-600 font-medium">Drop images here</div>
        </div>
      )}

      {attachmentPreviews.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
          {attachmentPreviews.map((item, index) => (
            <div key={index} className="relative">
              {item.file.type.startsWith("image/") ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-md border border-gray-200">
                  <Image
                    src={item.preview}
                    width={50}
                    height={50}
                    alt="attachment"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-500">
                  {item.file.name.split(".").pop()?.toUpperCase()}
                </div>
              )}
              <button
                onClick={() => handleRemoveAttachment(index)}
                className="absolute -right-0 -top-0 rounded-full bg-gray-800 p-1 text-white shadow-md hover:bg-gray-900"
                aria-label="Remove attachment"
              >
                <IoClose size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center">
        <div className="flex w-full items-center rounded-full bg-gray-100 px-4 py-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or drop an image..."
            className="mr-2 flex-1 resize-none bg-transparent pt-1 text-gray-800 focus:outline-none"
            style={{ minHeight: "24px", maxHeight: "120px" }}
            rows={1}
          />

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
              aria-label="Add attachment"
              disabled={isSending}
            >
              <IoAdd size={20} />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={isInputEmpty || isSending}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isInputEmpty || isSending
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              aria-label="Send message"
            >
              <IoArrowUp size={18} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
          />
        </div>
      </div>
    </div>
  );
}
