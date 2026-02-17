
export enum MessageSender {
  USER = 'USER',
  AI = 'AI'
}

export interface Story {
  id: string;
  type: 'text' | 'image';
  content: string;
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
  mediaUrl?: string;
  isAudio?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar: string;
  lastMessage?: string;
  hasStory?: boolean;
  stories?: Story[];
}

export interface ChatSession {
  contactId: string;
  messages: Message[];
}
