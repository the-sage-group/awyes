const ws = new WebSocket("ws://localhost:3001");

ws.onopen = () => {
  console.log("ws opened on browser");
  ws.send("hello world");
};

ws.onmessage = (message) => {
  console.log(`message received`, message.data);
};
