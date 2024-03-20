import Room from "../multiplayer/Room.js";

export default function ConcurrentRooms() {
  const rooms = new Set();

  /** @returns {Room} */
  this.findOrAllocate = (roomId) => {
    const foundRoom = Array.from(rooms).find((room) => room.$id() === roomId);
    if (foundRoom) {
      return foundRoom;
    } else {
      const newRoom = new Room(roomId);
      rooms.add(newRoom);
      return newRoom;
    }
  };

  this.getAll = () => {
    return Array.from(rooms);
  };
}
