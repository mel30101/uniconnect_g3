import { db } from '@/config/firebase';
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';


export const sendMessage = async (chatId: string, text: string, senderId: string) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text,
    senderId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });

};

export const subscribeToMessages = (chatId: string, callback: Function) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
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
  otherUserId: string
) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', currentUserId)
  );

  const snapshot = await getDocs(q);

  const existingChat = snapshot.docs.find(doc => {
    const data = doc.data();
    return (
      data.participants.length === 2 &&
      data.participants.includes(otherUserId)
    );
  });

  if (existingChat) {
    return existingChat.id;
  }

  const newChatRef = await addDoc(collection(db, 'chats'), {
    participants: [currentUserId, otherUserId],
    lastMessage: '',
    updatedAt: serverTimestamp(),
  });

  return newChatRef.id;
};