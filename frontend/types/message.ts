export interface Message {
  _id: string;
  roomId: string;
  sender: string;
  senderName: string;
  message: string;
  createdAt: Date;
}
