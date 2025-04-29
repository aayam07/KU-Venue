import React, { useState, useEffect } from "react";
import "./About.css";
import { Link, useNavigate, Routes, Route } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { IoReorderThreeOutline } from "react-icons/io5";
import { BiNotepad } from "react-icons/bi";
import { SlCalender } from "react-icons/sl";
import { PiCalendarCheckFill } from "react-icons/pi";
import { IoMdAdd } from "react-icons/io";
import CalendarInterface from "../Calendar/Calendar-Interface";
import SignUp from "../SignUp/SignUp";
import { ieee, iedc, nss, arc, logo, nav_log } from "../../Assets";
import ProfilePage from "../ProfilePage/ProfilePage";
import slotService from "../../Services/service";
import { RiAdminLine } from "react-icons/ri";
import {
  arcProfile,
  ieeeProfile,
  iedcProfile,
  nssProfile,
} from "../../Constants/constants";
import Dropdown from "react-bootstrap/Dropdown";
import Admin from "../Admin/Admin";
import ForumAdmin from "../Admin/ForumAdmin";
import Welcome from "../Welcome/Welcome.jsx";
import { LuUser } from "react-icons/lu";
import { RiHome2Line } from "react-icons/ri";
import HallDetails from "../HallDetails/HallDetails";
import {
  MdAudiotrack,
  MdEventSeat,
  MdBusinessCenter,
  MdComputer,
} from "react-icons/md";

const LOCAL_STORAGE_KEY = "loginUser";

function About() {
  const navigate = useNavigate();
  const [showNav, setShowNav] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const [authenticated, setAuthenticated] = useState(false);
  const [loginuser, setLoginUser] = useState(null);

  const [slots, setSlots] = useState([]);
  const [pendingSlots, setPendingSlots] = useState([]);
  const [approvedSlots, setApprovedSlots] = useState([]);
  const [rejectedSlots, setRejectedSlots] = useState([]);

  const [iedcEvents, setIedcEvents] = useState([]);
  const [ieeeEvents, setIeeeEvents] = useState([]);
  const [nssEvents, setnssEvents] = useState([]);
  const [arcEvents, setarcEvents] = useState([]);

  useEffect(() => {
    retrieveSlots();
  }, []);

  const retrieveSlots = () => {
    slotService
      .getAllSlots()
      .then((response) => {
        const slotsData = response.data.slots;
        setSlots(slotsData);

        const pendingSlotsData = response.data.slots.filter(
          (slot) => slot.status === "pending"
        );
        setPendingSlots(pendingSlotsData);
        const rejectedSlotsData = response.data.slots.filter(
          (slot) => slot.status === "rejected"
        );
        setRejectedSlots(rejectedSlotsData);

        const approvedSlots = response.data.slots.filter(
          (slot) => slot.status === "approved"
        );
        const iedcEventsData = approvedSlots.filter(
          (slot) => slot.username === "iedc"
        );
        const ieeeEventsData = approvedSlots.filter(
          (slot) => slot.username === "ieee"
        );
        const nssEventsData = approvedSlots.filter(
          (slot) => slot.username === "nss"
        );
        const arcEventsData = approvedSlots.filter(
          (slot) => slot.username === "arc"
        );
        setIedcEvents(iedcEventsData);
        setIeeeEvents(ieeeEventsData);
        setnssEvents(nssEventsData);
        setarcEvents(arcEventsData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleNavbar = () => {
    setShowNav(!showNav);
  };

  const closeNavbar = () => {
    setShowNav(false);
  };

  const setActiveLink = (index) => {
    const links = document.querySelectorAll(".nav_link");
    links.forEach((link, i) => {
      if (i === index) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUser) {
      setLoginUser(storedUser);
      setAuthenticated(true);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setLoginUser(null);
    setAuthenticated(false);
    navigate("/");
  };

  return (
    <div id="body-pd">
      <header
        className="header"
        id="header"
        style={{
          width: "100%",
          height: "60px",
          position: "fixed",
          top: "0",
          left: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          backgroundColor: "white",
          zIndex: "100",
          transition: "0.5s",
          boxShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="header_toggle">
          <IoReorderThreeOutline
            style={{
              fontSize: "2rem",
              cursor: "pointer",
              color: "#000",
            }}
            onClick={toggleNavbar}
          />
        </div>
        {loginuser ? (
          <Dropdown
            style={{
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <Dropdown.Toggle
              variant="success"
              id="dropdown-basic"
              style={{
                background: "transparent",
                color: "black",
                border: "none",
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LuUser style={{ marginLeft: "5px" }} />
              <span
                className="fw-bold"
                style={{ textTransform: "uppercase", marginLeft: "5px" }}
              >
                {loginuser}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {loginuser &&
                (loginuser === "admin" ? (
                  <>
                    <Link to={"/admin"}>
                      <Dropdown.Item href="#/action-1">Dashboard</Dropdown.Item>
                    </Link>
                    <Link to={"/forum_admin"}>
                      <Dropdown.Item href="#/action-2">History</Dropdown.Item>
                    </Link>
                  </>
                ) : (
                  <Link to={"/forum_admin"}>
                    <Dropdown.Item href="#/action-1">Dashboard</Dropdown.Item>
                  </Link>
                ))}
              <Dropdown.Item href="#/action-3" onClick={handleSignOut}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link
            to={"/sign"}
            style={{
              width: "75px",
              height: "40px",
              border: "1px solid gray",
              borderRadius: "8px",
              background: "transparent",
              color: "black",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Sign in
          </Link>
        )}
      </header>
      <div
        className={`l-navbar ${showNav ? "show" : ""}`}
        id="nav-bar"
        onMouseEnter={toggleNavbar}
        onMouseLeave={closeNavbar} // Call closeNavbar when the mouse leaves
      >
        <nav className="nav">
          <div>
            <Link to={"/"} className="nav_link">
              <img
                src={nav_log}
                width={30}
                height={30}
                style={{ marginLeft: "-7px" }}
              />
              <span className="nav_logo-name">KU Venue</span>
            </Link>
            <div className="nav_list">
              <Link
                to={"/"}
                className="nav_link"
                onClick={() => setActiveLink(1)} // Pass index or identifier
              >
                <RiHome2Line />

                <span className="nav_name">Home</span>
              </Link>
              <Link
                to={"/calender"}
                className="nav_link"
                onClick={() => setActiveLink(2)}
              >
                <SlCalender />
                <span className="nav_name">Calendar</span>
              </Link>
              {showNav ? (
                <p className="at-center desc-nav">---Available Halls---</p>
              ) : (
                <p className="desc-nav">---</p>
              )}
              <Link
                to={"/multipurpose"}
                className="nav_link"
                onClick={() => setActiveLink(3)}
              >
                <MdEventSeat />
                <span className="nav_name">Multipurpose Hall</span>
              </Link>
              <Link
                to={"/senate"}
                className="nav_link"
                onClick={() => setActiveLink(4)}
              >
                <MdBusinessCenter />
                <span className="nav_name">Senate Hall</span>
              </Link>
              <Link
                to={"/mini-auditorium"}
                className="nav_link"
                onClick={() => setActiveLink(5)}
              >
                <MdAudiotrack />
                <span className="nav_name">Mini Auditorium</span>
              </Link>
              <Link
                to={"/ciku"}
                className="nav_link"
                onClick={() => setActiveLink(6)}
              >
                <MdBusinessCenter />
                <span className="nav_name">CIKU Hall</span>
              </Link>
              <Link
                to={"/ntic"}
                className="nav_link"
                onClick={() => setActiveLink(7)}
              >
                <MdComputer />
                <span className="nav_name">NTIC</span>
              </Link>
              <Link
                to={"/cv-raman"}
                className="nav_link"
                onClick={() => setActiveLink(8)}
              >
                <MdAudiotrack />
                <span className="nav_name">CV Raman</span>
              </Link>
            </div>
          </div>
          {loginuser ? (
            <a href="#" className="nav_link" onClick={handleSignOut}>
              <AiOutlineLogout />
              <span className="nav_name">SignOut</span>
            </a>
          ) : (
            <Link to={"/sign"} className="nav_link">
              <AiOutlineUser />
              <span className="nav_name">SignUp</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="calendar-body">
        <Routes>
          <Route
            path="/"
            element={
              <Welcome
                events={slots.filter((slot) => slot.status === "approved")}
              />
            }
          />
          <Route
            exact
            path="/calender"
            element={<CalendarInterface loginuser={loginuser} />}
          />
          <Route path="/multipurpose" element={<HallDetails />} />
          <Route path="/senate" element={<HallDetails />} />
          <Route path="/mini-auditorium" element={<HallDetails />} />
          <Route path="/ciku" element={<HallDetails />} />
          <Route path="/ntic" element={<HallDetails />} />
          <Route path="/cv-raman" element={<HallDetails />} />
          <Route
            path="/admin"
            element={
              <Admin
                retrieveSlots={retrieveSlots}
                pendingSlots={pendingSlots}
              />
            }
          />
          <Route
            path="/forum_admin"
            element={
              <ForumAdmin
                retrieveSlots={retrieveSlots}
                slots={slots}
                loginuser={loginuser}
              />
            }
          />
          <Route
            path="/sign"
            element={
              <SignUp
                authenticated={authenticated}
                setAuthenticated={setAuthenticated}
                setLoginUser={setLoginUser}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default About;
