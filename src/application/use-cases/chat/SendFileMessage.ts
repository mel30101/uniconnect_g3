import { IChatRepository } from '../../domain/repositories/IChatRepository';

export class SendFileMessage {
  constructor(private chatRepo: IChatRepository) {}

  async execute(chatId: string, senderId: string, file: any) {
    return this.chatRepo.sendFileMessage(chatId, senderId, file);
  }
}
