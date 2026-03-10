import { db } from '@/config/firebase';
import axios from 'axios';
import {
  addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 600000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string
) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    type: 'text',
    text,
    senderId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
};

export const sendFileMessage = async (
  chatId: string,
  senderId: string,
  file: any
) => {
  if (!API_URL) {
    throw new Error('Backend URL no configurada');
  }

  const f = file.uri ? file : file.assets?.[0];
  if (!f || !f.uri) {
    throw new Error('Objeto de archivo inválido');
  }

  const uri: string = f.uri;
  const name: string = f.name || 'archivo_uniconnect';
  const type: string = f.mimeType || f.type || 'application/octet-stream';

  console.log('Iniciando subida a backend...', { uri, name, type });

  try {
    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('file', {
      uri: uri,
      name: name,
      type: type,
    } as any);

    const response = await api.post<{ fileUrl: string; fileName: string }>(
      `/api/chat/${chatId}/files`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('Archivo enviado y registrado con éxito');

  } catch (error: any) {
    console.error('Error detallado en sendFileMessage:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    throw new Error('No se pudo subir el archivo al servidor');
  }
};

export const subscribeToMessages = (chatId: string, callback: Function) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        type: data.type ?? 'text',
        ...data,
      };
    });
    callback(messages);
  });
};

export const subscribeToUserChats = (userId: string, callback: Function) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });
};

export const getOrCreateChat = async (
  currentUserId: string,
  otherUserId: string,
  currentUserName?: string,
  otherUserName?: string
) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', currentUserId)
  );

  const snapshot = await getDocs(q);
  const existingChat = snapshot.docs.find(doc => {
    const participants = doc.data().participants;
    return participants.includes(otherUserId)
  });

  if (existingChat) {
    return existingChat.id;
  }

  const chatDoc = await addDoc(chatsRef, {
    participants: [currentUserId, otherUserId],
    participantsInfo: {
      [currentUserId]: {name: currentUserName},
      [otherUserId]: {name: otherUserName}
    },
    lastMessage: "",
    updatedAt: serverTimestamp()
  });
  return chatDoc.id;
};