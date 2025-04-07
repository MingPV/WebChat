export interface Friend {
  _id: string;
  user_id: string;
  friend_id: string;
  user_name: string;
  friend_name: string;
  status: string;
  is_accepted: boolean;
  since: string;
  createAt: Date;
}
