"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { DarkThemeToggle } from "flowbite-react";
import { Message } from "@/types/message";

let socket: Socket;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    socket = io("http://localhost:8080"); // Replace with your server URL

    socket.emit("join_room", "publicChat");

    // Listen for incoming messages
    socket.on("receive_message", ({ message, sender, createdAt }) => {
      console.log("got message");
      const newMessage: Message = {
        id: "message.id",
        roomId: "message.roomId",
        sender: sender,
        message: message,
        createdAt: createdAt,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
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

    fetchMessagesByRoomId("กลุ่มเพื่อนปี 34-67f2c99737dfc9a82d5d13b5");

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
      "publicChat",
      message,
      "67f2811591bc62ef817ffb06",
    );

    console.log("Sent message:", sentMessage);

    // Emit the message to the server
    socket.emit("send_message", {
      roomId: "publicChat",
      message: sentMessage.message,
      sender: sentMessage.sender,
      createdAt: sentMessage.createdAt,
    });
    // setMessages((prevMessages) => [...prevMessages, sentMessage]);
  };

  const handleSendMessage = () => {
    sendMessage(input);
    setInput("");
  };

  if (isLoading) {
    return (
      <>
        <div>Loading</div>
      </>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
          Room: {"PulbicChat"}
        </h1>
        <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          {messages.map((message, index) => (
            <div
              key={index}
              className="mb-2 text-sm text-gray-900 dark:text-white"
            >
              {message.message}
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
        </div>
      </div>
    </main>
  );
}
