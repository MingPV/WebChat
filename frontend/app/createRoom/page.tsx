// const createRoom = async () => {
//   const response = await fetch("http://localhost:8080/api/rooms", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       roomId: "room123",
//       name: "Test Room",
//       groupId: null, // Optional
//       isGroup: false,
//       participants: ["user1", "user2"], // Replace with actual user IDs
//       createdBy: "user1", // Replace with the creator's user ID
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error("Error creating room:", errorData);
//     return;
//   }

//   const data = await response.json();
//   console.log("Room created successfully:", data);
// };
