export interface Chat {
    id: string;
    participants: string[];
    participantsInfo?: {
        [uid: string]: {
            name: string;
        };
    };
    lastMessage?: string;
    updatedAt?: any;
}