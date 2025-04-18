/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Message } from "@/types/message";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import Image from "next/image";
import { LuSend } from "react-icons/lu";

type Props = { room: Room; myData: User; roomName: string };

const backend_url =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function ChatCard({ room, myData, roomName }: Props) {
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<any[]>();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  // const [roomName, setRoomName] = useState("");

  const bottomChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    console.log(room);
    // setRoomName(room.name.split(" ").pop() || "");

    if (!socket) {
      console.log("mingza");
      return;
    }

    if (!isJoined) {
      socket.emit("join_room", room.roomId);
      setIsJoined(true);
    }

    // Listen for incoming messages
    socket.on(
      "receive_message",
      ({ _id, message, sender, senderName, senderProfileUrl, createdAt }) => {
        console.log("got message");
        const newMessage: any = {
          _id: _id,
          roomId: room._id,
          sender: sender,
          senderName: senderName,
          senderProfileUrl: senderProfileUrl,
          message: message,
          createdAt: createdAt,
        };

        console.log("newMessage ", newMessage);

        setMessages((prevMessages) => [...(prevMessages || []), newMessage]);
      },
    );

    const fetchMessagesByRoomId = async (roomId: string) => {
      try {
        const response = await fetch(
          `${backend_url}/messages/roomId/${roomId}`,
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
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };

    fetchMessagesByRoomId(room.roomId);

    setIsLoading(false);
  }, [socket]);

  useEffect(() => {
    bottomChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const convertTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    // const day = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${hours}:${minutes}`;
  };

  const sendMessage = async (message: string) => {
    if (input.trim() === "") return;

    const sentMessage = await createMessageByRoomId(
      room.roomId,
      message,
      myData._id,
      myData.username,
    );

    console.log("Sent message:", sentMessage._id);

    if (socket) {
      // Emit the message to the server
      console.log("mingza2");
      console.log(socket);
      socket.emit("send_message", {
        _id: sentMessage._id,
        roomId: room.roomId,
        message: sentMessage.message,
        sender: sentMessage.sender,
        senderName: sentMessage.senderName,
        senderProfileUrl: (myData as any).profile_url,
        createdAt: sentMessage.createdAt,
      });
    }

    console.log(messages);
    // setMessages((prevMessages) => [...prevMessages, sentMessage]);
  };

  const handleSendMessage = () => {
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      <div key={room._id} className="flex h-full w-full flex-row gap-2">
        <div className="flex h-full w-full flex-row">
          <div className="h-full w-full">
            {isOpen && (
              <div className="flex h-full w-full flex-col gap-2">
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  // chat card start herte
                  <div className="bg-base-200 flex h-full w-full flex-col rounded-lg shadow-md">
                    <h1 className="dark:text-base-100 text-md bg-base-300 rounded-t-md rounded-tr-sm p-4 text-start font-semibold text-gray-900/80 transition-all duration-1000">
                      {roomName}
                    </h1>
                    <div className="flex-1 space-y-2 overflow-y-auto">
                      <div className="overflow-y-auto px-4 transition-all duration-1000">
                        {messages?.map((message: any, index) => (
                          <div key={index} className="w-full">
                            {message.sender._id == myData._id ||
                            message.sender == myData._id ? (
                              <div className="my-4 flex w-full justify-end gap-2.5">
                                <div className="flex w-full max-w-[320px] flex-col items-end gap-1">
                                  <div className="flex flex-row gap-2">
                                    <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-300">
                                      {convertTime(
                                        message.createdAt.toString(),
                                      )}
                                    </span>
                                    <p className="dark:text-base-1000 bg-base-300 dark:bg-base-100 rounded-lg rounded-tr-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900 transition-all duration-1000">
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
                                    <p
                                      className={`bg-base-100 dark:bg-base-300 rounded-lg rounded-tl-none border-1 border-black/80 py-2.5 pr-4 pl-2 text-sm text-gray-900 transition-all duration-1000 dark:text-white`}
                                    >
                                      {message.message}
                                    </p>
                                    <span className="flex items-end justify-end text-xs font-normal text-gray-500 dark:text-gray-300">
                                      {convertTime(
                                        message.createdAt.toString(),
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          // {message.senderName}
                        ))}
                      </div>
                      <div ref={bottomChatRef}></div>
                    </div>

                    {/* input and send button */}
                    <div className="bg-base-300 flex items-center gap-2 rounded-b-sm p-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        } // Added onKeyDown handler
                        placeholder="Type your message..."
                        className="bg-base-100 flex-1 rounded-lg px-3 py-2 focus:outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="text-xl text-black/70 hover:text-black"
                      >
                        <LuSend />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
