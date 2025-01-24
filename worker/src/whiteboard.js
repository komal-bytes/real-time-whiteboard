export class Whiteboard {
  constructor(state, env) {
    this.state = state; // Durable Object state
    this.env = env; // Environment bindings

    // A map of connected WebSocket clients
    this.clients = new Map();
  }

  async fetch(request) {
    const { method, headers } = request;

    // Handle WebSocket upgrade requests
    if (method === "GET" && headers.get("upgrade") === "websocket") {
      const [clientSocket, serverSocket] = new WebSocketPair();

      // Accept the server WebSocket connection
      serverSocket.accept();

      // Handle this client
      this.handleWebSocket(serverSocket);

      // Return a response that accepts the WebSocket connection
      return new Response(null, { status: 101, webSocket: clientSocket });
    }

    // Handle unsupported HTTP methods
    return new Response("Method Not Allowed", { status: 405 });
  }

  /**
   * Handle incoming WebSocket connections.
   * @param {WebSocket} socket The server-side WebSocket connection
   */
  handleWebSocket(socket) {
    // Generate a unique ID for the client
    const clientId = crypto.randomUUID();

    // Add the client to the connections map
    this.clients.set(clientId, socket);

    // Listen for messages from the client
    socket.addEventListener("message", (event) => {
      this.handleMessage(event.data, clientId);
    });

    // Handle WebSocket close event
    socket.addEventListener("close", () => {
      this.clients.delete(clientId);
    });

    // Handle WebSocket errors
    socket.addEventListener("error", () => {
      this.clients.delete(clientId);
    });
  }

  /**
   * Handle incoming messages from a client.
   * @param {string} data The message sent by the client
   * @param {string} clientId The ID of the client sending the message
   */
  async handleMessage(data, clientId) {
    try {
      const { type, boardId, update } = JSON.parse(data);
      console.log(type, boardId)
      console.log("heree mannnn")
      if (type === "updateBoard") {
        // Fetch the board from KV store
        const boardData = await this.env.WHITEBOARD_KV.get(boardId);
        if (!boardData) {
          throw new Error(`Board with ID ${boardId} not found`);
        }

        const board = JSON.parse(boardData);

        // Update the board's elements
        board.elements.push(...update);

        // Save the updated board back to KV store
        await this.env.WHITEBOARD_KV.put(boardId, JSON.stringify(board));

        // Broadcast the update to other clients
        this.broadcastUpdate({ type, boardId, update }, clientId);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  /**
   * Broadcast updates to all connected clients except the sender.
   * @param {Object} update The update to broadcast
   * @param {string} senderId The ID of the sender
   */
  broadcastUpdate(update, senderId) {
    console.log("band", senderId, this.clients)
    for (const [clientId, socket] of this.clients) {
      // Don't send the update back to the sender
      console.log(clientId, socket, "choosing client")
      if (clientId !== senderId) {
        try {
          socket.send(JSON.stringify(update));
        } catch (error) {
          console.error("Error broadcasting update:", error);
          this.clients.delete(clientId);
        }
      }
    }
  }
}
