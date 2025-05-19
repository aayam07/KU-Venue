import React, { useState, useEffect } from "react";
import slotService from "../../Services/service.js";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "./index.css";
import { toast } from "react-toastify";
import "react-big-calendar/lib/css/react-big-calendar.css";
import cec from "../../Assets/cec.png";
import { ieee, iedc, nss, arc } from "../../Assets";
const localizer = momentLocalizer(moment);

const CalendarInterface = ({ loginuser }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [forumData, setForumData] = useState();
  const [selectedStartDate, setselectedStartDate] = useState(null);
  const [selectEvent, setSelectEvent] = useState(null);
  const [eventInfo, setEventInfo] = useState({
    eventTitle: "",
    venue: "",
    startTime: "",
    endTime: "",
    responsiblePerson: "",
    contactNumber: "",
    canteenRemarks: "",
    requirements: {
      ac: false,
      soundSystem: false,
      projector: false
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    retrieveSlots();
  }, []);

  const retrieveSlots = () => {
    slotService
      .getAllSlots()
      .then((response) => {
        const eventsData = response.data.slots
          .filter((slot) => slot.status === "approved")
          .map((slot) => ({
            ...slot,
            start: moment(slot.start).toDate(),
            end: moment(slot.end).toDate(),
          }));
        setEvents(eventsData);
      })
      .catch(console.error);
  };
  const handleSelectSlot = (slotInfo) => {
    if (!loginuser) {
      toast.error("Only logged in users can add events.");
      navigate("/sign");
      return;
    }
    const selectedDate = new Date(slotInfo.start);
    const today = new Date();
    if (selectedDate <= today) {
      toast.error("You cannot add events to past dates.");
      return;
    }
    setShowModal(true);
    setselectedStartDate(slotInfo.start);
    setSelectEvent(null);
  };

  const handleSelectedEvent = (event) => {
    setShowModal(true);
    setSelectEvent(event);
    setEventInfo({
      eventTitle: event.title,
      venue: event.venue,
      startTime: moment(event.start).format("HH:mm"),
      endTime: moment(event.end).format("HH:mm"),
      responsiblePerson: event.responsiblePerson || "",
      contactNumber: event.contactNumber || "",
      canteenRemarks: event.canteenRemarks || "",
    });
  };
  const saveEvent = async () => {
    if (isSubmitting) {
      return;
    }

    // Check if all required fields are filled
    if (
      !eventInfo.eventTitle ||
      !eventInfo.venue ||
      !eventInfo.startTime ||
      !eventInfo.endTime ||
      !eventInfo.responsiblePerson ||
      !eventInfo.contactNumber
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate phone number length
    if (eventInfo.contactNumber.length !== 10) {
      toast.error("Contact number must be 10 digits long");
      return;
    }

    // Validate phone number contains only digits
    if (!/^\d+$/.test(eventInfo.contactNumber)) {
      toast.error("Contact number must contain only digits");
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = moment(selectedStartDate)
        .set({
          hour: parseInt(eventInfo.startTime.split(":")[0]),
          minute: parseInt(eventInfo.startTime.split(":")[1]),
        })
        .toDate();
      const endDateTime = moment(selectedStartDate)
        .set({
          hour: parseInt(eventInfo.endTime.split(":")[0]),
          minute: parseInt(eventInfo.endTime.split(":")[1]),
        })
        .toDate();

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        toast.error("End time must be after start time");
        setIsSubmitting(false);
        return;
      }

      // Check for clash with approved events only
      const hasClash = events.some((event) => {
        // Only check against approved events
        if (event.status !== "approved") return false;

        const eventStartTime = moment(event.start);
        const eventEndTime = moment(event.end);
        return (
          event.venue === eventInfo.venue &&
          ((eventStartTime.isBefore(startDateTime) &&
            eventEndTime.isAfter(startDateTime)) ||
            (eventStartTime.isBefore(endDateTime) &&
              eventEndTime.isAfter(endDateTime)) ||
            (eventStartTime.isSameOrAfter(startDateTime) &&
              eventEndTime.isSameOrBefore(endDateTime)))
        );
      });

      if (hasClash) {
        toast.error(
          "There is already an approved event in this hall at the same time. Your request will be reviewed by the admin."
        );
        // Don't return here, allow the request to be sent
      }

      if (selectEvent) {
        const updatedEvent = {
          ...selectEvent,
          title: eventInfo.eventTitle,
          venue: eventInfo.venue,
          start: startDateTime,
          end: endDateTime,
          responsiblePerson: eventInfo.responsiblePerson,
          contactNumber: eventInfo.contactNumber,
          canteenRemarks: eventInfo.canteenRemarks,
          requirements: eventInfo.requirements
        };
        const updatedEvents = events.map((event) =>
          event === selectEvent ? updatedEvent : event
        );
        setEvents(updatedEvents);
      } else {
        const newEvent = {
          username: loginuser,
          eventTitle: eventInfo.eventTitle,
          startDate: startDateTime,
          endDate: endDateTime,
          venue: eventInfo.venue,
          responsiblePerson: eventInfo.responsiblePerson,
          contactNumber: eventInfo.contactNumber,
          canteenRemarks: eventInfo.canteenRemarks,
          requirements: {
            ac: eventInfo.requirements.ac,
            soundSystem: eventInfo.requirements.soundSystem,
            projector: eventInfo.requirements.projector
          }
        };

        await slotService.createSlot(newEvent);
        toast.success("Event Request has been successfully sent to Principal!");
        await retrieveSlots();
      }

      // Reset form and close modal
      setShowModal(false);
      setEventInfo({
        eventTitle: "",
        venue: "",
        startTime: "",
        endTime: "",
        responsiblePerson: "",
        contactNumber: "",
        canteenRemarks: "",
        requirements: {
          ac: false,
          soundSystem: false,
          projector: false
        }
      });

      // Navigate after everything is done
      navigate("/forum_admin");
    } catch (error) {
      console.error(error);
      toast.error("Error creating event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async () => {
    if (selectEvent) {
      const confirmation = window.confirm(
        "Are you sure you want to delete this event?"
      );
      if (confirmation) {
        try {
          await slotService.deleteSlot(selectEvent._id);
          setEvents(events.filter((event) => event !== selectEvent));
          toast.success("Event has been deleted successfully!");
          setShowModal(false);
          setEventInfo({
            eventTitle: "",
            venue: "",
            startTime: "",
            endTime: "",
            canteenRemarks: "",
          });
        } catch (error) {
          console.log(error);
          toast.error("Error occurred while deleting the event.");
        }
      }
    }
  };
  const components = {
    month: {
      event: (props) => {
        const forum = props?.event?.username;
        let eventIcon;
        switch (forum) {
          case "ieee":
            eventIcon = ieee;
            break;
          case "nss":
            eventIcon = nss;
            break;
          case "iedc":
            eventIcon = iedc;
            break;
          default:
            eventIcon = cec;
        }
        return (
          <div className="eventContainer">
            <div className={`eventType1 ${forum}`}></div>
            <div className={`eventType2 ${forum}`}>
              <img
                style={{ marginRight: "5px" }}
                src={eventIcon}
                alt=""
                width={20}
                height={20}
              />
              {props.title}
            </div>
          </div>
        );
      },
    },

    day: {
      event: (props) => {
        const forum = props?.event?.username;
        let eventIcon;
        switch (forum) {
          case "ieee":
            eventIcon = ieee;
            break;
          case "nss":
            eventIcon = nss;
            break;
          case "iedc":
            eventIcon = iedc;
            break;
          default:
            eventIcon = cec;
        }
        return (
          <div className="eventContainer">
            <div
              className={`eventType1 ${forum}`}
              style={{ width: "1%" }}
            ></div>
            <div className={`eventType2 ${forum}`} style={{ width: "99%" }}>
              <img
                style={{ marginRight: "5px" }}
                src={eventIcon}
                alt=""
                width={20}
                height={20}
              />
              {props.title}- {forum}- {props.event.venue}
            </div>
          </div>
        );
      },
    },
  };
  return (
    <div style={{ 
      height: "700px",
      paddingTop: "80px",
      marginTop: "20px"
    }}>
      <h1 style={{ 
        textAlign: "center", 
        marginBottom: "30px", 
        color: "var(--first-color)",
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        fontWeight: "600",
        fontFamily: "Poppins, sans-serif",
        padding: "0 1rem",
        marginTop: "0"
      }}>
        Choose a date to book a venue
      </h1>
      <Calendar
        localizer={localizer}
        components={components}
        views={["month", "day", "agenda"]}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ margin: "50px" }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectedEvent}
        max={moment("2023-03-18T19:00:00").toDate()}
        min={moment("2023-03-18T09:00:00").toDate()}
      />
      {showModal &&
        (loginuser ? (
          !selectEvent ? (
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Event</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowModal(false);
                        setEventInfo({
                          eventTitle: "",
                          venue: "",
                          startTime: "",
                          endTime: "",
                          canteenRemarks: "",
                        });
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <label htmlFor="eventTitle" className="form-label">
                      Event Title:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="eventTitle"
                      value={eventInfo.eventTitle}
                      required
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          eventTitle: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="venue" className="form-label">
                      Venue:
                    </label>
                    <select
                      className="form-select"
                      id="venue"
                      value={eventInfo.venue}
                      onChange={(e) =>
                        setEventInfo({ ...eventInfo, venue: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Venue</option>
                      <option value="CV Raman Auditorium">
                        CV Raman Auditorium
                      </option>
                      <option value="Multipurpose Hall">
                        Multipurpose Hall
                      </option>
                      <option value="Senate Hall">Senate Hall</option>
                      <option value="NTIC Hall">NTIC Hall</option>
                      <option value="Mini Auditorium">Mini Auditorium</option>
                      <option value="CIKU Hall">CIKU Hall</option>
                    </select>
                    <label htmlFor="startTime" className="form-label">
                      Start Time:
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="startTime"
                      required
                      value={eventInfo.startTime}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          startTime: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="endTime" className="form-label">
                      End Time:
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="endTime"
                      required
                      value={eventInfo.endTime}
                      onChange={(e) =>
                        setEventInfo({ ...eventInfo, endTime: e.target.value })
                      }
                    />
                    <label htmlFor="responsiblePerson" className="form-label">
                      Responsible Person:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="responsiblePerson"
                      required
                      value={eventInfo.responsiblePerson}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          responsiblePerson: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="contactNumber" className="form-label">
                      Contact Number:
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="contactNumber"
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      title="Please enter a 10-digit phone number"
                      value={eventInfo.contactNumber}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          contactNumber: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="canteenRemarks" className="form-label">
                      Canteen Remarks:
                    </label>
                    <textarea
                      className="form-control"
                      id="canteenRemarks"
                      rows="4"
                      placeholder="Enter any special instructions or requirements for the canteen"
                      value={eventInfo.canteenRemarks}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          canteenRemarks: e.target.value,
                        })
                      }
                    />
                    
                    <div className="mt-4">
                      <label className="form-label fw-bold">Your Requirements:</label>
                      <div className="d-flex flex-column gap-2">
                        {eventInfo.venue !== "Multipurpose Hall" && (
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="ac"
                              checked={eventInfo.requirements.ac}
                              onChange={(e) =>
                                setEventInfo({
                                  ...eventInfo,
                                  requirements: {
                                    ...eventInfo.requirements,
                                    ac: e.target.checked,
                                  },
                                })
                              }
                            />
                            <label className="form-check-label" htmlFor="ac">
                              AC
                            </label>
                          </div>
                        )}
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="soundSystem"
                            checked={eventInfo.requirements.soundSystem}
                            onChange={(e) =>
                              setEventInfo({
                                ...eventInfo,
                                requirements: {
                                  ...eventInfo.requirements,
                                  soundSystem: e.target.checked,
                                },
                              })
                            }
                          />
                          <label className="form-check-label" htmlFor="soundSystem">
                            Sound System
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="projector"
                            checked={eventInfo.requirements.projector}
                            onChange={(e) =>
                              setEventInfo({
                                ...eventInfo,
                                requirements: {
                                  ...eventInfo.requirements,
                                  projector: e.target.checked,
                                },
                              })
                            }
                          />
                          <label className="form-check-label" htmlFor="projector">
                            Projector
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveEvent}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : loginuser === "admin" ? (
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Event</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowModal(false);
                        setEventInfo({
                          eventTitle: "",
                          venue: "",
                          startTime: "",
                          endTime: "",
                          responsiblePerson: "",
                          contactNumber: "",
                          canteenRemarks: "",
                        });
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <label htmlFor="eventTitle" className="form-label">
                      Event Title:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="eventTitle"
                      value={eventInfo.eventTitle}
                      required
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          eventTitle: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="venue" className="form-label">
                      Venue:
                    </label>
                    <select
                      className="form-select"
                      id="venue"
                      value={eventInfo.venue}
                      onChange={(e) =>
                        setEventInfo({ ...eventInfo, venue: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Venue</option>
                      <option value="CV Raman Auditorium">
                        CV Raman Auditorium
                      </option>
                      <option value="Multipurpose Hall">
                        Multipurpose Hall
                      </option>
                      <option value="Senate Hall">Senate Hall</option>
                      <option value="NTIC Hall">NTIC Hall</option>
                      <option value="Mini Auditorium">Mini Auditorium</option>
                      <option value="CIKU Hall">CIKU Hall</option>
                    </select>
                    <label htmlFor="startTime" className="form-label">
                      Start Time:
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="startTime"
                      required
                      value={eventInfo.startTime}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          startTime: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="endTime" className="form-label">
                      End Time:
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="endTime"
                      required
                      value={eventInfo.endTime}
                      onChange={(e) =>
                        setEventInfo({ ...eventInfo, endTime: e.target.value })
                      }
                    />
                    <label htmlFor="responsiblePerson" className="form-label">
                      Responsible Person:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="responsiblePerson"
                      required
                      value={eventInfo.responsiblePerson}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          responsiblePerson: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="contactNumber" className="form-label">
                      Contact Number:
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="contactNumber"
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      title="Please enter a 10-digit phone number"
                      value={eventInfo.contactNumber}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          contactNumber: e.target.value,
                        })
                      }
                    />
                    <label htmlFor="canteenRemarks" className="form-label">
                      Canteen Remarks:
                    </label>
                    <textarea
                      className="form-control"
                      id="canteenRemarks"
                      rows="4"
                      placeholder="Enter any special instructions or requirements for the canteen"
                      value={eventInfo.canteenRemarks}
                      onChange={(e) =>
                        setEventInfo({
                          ...eventInfo,
                          canteenRemarks: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-danger me-2"
                      onClick={deleteEvent}
                    >
                      Delete Event
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveEvent}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Event Details</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <table className="table">
                      <tbody>
                        <tr>
                          <td className="fw-bold">Event Title:</td>
                          <td className="fw-bold">{selectEvent.title}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Date:</td>
                          <td className="text-muted">
                            {moment(selectEvent.start).format("D MMM, ddd")}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold capitalise">Venue:</td>
                          <td className="text-muted">{selectEvent.venue}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Start Time:</td>
                          <td className="text-muted">
                            {moment(selectEvent.start).format("HH:mm")}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">End Time:</td>
                          <td className="text-muted">
                            {moment(selectEvent.end).format("HH:mm")}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Responsible Person:</td>
                          <td className="text-muted">
                            {selectEvent.responsiblePerson}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Contact Number:</td>
                          <td className="text-muted">
                            {selectEvent.contactNumber}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Canteen Remarks:</td>
                          <td className="text-muted">
                            {selectEvent.canteenRemarks}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Requirements:</td>
                          <td className="text-muted">
                            {Object.entries(selectEvent.requirements || {})
                              .filter(([_, value]) => value)
                              .map(([key]) => {
                                const formattedKey = key
                                  .replace(/([A-Z])/g, ' $1')
                                  .replace(/^./, str => str.toUpperCase());
                                return formattedKey;
                              })
                              .join(', ') || 'None'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div
            className="modal"
            style={{
              display: "block",
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Event Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <table className="table">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Event Title:</td>
                        <td className="fw-bold">{selectEvent.title}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Date:</td>
                        <td className="text-muted">
                          {moment(selectEvent.start).format("D MMM, ddd")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold capitalise">Venue:</td>
                        <td className="text-muted">{selectEvent.venue}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Start Time:</td>
                        <td className="text-muted">
                          {moment(selectEvent.start).format("HH:mm")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">End Time:</td>
                        <td className="text-muted">
                          {moment(selectEvent.end).format("HH:mm")}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Responsible Person:</td>
                        <td className="text-muted">
                          {selectEvent.responsiblePerson}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Contact Number:</td>
                        <td className="text-muted">
                          {selectEvent.contactNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Canteen Remarks:</td>
                        <td className="text-muted">
                          {selectEvent.canteenRemarks}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Requirements:</td>
                        <td className="text-muted">
                          {Object.entries(selectEvent.requirements || {})
                            .filter(([_, value]) => value)
                            .map(([key]) => {
                              const formattedKey = key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase());
                              return formattedKey;
                            })
                            .join(', ') || 'None'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default CalendarInterface;
