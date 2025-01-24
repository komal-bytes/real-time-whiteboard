import { ref, onUnmounted } from "vue";

export function useWebSocket(boardId) {
  const socket = ref(null);
  const isConnected = ref(false);
  const messages = ref([]);

  const connect = () => {
    const url = `ws://localhost:8787/board/${boardId}`;
    console.log(url, "urlllllll")
    socket.value = new WebSocket(url);
    console.log(socket.value, "urllllll")

    socket.value.onopen = () => {
      console.log("WebSocket connection opened");
      isConnected.value = true;
    };

    socket.value.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received:", message);
      messages.value.push(message);
    };

    socket.value.onclose = () => {
      console.log("WebSocket connection closed");
      isConnected.value = false;
    };

    socket.value.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const sendMessage = async(data) => {
    console.count("send");
    if (socket.value && isConnected.value) {
      socket.value.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    sendMessage,
    disconnect,
    isConnected,
    messages,
  };
}
