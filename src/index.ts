import { io, server } from "server";
import { join, leave } from "game/pool";
import env from "env";
import { anyEventHandler } from "game/controller";

io.on("connection", async (socket) => {
  console.log(socket.decodedToken);
  console.log("a user connected");
  socket.onAny((event: string, ...args) =>
    anyEventHandler(socket.id, event, ...args)
  );
  socket.on("disconnecting", (reason) => {
    console.log(reason);
    leave(socket.id);
    anyEventHandler(socket.id, "disconnecting");
  });
  join(socket.id, socket.decodedToken.sub);
});

// APIサーバ起動
server.listen(env.appPort, () => {
  console.log("Express WebApi listening on port " + env.appPort);
});
