import { User } from "./user";

export interface Room {
  _id: string;
  roomId: string;
  name: string;
  isGroup: boolean;
  participants: User[];
  createdBy: string;
  lastMessage: string;
  lastMessageDate: Date;
  createdAt: Date;
}
