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
  attachments?: Array<{ type: string; url: string }>;
  references?: Resource[];
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
  setCurrentChatroomId: React.Dispatch<React.SetStateAction<string | null>>;
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

export interface ResourceResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  resources: Resource[];
}

export interface Resource {
  file_id: string;
  file_type: string;
  file_link?: string;
  chunk_id: string;
  file_name: string;
  page_number: number;
  gcp_bucket_url: string;
  text_content: string;
  resource_id: string;
  score: number;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export interface ChatroomContextType {
  chatrooms: Chatroom[];
  isLoading: boolean;
  error: string | null;
  fetchChatrooms: () => Promise<void>;
  addChatroom: (chatroom: Chatroom) => Promise<void>;
  createChatroom: (name: string) => Promise<Chatroom | null>;
  removeChatroom: (roomId: string) => Promise<void>;
}
