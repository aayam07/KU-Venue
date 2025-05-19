import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    width: 150,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "left",
    fontSize: 12,
    color: "#666",
  },
  canteenPage: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  canteenHeader: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  canteenTitle: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    color: "#e74c3c",
  },
  canteenSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  canteenSection: {
    margin: 10,
    padding: 10,
    backgroundColor: "#fff5f5",
    borderRadius: 5,
  },
  canteenRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  canteenLabel: {
    width: 150,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  canteenValue: {
    flex: 1,
    color: "#333",
  },
  canteenRemarks: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    border: "1px solid #e74c3c",
  },
  canteenRemarksText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 1.5,
  },
});

const BookingPDF = ({ slot }) => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#283618", marginBottom: "10px" }}>Booking Confirmation</h1>
        <p style={{ color: "#666" }}>Your venue booking has been confirmed</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#283618", fontSize: "18px", marginBottom: "10px" }}>Event Details</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Event Title:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{slot.title}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Venue:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{slot.venue}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Date:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {moment(slot.start).format("MMMM D, YYYY")}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Time:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {moment(slot.start).format("h:mm A")} - {moment(slot.end).format("h:mm A")}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Responsible Person:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{slot.responsiblePerson}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Contact Number:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{slot.contactNumber}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Requirements:</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {Object.entries(slot.requirements || {})
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
            {slot.canteenRemarks && (
              <tr>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>Canteen Remarks:</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{slot.canteenRemarks}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "30px", textAlign: "center", color: "#666" }}>
        <p>Thank you for using our venue booking system!</p>
        <p>For any queries, please contact the administration.</p>
      </div>
    </div>
  );
};

export default BookingPDF;
