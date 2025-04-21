/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { DarkThemeToggle } from "flowbite-react";
import { Message } from "@/types/message";
import { useSocket } from "../contexts/SocketContext";
import { User } from "@/types/user";
import { IoMdArrowRoundBack } from "react-icons/io";
import Image from "next/image";
import { IoPeople } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import { TbLogout } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import Link from "next/link";

const backend_url =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function Home() {
  const [userData, setUserData] = useState<User>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("PublicRoom");
  const [currentRoomMessages, setCurrentRoomMessages] = useState<any[]>([]);
  const [currentRoomUsers, setCurrentRoomUsers] = useState<any[]>();
  const [isJoined, setIsJoined] = useState(false);
  const [isPrivateChatOpen, setIsPrivateChatOpen] = useState(false);

  //   const chatRef = useRef<HTMLDivElement>(null);
  //   const privateChatRef = useRef<HTMLDivElement>(null);
  const bottomChatRef = useRef<HTMLDivElement>(null);
  const bottomPrivateChatRef = useRef<HTMLDivElement>(null);

  const [isCreateRoom, setIsCreateRoom] = useState(false);
  const [isSelectedRoomList, setIsSelectedRoomList] = useState(false);

  const [privateChatName, setPrivateChatName] = useState("");

  const [privateChat, setPrivateChat] = useState<Map<string, any[]>>();

  const [groupName, setGroupName] = useState("");
  const [joinName, setJoinName] = useState("");

  const { socket } = useSocket();

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      return;
    }
    const handleSetUserList = (usernames: string[]) => {
      setUsers(usernames);
    };

    const handleReceivePrivateMessage = ({
      from,
      message,
      sender,
      senderProfileUrl,
      createdAt,
    }: {
      from: string;
      message: string;
      sender: string;
      senderProfileUrl: string;
      createdAt: Date;
    }) => {
      console.log(`ได้ข้อความจาก ${from}: ${message} sender : ${sender}`);

      const newMessage: any = {
        _id: "message.id",
        roomId: "no roomId",
        sender: "senderId",
        senderName: sender,
        senderProfileUrl: senderProfileUrl,
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
    };

    const handleSetAllRooms = (roomList: any[]) => {
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
    };

    const handleSetRoomMembers = ({
      roomId,
      members,
    }: {
      roomId: string;
      members: any[];
    }) => {
      console.log(`สมาชิกในห้อง ${roomId}:`, members);
      setCurrentRoomUsers(members);
    };

    const handleReveiveMessage = ({
      roomId,
      message,
      sender,
      senderProfileUrl,
      createdAt,
      senderName,
    }: {
      roomId: string;
      message: string;
      sender: any;
      senderProfileUrl: string;
      createdAt: Date;
      senderName: string;
    }) => {
      const newMessage: any = {
        _id: "message.id",
        roomId,
        sender,
        senderName,
        senderProfileUrl,
        message,
        createdAt,
      };

      if (roomId == "PublicRoom") {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        setCurrentRoomMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("join_room", "PublicRoom");

      socket.emit("get_username", (name: string) => {
        console.log("myname", name);
        setMe(name);
      });

      console.log("ming1235");

      const fetchMessagesByRoomId = async (roomId: string) => {
        try {
          const response = await fetch(
            `${backend_url}/messages/roomId/${roomId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Add this line to include cookies
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
          const response = await fetch(`${backend_url}/me`, {
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

      socket.on("user-list", handleSetUserList);
      socket.on("receive_private_message", handleReceivePrivateMessage);
      socket.on("all_rooms", handleSetAllRooms);
      socket.on("room_members", handleSetRoomMembers);
      socket.on("receive_message", handleReveiveMessage);

      fetchUserData();
      fetchMessagesByRoomId("PublicRoom");
      setIsLoading(false);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once("connect", handleConnect);
    }

    return () => {
      socket.off("user-list", handleSetUserList);
      socket.off("receive_private_message", handleReceivePrivateMessage);
      socket.off("all_rooms", handleSetAllRooms);
      socket.off("room_members", handleSetRoomMembers);
      socket.off("receive_message", handleReveiveMessage);
    };
  }, [socket]);

  const createMessageByRoomId = async (
    roomId: string,
    message: string,
    senderId: string,
    senderName: string,
  ) => {
    try {
      const response = await fetch(`${backend_url}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomId,
          senderId: senderId === "Public" ? null : senderId,
          senderName: senderName,
          content: message,
        }),
        credentials: "include", // Add this line to include cookies
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
        userData?._id || "Public",
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
          senderProfileUrl: (userData as any)?.profile_url,
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
          sender: userData?._id || "meId",
          senderName: me,
          senderProfileUrl: (userData as any)?.profile_url,
          createdAt: new Date(),
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
    setJoinName("");
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

    setGroupName("");
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
        senderProfileUrl: (userData as any)?.profile_url,
        createdAt: new Date(),
      });

      const newMessage: Message = {
        _id: "message.id",
        roomId: "no roomId",
        sender: "senderId",
        senderName: me || "",
        message,
        createdAt: new Date(),
      };

      setPrivateChat((prev) => {
        const updatedChat = new Map(prev);
        const existingMessages = updatedChat.get(sendTo) || [];
        updatedChat.set(sendTo, [...existingMessages, newMessage]);
        console.log("updatedChat", updatedChat);
        return updatedChat;
      });
    }
  };

  useEffect(() => {
    if (currentRoom == "PublicRoom") {
      //   if (chatRef.current) {
      //     chatRef.current.scrollTop = chatRef.current.scrollHeight;
      //   }
      bottomChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // if (chatRef.current) {
    //   chatRef.current.scrollTop = chatRef.current.scrollHeight;
    // }
    bottomChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentRoomMessages]);

  useEffect(() => {
    // if (privateChatRef.current) {
    //   privateChatRef.current.scrollTop = privateChatRef.current.scrollHeight;
    // }
    if (isPrivateChatOpen) {
      bottomPrivateChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [privateChat]);

  const convertTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    // const day = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${hours}:${minutes}`;
  };

  if (!socket || isLoading) return <p>🔄 Connecting to chat server...</p>;

  return (
    <main className="bg-base-100 dark:bg-base-1100/90 flex min-h-screen flex-col items-center justify-center bg-cover px-4 py-24 transition-all duration-1000">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <Link
        className="bg-base-300 hover:bg-base-200 dark:bg-base-200 dark:hover:bg-base-350 absolute top-12 left-8 ml-4 flex w-fit flex-row items-center justify-start gap-2 rounded-lg border-2 border-r-4 border-b-4 border-black/80 px-4 py-2 transition-all duration-300 hover:cursor-pointer"
        href={"/home"}
      >
        Back <IoMdArrowRoundBack />
      </Link>

      <div className="flex w-full flex-row gap-12">
        <div className="mt-6 flex w-[22vw] flex-col justify-center">
          <div className="flex flex-row justify-start gap-2">
            <div
              className="bg-base-200 hover:bg-base-300 dark:bg-base-300 dark:hover:bg-base-350 dark:text-base-100 rounded-t-sm border-2 border-b-0 p-2 text-sm transition-all duration-300 hover:cursor-pointer dark:border-black"
              onClick={() => setIsCreateRoom(false)}
            >
              Join
            </div>
            <div
              className="bg-base-200 hover:bg-base-300 dark:bg-base-300 dark:hover:bg-base-350 dark:text-base-100 rounded-t-sm border-2 border-b-0 p-2 text-sm transition-all duration-300 hover:cursor-pointer dark:border-black"
              onClick={() => setIsCreateRoom(true)}
            >
              Create
            </div>
          </div>
          <div className="bg-base-300 dark:bg-base-400 rounded-lg rounded-tl-none border-2 border-r-4 border-b-4 border-black/80 p-4 transition-all duration-1000">
            {isCreateRoom ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-base-100 flex-1 rounded-lg border p-2.5 text-sm text-gray-900 transition-all duration-1000 focus:ring-0 focus:outline-none"
                  placeholder="Enter group name..."
                />
                <button
                  onClick={() => handleCreatePublicGroup(groupName)}
                  className="bg-base-400 hover:bg-base-350 dark:bg-base-300 dark:hover:bg-base-500 dark:text-base-100 focus:ring-none rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:cursor-pointer focus:ring-2 focus:outline-none"
                >
                  Create
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="bg-base-100 flex-1 rounded-lg border p-2.5 text-sm text-gray-900 focus:ring-0 focus:outline-none"
                  placeholder="Enter room name..."
                />
                <button
                  onClick={() => joinPublicRoomId(joinName)}
                  className="bg-base-400 hover:bg-base-350 dark:bg-base-300 dark:hover:bg-base-500 dark:text-base-100 focus:ring-none rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:cursor-pointer focus:ring-2 focus:outline-none"
                >
                  Join
                </button>
              </div>
            )}
          </div>

          <div className="bg-base-300 dark:bg-base-400 mt-4 mb-4 flex flex-1 flex-col rounded-lg border-2 border-r-4 border-b-4 border-black/80 transition-all duration-1000">
            <div className="mx-3 my-3 flex flex-row items-center justify-center gap-8">
              <h2
                className={`text-md text-gray-900 hover:cursor-pointer hover:underline dark:text-white ${!isSelectedRoomList ? "underline" : ""}`}
                onClick={() => setIsSelectedRoomList(false)}
              >
                Online Users
              </h2>
              <h2
                className={`text-md text-gray-900 hover:cursor-pointer hover:underline dark:text-white ${isSelectedRoomList ? "underline" : ""}`}
                onClick={() => setIsSelectedRoomList(true)}
              >
                Online Rooms
              </h2>
            </div>

            {isSelectedRoomList ? (
              <ul
                className="bg-base-200 w-full flex-1 columns-1 space-y-3 pt-4"
                key={rooms.length}
              >
                {rooms.map((room, index) => (
                  <li
                    key={index}
                    className="bg-base-100 dark:bg-base-300 dark:text-base-600 dark:hover:bg-base-350 dark:hover:text-base-100 hover:bg-base-300 mx-2 inline-block w-fit items-center gap-2 rounded-lg p-2 text-sm text-gray-900 shadow-sm transition-all duration-300 hover:cursor-pointer"
                    onClick={() => {
                      joinPublicRoomId(room.roomId.replace("PublicGroup_", ""));
                    }}
                  >
                    <div>
                      <span className="mr-4 inline-block h-2 w-2 rounded-full bg-green-500 dark:bg-lime-500"></span>
                      {room.roomId}
                    </div>
                    <div className="mt-3 ml-6 flex flex-col gap-1">
                      {room.members.map((member: any, idx: string) => (
                        <div key={idx}>
                          <span className="dark:bg-base-100 mr-4 inline-block h-2 w-2 rounded-full bg-cyan-800/40"></span>
                          {member.username}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul
                className="bg-base-200 w-full flex-1 columns-2 space-y-3 pt-4"
                key={users.length}
              >
                {users.map((user, index) => (
                  <li
                    key={index}
                    className="bg-base-100 dark:bg-base-300 dark:text-base-600 dark:hover:bg-base-350 dark:hover:text-base-100 hover:bg-base-300 mx-2 inline-block w-fit items-center gap-2 rounded-lg p-2 text-sm text-gray-900 shadow-sm transition-all duration-300 hover:cursor-pointer"
                    onClick={() => {
                      if (user == me) {
                        alert("you can't direct message to yourself.");
                        return;
                      }
                      if (user != privateChatName && isPrivateChatOpen) {
                        setPrivateChatName(user);
                        return;
                      }
                      setPrivateChatName(user);
                      setIsPrivateChatOpen(!isPrivateChatOpen);
                    }}
                  >
                    <div>
                      <span className="mr-4 inline-block h-2 w-2 rounded-full bg-green-500 dark:bg-lime-500"></span>
                      {user}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="bg-base-200 flex flex-col items-center gap-2 pb-4">
              <div className="text-sm text-black/50">1/1</div>
              <div className="flex justify-center">
                <div className="bg-base-100 dark:bg-base-350 dark:border-base-350 dark:text-base-100 dark:hover:bg-base-500 dark:hover:border-base-500 flex h-8 items-center justify-center rounded-lg border-2 border-r-4 border-b-4 border-black/80 px-3 text-sm font-bold text-gray-500 transition-all duration-300 hover:cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:hover:text-white">
                  {"<"}
                </div>

                <div className="bg-base-100 dark:bg-base-350 dark:border-base-350 dark:text-base-100 dark:hover:bg-base-500 dark:hover:border-base-500 ms-3 flex h-8 items-center justify-center rounded-lg border-2 border-r-4 border-b-4 border-black/80 px-3 text-sm font-bold text-gray-500 transition-all duration-300 hover:cursor-pointer hover:bg-gray-100 hover:text-gray-700 dark:hover:text-white">
                  {">"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`bg-base-300 dark:bg-base-400 flex flex-row gap-4 rounded-lg border-2 border-r-4 border-b-4 border-black/80 py-4 transition-all duration-500 ease-in-out ${isPrivateChatOpen ? "w-[50vw]" : "w-[70vw]"} `}
        >
          <div className="flex-1">
            <h1 className="dark:text-base-100 mb-4 ml-8 text-start text-xl font-semibold text-gray-900/80">
              Room: {currentRoom}
            </h1>

            <div className="bg-base-200 dark:bg-base-200 mb-4 h-[60vh] overflow-y-auto px-4 transition-all duration-1000">
              {currentRoom == "PublicRoom"
                ? messages.map((message: any, index) => (
                    <div key={index} className="w-full">
                      {message.senderName == me ? (
                        <div className="my-4 flex w-full justify-end gap-2.5">
                          <div className="flex w-full max-w-[320px] flex-col items-end gap-1">
                            <div className="flex flex-row gap-2">
                              <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-400">
                                {convertTime(message.createdAt.toString())}
                              </span>
                              <p className="bg-base-300 dark:bg-base-100 dark:text-base-1000 rounded-lg rounded-tr-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="my-4 flex items-start gap-2.5">
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={`${message.sender?.profile_url || message.senderProfileUrl || "/profile-2.jpg"}`}
                            alt="Jese image"
                            width={48}
                            height={48}
                          />
                          <div className="flex w-full max-w-[320px] flex-col gap-1">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span className="dark:text-base-1000 text-sm font-bold text-gray-700">
                                {message.senderName}
                              </span>
                            </div>
                            <div className="flex flex-row gap-2">
                              <p className="bg-base-100 dark:bg-base-300 rounded-lg rounded-tl-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900 transition-all duration-1000 dark:text-white">
                                {message.message}
                              </p>
                              <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-400">
                                {convertTime(message.createdAt.toString())}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    // {message.senderName}
                  ))
                : currentRoomMessages.map((message: any, index) => (
                    <div key={index} className="w-full">
                      {message.senderName == me ? (
                        <div className="my-4 flex w-full justify-end gap-2.5">
                          <div className="flex w-full max-w-[320px] flex-col items-end gap-1">
                            <div className="flex flex-row gap-2">
                              <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-400">
                                {convertTime(message.createdAt.toString())}
                              </span>
                              <p className="bg-base-100 dark:bg-base-100 dark:text-base-1000 rounded-lg rounded-tr-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="my-4 flex items-start gap-2.5">
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={`${message.sender?.profile_url || message.senderProfileUrl || "/profile-2.jpg"}`}
                            alt="Jese image"
                            width={48}
                            height={48}
                          />
                          <div className="flex w-full max-w-[320px] flex-col gap-1">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span className="text-sm font-bold text-gray-700 dark:text-white">
                                {message.senderName}
                              </span>
                            </div>
                            <div className="flex flex-row gap-2">
                              <p className="bg-base-100 dark:bg-base-300 rounded-lg rounded-tl-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900 transition-all duration-1000 dark:text-white">
                                {message.message}
                              </p>
                              <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-400">
                                {convertTime(message.createdAt.toString())}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              <div ref={bottomChatRef} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} // Added onKeyDown handler
                className="text-md bg-base-100 ml-10 flex-1 rounded-lg border-none py-2 pr-2 pl-2 text-gray-900 transition-all duration-1000 focus:ring-0 focus:outline-none"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSendMessage}
                className="mr-6 rounded-md p-2 text-2xl hover:cursor-pointer"
              >
                <LuSend />
              </button>
              {isJoined ? (
                <button
                  onClick={() => {
                    leavePublicRoomId(currentRoom);
                  }}
                  className="bg-base-350 hover:bg-base-200 dark:bg-base-300 dark:hover:bg-base-200 dark:hover:text-base-1000 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:cursor-pointer"
                >
                  Leave
                </button>
              ) : null}
            </div>
          </div>
          {currentRoom == "PublicRoom" ? null : (
            <div className={`m-4 mr-6`}>
              <h2 className="mb-4 flex flex-row items-center justify-center gap-2 text-center text-lg text-gray-900 dark:text-white">
                {"members"}
                <span>
                  <IoPeople />
                </span>
              </h2>
              <ul className="space-y-2">
                {(currentRoomUsers ?? []).map((user, index) => (
                  <li
                    key={index}
                    className="bg-base-100 dark:bg-base-300 flex items-center gap-2 rounded-lg p-2 text-xs text-gray-900 shadow-sm dark:text-white"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 dark:bg-lime-500"></span>
                    {user.username} {user.username == me ? "(me)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className={`bg-base-300 dark:bg-base-400 absolute right-8 flex w-[20vw] flex-row gap-4 rounded-lg border-2 border-r-4 border-b-4 border-black/80 p-4 transition-all duration-500 ease-in-out ${isPrivateChatOpen ? "translate-x-0" : "translate-x-96"}`}
        >
          <div className="w-full">
            <div className="dark:text-base-100 mb-4 flex flex-row items-center justify-between text-center font-bold text-gray-900">
              <div className="text-md ml-4">Chat with {privateChatName}</div>
              <span
                className="dark:bg-base-300 dark:hover:dark:bg-base-200 bg-base-400 hover:bg-base-350 flex w-fit flex-row justify-end rounded-lg p-2 text-white hover:cursor-pointer"
                onClick={() => {
                  setIsPrivateChatOpen(false);
                }}
              >
                <RxCross2 />
              </span>
            </div>
            <div className="bg-base-200 dark:bg-base-200 mb-4 h-[60vh] overflow-y-auto rounded-lg border px-2 transition-all duration-1000">
              {(privateChat?.get(privateChatName) ?? []).map(
                (message, index) => (
                  <div key={index} className="w-full">
                    {message.senderName == me ? (
                      <div className="my-4 flex w-full justify-end gap-2.5">
                        <div className="flex w-full max-w-[320px] flex-col items-end gap-1">
                          <div className="flex flex-row gap-2">
                            <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-400">
                              {convertTime(message.createdAt.toString())}
                            </span>
                            <p className="bg-base-300 dark:bg-base-100 dark:text-base-1000 rounded-lg rounded-tr-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="my-4 flex items-start gap-2.5">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={`${message.sender?.profile_url || message.senderProfileUrl || "/profile-2.jpg"}`}
                          alt="Jese image"
                          width={48}
                          height={48}
                        />
                        <div className="flex w-full max-w-[320px] flex-col gap-1">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="text-sm font-bold text-gray-700 dark:text-white">
                              {message.senderName}
                            </span>
                          </div>
                          <div className="flex flex-row gap-2">
                            <p className="bg-base-100 dark:bg-base-300 rounded-lg rounded-tl-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900 transition-all duration-1000 dark:text-white">
                              {message.message}
                            </p>
                            <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-400">
                              {convertTime(message.createdAt.toString())}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              )}
              <div ref={bottomPrivateChatRef} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleSendMessage2(privateChatName, input2)
                } // Added onKeyDown handler
                className="bg-base-100 flex-1 rounded-lg border-none py-2 pr-2 pl-2 text-sm text-gray-900 transition-all duration-1000 focus:ring-0 focus:outline-none"
                placeholder="Type your message..."
              />
              <button
                onClick={() => handleSendMessage2(privateChatName, input2)}
                className="rounded-md p-2 text-2xl hover:cursor-pointer"
              >
                <LuSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
