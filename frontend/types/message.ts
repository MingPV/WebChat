export interface Message {
  id: string;
  roomId: string;
  sender: string;
  message: string;
  createdAt: Date;
}
