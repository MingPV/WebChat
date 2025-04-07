"use client";

import { Message } from "@/types/message";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Props = { room: Room; myData: User };

let socket: Socket;

export default function ChatCard({ room, myData }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    socket = io("http://localhost:8080"); // Replace with your server URL

    socket.emit("join_room", room.roomId);
    console.log(room);

    // Listen for incoming messages
    socket.on("receive_message", ({ _id, message, sender, createdAt }) => {
      console.log("got message");
      const newMessage: Message = {
        _id: _id,
        roomId: room._id,
        sender: sender,
        message: message,
        createdAt: createdAt,
      };

      console.log("newMessage ", newMessage);

      setMessages((prevMessages) => [...(prevMessages || []), newMessage]);
    });

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
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };

    fetchMessagesByRoomId(room.roomId);

    setIsLoading(false);

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const createMessageByRoomId = async (
    roomId: string,
    message: string,
    senderId: string,
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
    if (input.trim() === "") return;

    const sentMessage = await createMessageByRoomId(
      room.roomId,
      message,
      myData._id,
    );

    console.log("Sent message:", sentMessage._id);

    // Emit the message to the server
    socket.emit("send_message", {
      _id: sentMessage._id,
      roomId: room.roomId,
      message: sentMessage.message,
      sender: sentMessage.sender,
      createdAt: sentMessage.createdAt,
    });

    console.log(messages);
    // setMessages((prevMessages) => [...prevMessages, sentMessage]);
  };

  const handleSendMessage = () => {
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      <div key={room._id} className="flex flex-row gap-2 border-b p-2">
        <div className="flex flex-row">
          <div>
            <div>{room.name}</div>
            <div
              className="cursor-pointer rounded-md bg-sky-300 p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              Chat
            </div>
          </div>
          <div className="m-6">
            {isOpen && (
              <div className="flex flex-col gap-2">
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="mx-auto mt-4 flex h-[40vh] max-w-lg flex-col rounded-2xl border bg-white shadow-md">
                    <div className="flex-1 space-y-2 overflow-y-auto p-4">
                      {messages?.map((msg, idx) => {
                        const isMe = msg.sender === myData._id;
                        return (
                          <div
                            key={idx}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs rounded-2xl px-4 py-2 ${
                                isMe
                                  ? "rounded-br-none bg-blue-500 text-white"
                                  : "rounded-bl-none bg-gray-200 text-black"
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 border-t p-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage
                        }
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 rounded-full border px-3 py-2 focus:outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                      >
                        ส่ง
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
