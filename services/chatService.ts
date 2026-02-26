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