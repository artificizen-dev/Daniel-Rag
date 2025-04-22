export interface Chatroom {
  room_id: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  created_at: string;
  attachments?: {
    type: string;
    url: string;
  }[];
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement> | null;
}

export interface ChatInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  isSending: boolean;
  hasMessages: boolean;
}

export interface ChatAreaProps {
  chatroomId: string | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  refreshChatrooms: () => void;
  createNewChatroom: () => void;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface ChatHeaderProps {
  chatroomId: string | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export interface ChatSidebarProps {
  isOpen: boolean;
  chatrooms: Chatroom[];
  isloading: boolean;
  currentChatroomId: string | null;
  onSelectChatroom: (chatroomId: string) => void;
  onCreateNewChat: () => void;
  onToggleSidebar: () => void;
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total?: number;
}

export interface Resource {
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  chunk_count: number;
  status: string;
  uploaded_at: string;
  file_link?: string;
}

export interface ResourceResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  resources: Resource[];
}
