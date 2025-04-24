import axios from "axios"

export default axios.create({
  baseURL: "http://localhost:8000",
  // baseURL: "https://event-hall.onrender.com/",
  headers: {
    "Content-type": "application/json",
  },
})
