/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { DarkThemeToggle } from "flowbite-react";
import { Message } from "@/types/message";
import { useSocket } from "../contexts/SocketContext";
import { User } from "@/types/user";

export default function Home() {
  const [userData, setUserData] = useState<User>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("PublicRoom");
  const [currentRoomMessages, setCurrentRoomMessages] = useState<Message[]>([]);
  const [currentRoomUsers, setCurrentRoomUsers] = useState<any[]>();
  const [isJoined, setIsJoined] = useState(false);

  const [privateChatName, setPrivateChatName] = useState("");

  const [privateChat, setPrivateChat] = useState<Map<string, Message[]>>();
  const [privateChat_mySent, setPrivateChat_mySent] =
    useState<Map<string, Message[]>>();

  const [groupName, setGroupName] = useState("");
  const [joinName, setJoinName] = useState("");

  const { socket } = useSocket();

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      return;
    }

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("join_room", "PublicRoom");

      socket.emit("get_username", (name: string) => {
        console.log("myname", name);
        setMe(name);
      });

      console.log("ming1235");

      socket.on("user-list", (usernames: string[]) => {
        setUsers(usernames);
      });

      socket.on(
        "receive_private_message",
        ({ from, message, sender, createdAt }) => {
          console.log(`ได้ข้อความจาก ${from}: ${message} sender : ${sender}`);

          const newMessage: Message = {
            _id: "message.id",
            roomId: "no roomId",
            sender: "senderId",
            senderName: sender,
            message,
            createdAt,
          };

          setPrivateChat((prev) => {
            const updatedChat = new Map(prev);
            const existingMessages = updatedChat.get(sender) || [];
            updatedChat.set(sender, [...existingMessages, newMessage]);
            console.log("updatedChat", updatedChat);
            return updatedChat;
          });

          //   setCurrentRoomMessages((prevMessages) => [
          //     ...prevMessages,
          //     newMessage,
          //   ]);
        },
      );

      socket.on("all_rooms", (roomList: any[]) => {
        // eslint-disable-next-line prefer-const
        let roomList2: any[] = [];
        console.log("roomList", roomList);
        if (roomList) {
          roomList.forEach((room: any) => {
            if (room.roomId.startsWith("PublicGroup")) {
              roomList2.push(room);
            }
            if (room.roomId == currentRoom && room.roomId != "PublicRoom") {
              setCurrentRoomUsers(room.members);
            }
          });
        }
        console.log("roomList2", roomList2);

        setRooms(roomList2);
      });

      socket.on("room_members", ({ roomId, members }) => {
        console.log(`สมาชิกในห้อง ${roomId}:`, members);
        setCurrentRoomUsers(members);
      });

      socket.on(
        "receive_message",
        ({ roomId, message, sender, createdAt, senderName }) => {
          const newMessage: Message = {
            _id: "message.id",
            roomId,
            sender,
            senderName,
            message,
            createdAt,
          };

          if (roomId == "PublicRoom") {
            setMessages((prev) => [...prev, newMessage]);
          } else {
            setCurrentRoomMessages((prevMessages) => [
              ...prevMessages,
              newMessage,
            ]);
          }
        },
      );

      const fetchMessagesByRoomId = async (roomId: string) => {
        try {
          const response = await fetch(
            `http://localhost:8080/messages/roomId/${roomId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          const data = await response.json();
          console.log("Fetched messages:", data);
          setMessages(data.data); // Assuming the messages are in data.data
          if (currentRoom == "PublicRoom") {
            setCurrentRoomMessages(data.data);
          }
        } catch (error) {
          console.error(
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          );
        }
      };

      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:8080/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          if (!response.ok) {
            console.log("no user logged in");
            return;
          }
          const data = await response.json();
          console.log("Fetched user data:", data);
          setUserData(data.data); // Assuming the user data is in data.data
          setMe(data.data.username);
          socket.emit("set-username", data.data.username);
        } catch (error) {
          console.error(
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          );
        }
      };

      fetchUserData();
      fetchMessagesByRoomId("PublicRoom");
      setIsLoading(false);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once("connect", handleConnect);
    }
  }, [socket]);

  const createMessageByRoomId = async (
    roomId: string,
    message: string,
    senderId: string,
    senderName: string,
  ) => {
    try {
      const response = await fetch(`http://localhost:8080/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomId,
          senderId: senderId,
          senderName: senderName,
          content: message,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create message");
      }
      const data = await response.json();
      console.log("Created message:", data);
      return data.data; // Assuming the created message is in data.data
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const sendMessage = async (message: string) => {
    if (input.trim() === "" || !me) {
      console.log(me, socket);
      console.log("ming123");
      return;
    }

    console.log("zaza", currentRoom);

    if (currentRoom == "PublicRoom") {
      const sentMessage = await createMessageByRoomId(
        "PublicRoom",
        message,
        "Public",
        me,
      );

      console.log("Sent message:", sentMessage);

      if (socket) {
        // Emit the message to the server
        socket.emit("send_message", {
          roomId: "PublicRoom",
          message: sentMessage.message,
          sender: sentMessage.sender,
          senderName: sentMessage.senderName,
          createdAt: sentMessage.createdAt,
        });
      }
    } else {
      console.log("mingza123", me);

      if (socket) {
        // Emit the message to the server
        socket.emit("send_message", {
          roomId: currentRoom,
          message: input,
          sender: "meId",
          senderName: me,
          createdAt: "sentMessage.createdAt",
        });
      }
    }

    // setMessages((prevMessages) => [...prevMessages, sentMessage]);
  };

  const joinPublicRoomId = async (roomId: string) => {
    const realRoomId = `PublicGroup_${roomId}`;

    if (realRoomId == currentRoom) {
      return;
    }

    let isExisted = false;

    console.log(rooms, realRoomId);

    rooms.forEach((room) => {
      if (room.roomId == realRoomId) {
        isExisted = true;
        return;
      }
    });

    if (!isExisted) {
      alert("Group name doesn't exists");
      return;
    }

    if (socket) {
      if (currentRoom != "PublicRoom") {
        socket.emit("leave_public_room", currentRoom);
      }
      socket.emit("join_room", realRoomId);
      setCurrentRoom(realRoomId);
      console.log("set current room", realRoomId);
      setCurrentRoomMessages([]);
      console.log("joined room", realRoomId);

      socket.emit("get_my_room_members", realRoomId);

      setIsJoined(true);
    }
  };

  const leavePublicRoomId = async (roomId: string) => {
    // const realRoomId = `PublicGroup_${roomId}`;
    if (socket) {
      socket.emit("leave_public_room", currentRoom);
      setCurrentRoom("PublicRoom");
      setCurrentRoomMessages([]);
      setCurrentRoomUsers([]);
      setIsJoined(false);
    }
  };

  const handleCreatePublicGroup = async (roomId: string) => {
    const realRoomId = `PublicGroup_${roomId}`;

    let isExisted = false;

    rooms.forEach((room) => {
      if (room.roomId == realRoomId) {
        isExisted = true;
        return;
      }
    });

    if (isExisted) {
      alert("This group already exists");
      return;
    }

    if (socket) {
      socket.emit("leave_public_room", currentRoom);
      socket.emit("join_room", realRoomId);
      socket.emit("create_room", realRoomId);
      setCurrentRoom(realRoomId);
      setCurrentRoomMessages([]);
      console.log("joined room", realRoomId);

      console.log(rooms);

      socket.emit("get_my_room_members", realRoomId);

      setIsJoined(true);
    }
  };

  const handleSendMessage = () => {
    sendMessage(input);
    setInput("");
    console.log(rooms);
    console.log(currentRoomUsers);
  };

  const handleSendMessage2 = (sendTo: string, message: string) => {
    setInput2("");
    if (socket) {
      socket.emit("private_message", {
        toSocketUsername: sendTo, // socket id ของคนที่มิงอยากส่งหา
        message: message,
        sender: me,
        createdAt: "now??",
      });

      const newMessage: Message = {
        _id: "message.id",
        roomId: "no roomId",
        sender: "senderId",
        senderName: me || "",
        message,
        createdAt: new Date(),
      };

      setPrivateChat_mySent((prev) => {
        const updatedChat = new Map(prev);
        const existingMessages = updatedChat.get(sendTo) || [];
        updatedChat.set(sendTo, [...existingMessages, newMessage]);
        console.log("updatedChat_mySent", updatedChat);
        return updatedChat;
      });
    }
  };

  if (!socket || isLoading) return <p>🔄 Connecting to chat server...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>

      <div className="absolute top-18 left-18 flex flex-row gap-2">
        <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            Online Rooms
          </h2>
          <ul className="space-y-2" key={rooms.length}>
            {rooms.map((room, index) => (
              <li
                key={index}
                className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-2 text-sm text-gray-900 shadow-sm hover:cursor-pointer hover:bg-gray-300 dark:bg-gray-800 dark:text-white"
                onClick={() => {
                  joinPublicRoomId(room.roomId.replace("PublicGroup_", ""));
                }}
              >
                <div>
                  <span className="mr-4 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  {room.roomId}
                </div>
                <div className="flex flex-col gap-1">
                  {room.members.map((member: any, idx: string) => (
                    <div key={idx}>
                      <span className="mr-4 inline-block h-2 w-2 rounded-full bg-cyan-800/40"></span>
                      {member.username}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            Online Users
          </h2>
          <ul className="space-y-2">
            {users.map((user, index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 text-sm text-gray-900 shadow-sm hover:cursor-pointer hover:bg-gray-300 dark:bg-gray-800 dark:text-white"
                onClick={() => {
                  setPrivateChatName(user);
                }}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-row gap-12">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border-2 border-r-4 border-b-4 border-black/80 bg-amber-800/40 p-4">
            <h1 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
              Join a Room
            </h1>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Enter room name..."
              />
              <button
                onClick={() => joinPublicRoomId(joinName)}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Join
              </button>
            </div>
          </div>
          <div className="rounded-lg border-2 border-r-4 border-b-4 border-black/80 bg-amber-800/40 p-4">
            <h1 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
              Create a Public Group
            </h1>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Enter group name..."
              />
              <button
                onClick={() => handleCreatePublicGroup(groupName)}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Create & Join
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-4 rounded-lg border-2 border-r-4 border-b-4 border-black/80 bg-amber-800/40 p-4">
          <div>
            <h1 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
              Room: {currentRoom}
            </h1>
            <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
              {currentRoom == "PublicRoom"
                ? messages.map((message, index) => (
                    <div
                      key={index}
                      className="mb-2 text-sm text-gray-900 dark:text-white"
                    >
                      {message.senderName}: {message.message}
                    </div>
                  ))
                : currentRoomMessages.map((message, index) => (
                    <div
                      key={index}
                      className="mb-2 text-sm text-gray-900 dark:text-white"
                    >
                      {message.senderName}: {message.message}
                    </div>
                  ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSendMessage}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Send
              </button>
              {isJoined ? (
                <button
                  onClick={() => {
                    leavePublicRoomId(currentRoom);
                  }}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Leave
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
              <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                {currentRoom}
              </h2>
              <ul className="space-y-2">
                {(currentRoomUsers ?? []).map((user, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 text-sm text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    {user.username} {user.username == me ? "(me)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-4 rounded-lg border-2 border-r-4 border-b-4 border-black/80 bg-amber-800/40 p-4">
          <div>
            <h1 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
              Chat with {privateChatName}
            </h1>
            <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
              {(privateChat?.get(privateChatName) ?? []).map(
                (message, index) => (
                  <div
                    key={index}
                    className="mb-2 text-sm text-gray-900 dark:text-white"
                  >
                    {message.senderName}: {message.message}
                  </div>
                ),
              )}
            </div>
            <div className="bg-slate-100">
              {(privateChat_mySent?.get(privateChatName) ?? []).map(
                (message, index) => (
                  <div
                    key={index}
                    className="mb-2 text-sm text-gray-900 dark:text-white"
                  >
                    {message.senderName}: {message.message}
                  </div>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Type your message..."
              />
              <button
                onClick={() => handleSendMessage2(privateChatName, input2)}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
