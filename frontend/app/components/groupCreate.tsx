import { Friend } from "@/types/friend";
import { User } from "@/types/user";
import { useEffect, useState } from "react";

interface CreateGroupProps {
  myData: User;
}

export default function CreateGroup({ myData }: CreateGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [members, setMembers] = useState<string[]>([myData.username]);
  const [members_id, setMembers_id] = useState<string[]>([myData._id]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      console.log(myData?._id);
      try {
        const response = await fetch(
          `http://localhost:8080/friends/userId/${myData?._id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const { data } = await response.json();
        setFriends(data);
        console.log("friend", data);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };
    fetchFriends();
  }, []);

  const addMember = () => {
    if (memberName.trim()) {
      setMembers([...members, memberName.trim()]);
      setMembers_id([...members_id, memberId]);
      setMemberName("");
      setMemberId("");
    }
  };

  const createGroup = async () => {
    if (!groupName || members.length === 0) {
      alert("ใส่ชื่อกลุ่มและสมาชิกอย่างน้อย 1 คนก่อนนะ!");
      return;
    }

    const groupData = {
      groupName,
      members,
    };

    console.log("Group Created:", groupData);
    console.log("Members ID:", members_id);
    // TODO: ส่ง groupData ไปยัง backend หรือ socket

    const createdGroup = await fetch("http://localhost:8080/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: groupName,
        isGroup: true,
        participants: members_id,
        createdBy: myData?._id,
      }),
      credentials: "include",
    });
    if (!createdGroup.ok) {
      throw new Error("Failed to create group");
    }
    const data = await createdGroup.json();
    console.log("Created group:", data);

    // Reset the form
    setGroupName("");
    setMembers([]);
    setMemberName("");
  };

  return (
    <div className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-md">
      <h2 className="text-center text-xl font-bold">Create new group</h2>

      <div>
        <label className="mb-1 block text-sm font-medium">group name</label>
        <input
          type="text"
          className="w-full rounded-lg border p-2"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="ex. Raider group"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* <input
          type="text"
          className="flex-1 rounded-lg border p-2"
          placeholder="ชื่อสมาชิก เช่น มิง"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
        />
        <button
          onClick={addMember}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          เพิ่ม
        </button> */}
        <select
          className="flex-1 rounded-lg border p-2"
          value={memberName}
          onChange={(e) => {
            setMemberName(e.target.value);
            setMemberId(
              e.target.options[e.target.selectedIndex].dataset.id || "",
            );
          }}
        >
          <option value="">select friend</option>
          {friends.map((friend) => (
            <option
              key={friend._id}
              value={friend.friend_name}
              data-id={friend.friend_id}
            >
              {friend.friend_name}
            </option>
          ))}
        </select>
        <button
          onClick={addMember}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          add
        </button>
      </div>

      <div>
        <h3 className="mb-2 font-medium">members:</h3>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">no member</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {members.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={createGroup}
        className="w-full rounded-lg bg-green-500 py-2 text-white hover:bg-green-600"
      >
        Create group
      </button>
    </div>
  );
}
