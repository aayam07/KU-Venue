import React, { useEffect, useState } from "react"
import "./SignUp.css"
import slotService from "../../Services/service.js"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { logo } from "../../Assets/index.js"

function SignUp({ authenticated, setAuthenticated, setLoginUser }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [users, setUsers] = useState([])

  const handleUsernameChange = e => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = e => {
    setPassword(e.target.value)
  }

  useEffect(() => {
    retrieveUsers()
  }, [])

  const retrieveUsers = () => {
    slotService
      .getAllUsers()
      .then(response => {
        console.log(response.data.users)
        setUsers(response.data.users)
      })
      .catch(error => {
        console.log(error)
      })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const foundUser = users.find(
      user => user.username === username && user.password === password
    )
    if (foundUser) {
      setAuthenticated(true)
      setLoginUser(foundUser.username)
      localStorage.setItem("loginUser", foundUser.username)
      toast.success(`Sign Up successful to ${foundUser.username} !`)
      navigate("/")
    } else {
      toast.error("Invalid username or password!")
    }
  }

  return (
    <div className="signup-container">
      <div className="wrapper">
      <img src={logo} alt="logo" width={100} height={100} className="signup-logo" />
        <h1>KU Hall Booking</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="username"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  )
}
export default SignUp
