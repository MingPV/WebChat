/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Friend } from "@/types/friend";
import { User } from "@/types/user";
import { DarkThemeToggle } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatCard from "../components/chatCard";
import { Room } from "@/types/room";
import CreateGroup from "../components/groupCreate";
import { useSocket } from "../contexts/SocketContext";
import { IoIosArrowForward } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import Link from "next/link";
import Image from "next/image";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";

// import { withAuth } from "@/utils/withAuth";

function HomePage() {
  const [userData, setUserData] = useState<User>();
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [rooms, setRooms] = useState<Room[]>();
  const [tab, setTab] = useState<string>("chat");
  const [isLoading, setIsLoading] = useState(true);

  const { socket } = useSocket();

  // user who is using this webchat
  const [users, setUsers] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    console.log("socket", socket);
    if (!socket) {
      return;
    }

    if (userData) {
      socket.emit("set_username", userData.username);
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/me", {
          method: "GET",
          credentials: "include",
        });
        console.log("response");
        console.log(response);
        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to fetch username");
        }
        const { data } = await response.json();
        console.log("banana");
        console.log(data._id);
        const response2 = await fetch(
          `http://localhost:8080/friends/userId/${data._id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response2.ok) {
          console.log(response2);
          throw new Error("Failed to fetch friends");
        }
        const { data: data2 } = await response2.json();
        console.log(data2);

        const response3 = await fetch(
          `http://localhost:8080/rooms/userId/${data._id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response3.ok) {
          console.log(response3);
          throw new Error("Failed to fetch rooms");
        }
        const { data: data3 } = await response3.json();
        console.log(data3);

        setRooms(data3);
        setFriends(data2);
        setUserData(data);
        setIsLoading(false);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };

    socket.on("user-list", (usernames: string[]) => {
      setUsers(usernames);
      console.log("usernames", usernames);
    });

    fetchUserData();
  }, [socket, friends]);

  const handleSignOut = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/sign-out", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to sign out");
      }
      console.log("Sign-out successfully");
      router.push("/");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleAcceptFriend = async (
    friend_request_id: string,
    friend_id: string,
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8080/friends/${friend_request_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData?._id,
            friend_id: friend_id,
            status: "accepted",
            since: new Date().toISOString(),
            is_accepted: true,
          }),
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      console.log("Accept friend request successfully");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleRejectFriend = async (
    friend_request_id: string,
    friend_id: string,
  ) => {
    try {
      console.log(friend_id);
      const response = await fetch(
        `http://localhost:8080/friends/${friend_request_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData?._id,
            friend_id: friend_id,
          }),
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to reject friend request");
      }
      console.log("Reject friend request successfully");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleAddFriend = async () => {
    if (!userData || !friendName) {
      alert("no userData or friendName");
      return;
    }

    if (friendName == userData?.username) {
      console.log("You cannot add yourself as a friend");
      return;
    }

    try {
      const friend_response = await fetch(
        `http://localhost:8080/user/${friendName}`,
      );
      if (!friend_response.ok) {
        throw new Error("Failed to fetch friend data");
      }
      const friend_data = await friend_response.json();

      const response = await fetch("http://localhost:8080/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData?._id,
          friend_id: friend_data.data._id,
          user_name: userData?.username,
          friend_name: friend_data.data.username,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to add friend");
      }
      setFriendName("");
      console.log("Add friend successfully");
      console.log(response);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  type ChatCardInfo = {
    room: Room;
    myData: User;
    key: string;
  };
  const [chatCardInfo, setChatCardInfo] = useState<ChatCardInfo | null>(null);
  const [activeMobileView, setActiveMobileView] = useState<string>("list");
  const displayRoomName = (room: Room) => {
    const rawNameSplit = room.name.split(" ");
    const name = rawNameSplit[rawNameSplit.length - 1];
    return name;
  };

  if (!socket) return <p>🔄 Connecting to chat server...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-100 px-4 py-24 dark:bg-orange-950">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>

      <div className="flex w-[70vw] flex-row items-center justify-between gap-4 rounded-2xl p-1">
        {/* Navigation Tabs */}
        <ul className="flex flex-row gap-2 dark:text-white">
          <li>
            <button
              onClick={() => setTab("chat")}
              className={`rounded-md border-2 border-r-4 border-b-4 border-black px-6 py-2 font-bold transition-all duration-1000 ${
                tab === "chat"
                  ? "bg-orange-400 dark:bg-orange-600"
                  : "bg-orange-200 dark:bg-orange-400"
              }`}
            >
              Chat
            </button>
          </li>
          <li>
            <button
              onClick={() => setTab("friends")}
              className={`rounded-md border-2 border-r-4 border-b-4 border-black px-6 py-2 font-bold transition-all duration-1000 ${
                tab === "friends"
                  ? "bg-orange-400 dark:bg-orange-600"
                  : "bg-orange-200 dark:bg-orange-400"
              }`}
            >
              Friends
            </button>
          </li>
        </ul>

        {/* Logout Button */}
        <div className="flex justify-center rounded-lg border-2 border-r-4 border-b-4">
          <button
            onClick={handleSignOut}
            className="flex flex-row items-center gap-2 rounded-md bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
          >
            <span className="text-xl font-bold">
              <TbLogout />
            </span>
          </button>
        </div>
      </div>

      <div className="flex h-[60vh] w-[70vw] items-start justify-between rounded-2xl">
        {tab === "chat" && (
          <div className="flex h-[60vh] w-full flex-row justify-between gap-2 py-4">
            <div className="flex w-72 flex-col gap-2 rounded-lg border-2 border-r-4 border-b-4 bg-orange-200">
              <div className="text-md rounded-md rounded-b-none bg-orange-400 p-2 font-bold transition-all duration-1000 dark:text-white">
                Friends
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-2 text-sm">
                  <p
                    className={`skeleton mx-2 w-64 rounded-lg bg-orange-100 p-2`}
                  >
                    Loading...
                  </p>
                  <p
                    className={`skeleton mx-2 w-64 rounded-lg bg-orange-100 p-2`}
                  >
                    Loading...
                  </p>
                  <p
                    className={`skeleton mx-2 w-64 rounded-lg bg-orange-100 p-2`}
                  >
                    Loading...
                  </p>
                  <p
                    className={`skeleton mx-2 w-64 rounded-lg bg-orange-100 p-2`}
                  >
                    Loading...
                  </p>
                </div>
              ) : rooms ? (
                rooms.length > 0 ? (
                  rooms.map((room) =>
                    userData ? (
                      <button
                        key={room._id}
                        className={`mx-2 w-64 rounded-lg p-2 text-sm transition ${
                          chatCardInfo?.key === room._id
                            ? "bg-orange-300"
                            : "bg-orange-100"
                        } `}
                        onClick={() => {
                          setChatCardInfo({
                            room: room,
                            myData: userData!,
                            key: room._id,
                          });
                        }}
                      >
                        <div className="flex flex-row items-center justify-between">
                          <p>{displayRoomName(room)}</p>
                          <p className="font-bold">
                            <IoIosArrowForward />
                          </p>
                        </div>
                      </button>
                    ) : (
                      <p className="text-3xl">you have no userdata</p>
                    ),
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <p className="p-2 text-center">
                      you don't have any friends, please add friends by{" "}
                      <strong>
                        choose FRIENDS tab and fill their username
                      </strong>{" "}
                      or go to public chat here
                    </p>
                    <Link href="/publicChat">
                      <button className="rounded-lg bg-orange-300 px-4 py-2 transition ease-out hover:bg-orange-400">
                        To Public Chat
                      </button>
                    </Link>
                  </div>
                )
              ) : (
                <p>you have no rooms</p>
              )}
            </div>
            <div className="border-box h-full w-full rounded-lg border-2 border-r-4 border-b-4">
              {!chatCardInfo && (
                <div className="flex h-full flex-col items-center justify-center gap-10 rounded-lg bg-orange-200 dark:bg-orange-300">
                  <p className="text-xl font-bold">start conversation</p>
                  <Image
                    src="/image.png"
                    alt="start conver"
                    width={200}
                    height={200}
                    className="rounded-full bg-white opacity-60"
                  />
                </div>
              )}
              {chatCardInfo && (
                <div key={chatCardInfo.key} className="h-full w-full">
                  <ChatCard
                    room={chatCardInfo.room}
                    myData={chatCardInfo.myData}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "friends" && (
          <div className="flex h-[60vh] w-full flex-row justify-between gap-2 py-4 transition">
            <div className="grid w-full grid-cols-2 gap-4">
              <div className="col-span-1 rounded-lg">
                <div className="mb-4 h-full rounded-lg border-2 border-r-4 border-b-4">
                  {userData ? <CreateGroup myData={userData} /> : null}
                </div>
              </div>
              <div className="col-span-1 flex h-full flex-col">
                {/* Add Friend Section */}
                <div className="w-full flex-none flex-col justify-center rounded-lg border-2 border-r-4 border-b-4 bg-orange-200">
                  <div className="rounded-md rounded-b-none bg-orange-400 p-2 font-bold transition-all duration-1000 dark:text-white">
                    Add friend by username
                  </div>
                  <div className="flex w-full flex-row items-center justify-center p-4">
                    <div className="flex w-full flex-row justify-between gap-2 p-2">
                      <input
                        type="text"
                        className="w-full rounded-lg border-2 border-gray-300 bg-white p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={friendName}
                        placeholder="Enter friend's username..."
                        onChange={(e) => setFriendName(e.target.value)}
                      />
                      <div
                        className="rounded-lg bg-orange-400 px-4 py-2 text-white transition duration-1000 hover:bg-orange-600 dark:bg-orange-500"
                        onClick={handleAddFriend}
                      >
                        Add
                      </div>
                    </div>
                  </div>
                </div>

                {/* Friend Requests List (takes remaining height) */}
                <div className="mt-4 flex grow flex-col overflow-auto rounded-lg border-2 border-r-4 border-b-4 bg-orange-200">
                  <p className="mb-2 bg-orange-400 p-2 font-bold transition-all duration-1000 dark:text-white">
                    Friend Requests
                  </p>
                  {friends.map(
                    (friend) =>
                      friend.status == "waiting for accept" && (
                        <div
                          key={friend._id}
                          className="m-2 mb-2 flex flex-row items-center justify-between gap-2 rounded-md bg-orange-100 px-4 py-2 transition-all duration-1000 dark:bg-orange-300"
                        >
                          <div className="flex-1">{friend.friend_name}</div>
                          <div
                            className="flex cursor-pointer items-center justify-center rounded-full text-center text-2xl text-lime-500"
                            onClick={() =>
                              handleAcceptFriend(friend._id, friend.friend_id)
                            }
                          >
                            <FaCircleCheck />
                          </div>
                          <div
                            className="flex cursor-pointer items-center justify-center rounded-full text-center text-2xl text-red-500"
                            onClick={() =>
                              handleRejectFriend(friend._id, friend.friend_id)
                            }
                          >
                            <FaCircleXmark />
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// export default withAuth(HomePage);
export default HomePage;
