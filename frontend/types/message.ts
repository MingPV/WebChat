/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Message {
  _id: string;
  roomId: string;
  sender: any;
  senderName: string;
  message: string;
  createdAt: Date;
}
