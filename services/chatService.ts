import { db } from '@/config/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string
) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    type: 'text',          // aquí ya lo marcas
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
  try {
    const formData = new FormData();
    formData.append("senderId", senderId);

    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream"
    } as any);

    const response = await axios.post<{ fileUrl: string; fileName: string }>(
      `${API_URL}/chat/${chatId}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    const { fileUrl, fileName } = response.data;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {

      type: "file",
      senderId,
      fileName,
      fileUrl,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'chats', chatId), {

      lastMessage: ` ${fileName}`,
      updatedAt: serverTimestamp(),

    });

  } catch (error: any) {

    console.error("Error enviando archivo:", error);

    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${error.response.data}`
      );
    }

    throw new Error("No se pudo subir el archivo");
  }
};

export const subscribeToMessages = (chatId: string, callback: Function) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        type: data.type ?? 'text', // aseguro un valor por defecto
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