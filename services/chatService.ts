const API_URL = "https://corrine-hirudinoid-ayleen.ngrok-free.dev"

export const sendMessage = async (
    chatId: string,
    senderId: string,
    text: string
) => {
    await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, text }),
  });
};

export const getMessages = async (chatId: string) => {
    const res = await fetch(`${API_URL}/chats/${chatId}/messages`);
  return await res.json();
}