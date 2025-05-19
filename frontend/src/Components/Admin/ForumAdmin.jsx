import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import slotService from "../../Services/service.js";
import BookingPDF from "./BookingPDF";
import { generatePDF } from "../../utils/pdfGenerator";
import { FaDownload } from "react-icons/fa";

const ForumAdmin = ({ retrieveSlots, slots, loginuser }) => {
  const forumSlots =
    loginuser === "admin"
      ? slots
      : slots.filter((slot) => slot.username === loginuser);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
  }, [retrieveSlots]);

  const handleRowClick = (slot) => {
    if (slot.status !== "pending") {
      return;
    }

    if (loginuser !== "admin" && slot.username !== loginuser) {
      return;
    }

    console.log("Selected slot requirements:", slot.requirements); // Debug log

    setSelectedSlot(slot);
    setEventInfo({
      eventTitle: slot.title,
      venue: slot.venue,
      startTime: moment(slot.start).format("HH:mm"),
      endTime: moment(slot.end).format("HH:mm"),
      responsiblePerson: slot.responsiblePerson || "",
      contactNumber: slot.contactNumber || "",
      canteenRemarks: slot.canteenRemarks || "",
      requirements: {
        ac: Boolean(slot.requirements?.ac),
        soundSystem: Boolean(slot.requirements?.soundSystem),
        projector: Boolean(slot.requirements?.projector)
      }
    });
    setShowModal(true);
  };

  const handleDownloadPDF = async (e, slot) => {
    e.stopPropagation();
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      await generatePDF(<BookingPDF slot={slot} />, slot);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDelete = async (e, slot) => {
    e.stopPropagation();

    if (slot.status === "approved") {
      toast.error("Approved events cannot be deleted");
      return;
    }

    if (loginuser !== "admin" && slot.username !== loginuser) {
      toast.error("You don't have permission to delete this event");
      return;
    }

    const confirmation = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmation) {
      return;
    }

    try {
      await slotService.deleteSlot(slot._id);
      toast.success("Event deleted successfully!");
      retrieveSlots();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting event. Please try again.");
    }
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
      const startDateTime = moment(selectedSlot.start)
        .set({
          hour: parseInt(eventInfo.startTime.split(":")[0]),
          minute: parseInt(eventInfo.startTime.split(":")[1]),
        })
        .toDate();
      const endDateTime = moment(selectedSlot.start)
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

      console.log("Saving requirements:", eventInfo.requirements); // Debug log

      // Create a new slot with updated information
      const updatedSlot = {
        username: selectedSlot.username,
        eventTitle: eventInfo.eventTitle,
        venue: eventInfo.venue,
        startDate: startDateTime,
        endDate: endDateTime,
        responsiblePerson: eventInfo.responsiblePerson,
        contactNumber: eventInfo.contactNumber,
        canteenRemarks: eventInfo.canteenRemarks,
        requirements: {
          ac: Boolean(eventInfo.requirements.ac),
          soundSystem: Boolean(eventInfo.requirements.soundSystem),
          projector: Boolean(eventInfo.requirements.projector)
        }
      };

      console.log("Updated slot:", updatedSlot); // Debug log

      await slotService.createSlot(updatedSlot);

      // Delete the old slot
      await slotService.deleteSlot(selectedSlot._id);

      toast.success("Event updated successfully!");
      retrieveSlots();
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
    } catch (error) {
      console.error(error);
      toast.error("Error updating event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {forumSlots.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th scope="col">Si No.</th>
              <th scope="col">Forum</th>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ width: "180px" }}>Remarks</th>
              <th scope="col" style={{ width: "180px" }}>Time Elapsed</th>
              <th scope="col">Actions</th>
              {loginuser === "admin" && <th scope="col">Download</th>}
            </tr>
          </thead>
          <tbody>
            {forumSlots.map((slot, index) => (
              <tr
                key={slot._id}
                onClick={() => handleRowClick(slot)}
                style={{
                  cursor: slot.status === "pending" ? "pointer" : "default",
                }}
              >
                <th scope="row">{index + 1}.</th>
                <td>{slot.username}</td>
                <td>{slot.title}</td>
                <td>
                  {slot.status === "approved" ? (
                    <Button variant="success">Approved</Button>
                  ) : slot.status === "pending" ? (
                    <Button variant="warning">Pending</Button>
                  ) : (
                    <Button variant="danger">Rejected</Button>
                  )}
                </td>
                <td style={{ width: "180px" }}>
                  <div>
                    Applied: {moment(slot.bookingTime).format("MMM D, h:mm A")}
                  </div>
                  {slot.status === "approved" && slot.approvalTime && (
                    <div>
                      Approved: {moment(slot.approvalTime).format("MMM D, h:mm A")}
                    </div>
                  )}
                </td>
                <td style={{ width: "180px" }}>
                  {slot.status === "approved" && slot.approvalTime ? (
                    moment.duration(moment(slot.approvalTime).diff(moment(slot.bookingTime))).humanize()
                  ) : slot.status === "pending" ? (
                    moment.duration(moment().diff(moment(slot.bookingTime))).humanize() + " (pending)"
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {slot.status !== "approved" && (
                    <Button
                      variant="danger"
                      onClick={(e) => handleDelete(e, slot)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </Button>
                  )}
                </td>
                {loginuser === "admin" && (
                  <td>
                    <Button
                      variant="primary"
                      onClick={(e) => handleDownloadPDF(e, slot)}
                      disabled={isGeneratingPDF}
                    >
                      <FaDownload />{" "}
                      {isGeneratingPDF ? "Generating..." : "Download PDF"}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div>No slots</div>
      )}

      {showModal && selectedSlot && (
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
                      requirements: {
                        ac: false,
                        soundSystem: false,
                        projector: false
                      }
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
                  onChange={(e) => {
                    const newVenue = e.target.value;
                    setEventInfo({
                      ...eventInfo,
                      venue: newVenue,
                      requirements: {
                        ...eventInfo.requirements,
                        ac: newVenue === "Multipurpose Hall" ? false : eventInfo.requirements.ac
                      }
                    });
                  }}
                  required
                >
                  <option value="">Select Venue</option>
                  <option value="CV Raman Auditorium">
                    CV Raman Auditorium
                  </option>
                  <option value="Multipurpose Hall">Multipurpose Hall</option>
                  <option value="Senate Hall">Senate Hall</option>
                  <option value="NTIC Hall">NTIC Hall</option>
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
                  <label className="form-label fw-bold">Requirements:</label>
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
      )}
    </div>
  );
};

export default ForumAdmin;
