export interface Message {
  id: string;
  senderId: string;
  text?: string;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  hasMention?: boolean;
  mentionedUserIds?: string[];
  createdAt: any;
}
