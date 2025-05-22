import axios from "axios"

export default axios.create({
  baseURL: "/api",
  // baseURL: "https://event-hall.onrender.com/",
  headers: {
    "Content-type": "application/json",
  },
})
