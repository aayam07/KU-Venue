import React, { useEffect } from "react"
import { Button, Table } from "react-bootstrap"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import slotService from "../../Services/service.js"
import moment from "moment"
import BookingPDF from "./BookingPDF"
import { generatePDF } from "../../utils/pdfGenerator"
import { FaDownload } from "react-icons/fa"

const Admin = ({ retrieveSlots, pendingSlots }) => {
  const [showModal, setShowModal] = React.useState(false)
  const [slot, setSlot] = React.useState({})
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)

  useEffect(() => {
    retrieveSlots()
  }, [retrieveSlots])

  const handleRowClick = slot => {
    setShowModal(true)
    setSlot(slot)
  }

  const handleDownloadPDF = async (e, slot) => {
    e.stopPropagation()
    if (isGeneratingPDF) return

    setIsGeneratingPDF(true)
    try {
      await generatePDF(<BookingPDF slot={slot} />, slot)
      toast.success("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Error generating PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleApprove = async id => {
    try {
      // Get all slots to check for collisions
      const response = await slotService.getAllSlots()
      const allSlots = response.data.slots
      const slotToApprove = allSlots.find(s => s._id === id)
      
      // Check for collisions with approved events
      const hasCollision = allSlots.some(slot => {
        if (slot._id === id || slot.status !== "approved") return false
        
        const slotStart = moment(slot.start)
        const slotEnd = moment(slot.end)
        const approveStart = moment(slotToApprove.start)
        const approveEnd = moment(slotToApprove.end)
        
        return (
          slot.venue === slotToApprove.venue &&
          ((slotStart.isBefore(approveStart) && slotEnd.isAfter(approveStart)) ||
            (slotStart.isBefore(approveEnd) && slotEnd.isAfter(approveEnd)) ||
            (slotStart.isSameOrAfter(approveStart) && slotEnd.isSameOrBefore(approveEnd)))
        )
      })

      if (hasCollision) {
        toast.error("Cannot approve this event as there is already an approved event in the same hall at the same time.")
        return
      }

      // If no collision, proceed with approval
      await slotService.updateSlotStatus(id, "approved")
      toast.success("Slot approved successfully")
      
      // Reject any pending events that would collide with this newly approved event
      const slotsToReject = allSlots.filter(slot => {
        if (slot._id === id || slot.status !== "pending") return false
        
        const slotStart = moment(slot.start)
        const slotEnd = moment(slot.end)
        const approveStart = moment(slotToApprove.start)
        const approveEnd = moment(slotToApprove.end)
        
        return (
          slot.venue === slotToApprove.venue &&
          ((slotStart.isBefore(approveStart) && slotEnd.isAfter(approveStart)) ||
            (slotStart.isBefore(approveEnd) && slotEnd.isAfter(approveEnd)) ||
            (slotStart.isSameOrAfter(approveStart) && slotEnd.isSameOrBefore(approveEnd)))
        )
      })

      // Reject all colliding events
      for (const slot of slotsToReject) {
        await slotService.updateSlotStatus(slot._id, "rejected")
      }

      setShowModal(false)

      if (slotsToReject.length > 0) {
        toast.info(`${slotsToReject.length} colliding event(s) have been automatically rejected.`)
      }

      retrieveSlots()
    } catch (error) {
      console.error(error)
      toast.error("Error processing the approval")
    }
  }

  const handleReject = async id => {
    try {
      await slotService.updateSlotStatus(id, "rejected")
      setShowModal(false)
      toast.success("Slot rejected successfully")
      retrieveSlots()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      {pendingSlots.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th scope="col">Si No.</th>
              <th scope="col">Forum</th>
              <th scope="col">Title</th>
              <th scope="col">Approve</th>
              <th scope="col">Reject</th>
              <th scope="col">Download</th>
            </tr>
          </thead>
          <tbody>
            {pendingSlots.map((slot, index) => (
              <tr key={slot._id}>
                <th scope="row">{index + 1}</th>
                <td onClick={() => handleRowClick(slot)}>{slot.username}</td>
                <td onClick={() => handleRowClick(slot)}>{slot.title}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => handleApprove(slot._id)}
                  >
                    Approve
                  </Button>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(slot._id)}
                  >
                    Reject
                  </Button>
                </td>
                <td>
                  <Button
                    variant="primary"
                    onClick={(e) => handleDownloadPDF(e, slot)}
                    disabled={isGeneratingPDF}
                  >
                    <FaDownload /> {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div>No pending slots</div>
      )}
      {showModal && (
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
                <img
                  src=""
                  alt="Logo"
                  style={{
                    width: "100px",
                    height: "auto",
                    marginRight: "10px",
                  }}
                />
                <h5
                  className="modal-title"
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    textTransform: "uppercase ",
                  }}
                >
                  {slot.username}
                </h5>
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
                      <td className="fw-bold">{slot.title}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Date:</td>
                      <td className="text-muted">
                        {moment(slot.start).format("D MMM, ddd")}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold capitalise">Venue:</td>
                      <td className="text-muted">{slot.venue}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Start Time:</td>
                      <td className="text-muted">
                        {moment(slot.start).format("HH:mm")}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">End Time:</td>
                      <td className="text-muted">
                        {moment(slot.end).format("HH:mm")}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Responsible Person:</td>
                      <td className="text-muted">{slot.responsiblePerson}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Contact Number:</td>
                      <td className="text-muted">{slot.contactNumber}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <Button
                  variant="success"
                  onClick={() => handleApprove(slot._id)}
                >
                  Approve
                </Button>
                <Button variant="danger" onClick={() => handleReject(slot._id)}>
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
