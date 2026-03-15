import { Message } from '../entities/Message';
import { Chat } from '../entities/Chat';

export interface IChatRepository {
  sendMessage(chatId: string, text: string, senderId: string): Promise<void>;
  sendFileMessage(chatId: string, senderId: string, file: any): Promise<void>;
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void;
  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void;
  getOrCreateChat(
    currentUserId: string,
    otherUserId: string,
    currentUserName?: string,
    otherUserName?: string
  ): Promise<string>;
  getChatDetails(chatId: string): Promise<any>;
}
