// express will run our server
import express from "express";
import { Server } from "socket.io";
import helmet from "helmet";

import ConcurrentRooms from "./concurrent/ConcurrentRooms.js";

const app = express();
app.use(helmet());

// decide on which port we will use
const port = process.env.PORT || 8087;
// players per room
const PPRM = process.env.PLAYERS_IN_ROOM || 2;
//allowed origins
const AORG = process.env.ALLOWED_ORIGINS || "*";

//Server
console.log("LISTENING ", port);
const server = app.listen(port);
const io = new Server(server, {
  cors: {
    origin: AORG,
    methods: ["GET", "HEAD"],
  },
});

const allRooms = new ConcurrentRooms();

setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`using: ${Math.round(used * 100) / 100} MB`);
}, 5000);

//todo: fetch scene if exists from database
// EL NAMESPACE LO GENERA EL TUCHER

const regex =
  /^\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const namespace = io.of(regex);

namespace.on("connection", (socket) => {
  console.log(`SKT: ${socket.id}, NSP: ${socket.nsp.name}`);

  const room = allRooms.findOrAllocate(socket.nsp.name)

  /** Allocate this player in the room as long as there's enought space */
  if (room.connections().length < PPRM) {
    // update this player with the players that are already in.
    socket.emit("players:connected", room.playersPerTeam());

    //when el player selecciona un name
    socket.on("player:spawn", (name) => {
      console.log("recv_player_spawned", socket.id, name);
      //add player's data to this namespace room.
      room.add(socket.id, { name, score: 0 });
      //broadcast to ALL that a new player has joined
      socket.nsp.emit("player:join", room.playersPerTeam());
    });

    //when el player hace un move
    socket.on("player:moves", (nextData) => {
      socket.broadcast.emit("player:move", nextData);
      room.update(socket.id, nextData);
      socket.nsp.emit("players:state", room.playersPerTeam());
    });

    //when el player se disconecta
    socket.on("disconnect", () => {
      console.log(`left: ${socket.id}`);
      //notify all that the player has gone
      room.delete(socket.id);
      // notify this namespace
      socket.nsp.emit("player:left", room.playersPerTeam());
    });
  } else {
    socket.disconnect();
  }
});
