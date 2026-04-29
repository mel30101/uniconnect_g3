export interface AppNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  data: {
    groupId?: string;
    groupName?: string;
    userName?: string;
    [key: string]: any;
  };
}
