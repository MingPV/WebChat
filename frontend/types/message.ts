export interface Message {
  _id: string;
  roomId: string;
  sender: string;
  message: string;
  createdAt: Date;
}
