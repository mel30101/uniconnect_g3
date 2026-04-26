import { IGroupChatRepository } from '../../domain/repositories/IGroupChatRepository';
import { Message } from '../../domain/entities/Message';
import { db } from '../sources/FirebaseClient';
import apiClient from '../sources/ApiClient';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

export class FirestoreGroupChatRepository implements IGroupChatRepository {
  async sendGroupMessage(groupId: string, text: string, senderId: string): Promise<void> {
    await apiClient.post(`/api/group-chats/${groupId}/messages`, {
      senderId,
      text,
    });
  }

  async sendGroupFileMessage(groupId: string, senderId: string, file: any): Promise<void> {
    const f = file.uri ? file : file.assets?.[0];
    if (!f || !f.uri) {
      throw new Error('Objeto de archivo inválido');
    }

    const uri: string = f.uri;
    const name: string = f.name || 'archivo_uniconnect';
    const type: string = f.mimeType || f.type || 'application/octet-stream';

    const formData = new FormData();
    formData.append('senderId', senderId);

    if (file.file) {
      formData.append('file', file.file);
    } else {
      formData.append('file', {
        uri,
        name,
        type,
      } as any);
    }

    await apiClient.post(`/api/group-chats/${groupId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  subscribeToGroupMessages(groupId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          type: data.type ?? 'text',
          ...data,
        } as Message;
      });
      callback(messages);
    });
  }
}
