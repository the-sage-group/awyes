import axios from "axios";

const http = axios.create({ baseURL: "http://localhost:3000/" });
const ws = new WebSocket("ws://localhost:3001");

ws.onopen = () => {
  console.log("ws opened on browser");
  ws.send("hello world");
};

ws.onmessage = (message) => {
  console.log(`message received`, message.data);
};

export { http, ws };
