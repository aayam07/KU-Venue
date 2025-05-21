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

const BookingPDF = ({ slot }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Venue Booking Confirmation</Text>
        <Text style={styles.subtitle}>KU Hall Booking System</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Event Title:</Text>
          <Text style={styles.value}>{slot.title}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Venue:</Text>
          <Text style={styles.value}>{slot.venue}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {moment(slot.start).format("MMMM D, YYYY")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {moment(slot.start).format("h:mm A")} -{" "}
            {moment(slot.end).format("h:mm A")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Forum/Organization:</Text>
          <Text style={styles.value}>{slot.username}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Responsible Person:</Text>
          <Text style={styles.value}>{slot.responsiblePerson}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.value}>{slot.contactNumber}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Booking Time:</Text>
          <Text style={styles.value}>
            {moment(slot.bookingTime).format("MMMM D, YYYY [at] h:mm A")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Requirements:</Text>
          <Text style={styles.value}>
            {Object.entries(slot.requirements || {})
              .filter(([_, value]) => value)
              .map(([key]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                return formattedKey;
              })
              .join(', ') || 'None'}
          </Text>
        </View>

        {slot.status === "approved" && slot.approvalTime && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Approval Time:</Text>
              <Text style={styles.value}>
                {moment(slot.approvalTime).format("MMMM D, YYYY [at] h:mm A")}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Time Elapsed:</Text>
              <Text style={styles.value}>
                {moment
                  .duration(
                    moment(slot.approvalTime).diff(moment(slot.bookingTime))
                  )
                  .humanize()}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text>Booked by: {slot.responsiblePerson}</Text>
        <Text>Forum: {slot.username}</Text>
        <Text>Generated on: {moment().format("MMMM D, YYYY [at] h:mm A")}</Text>
      </View>
    </Page>

    {slot.canteenRemarks && (
      <Page size="A4" style={styles.canteenPage}>
        <View style={styles.canteenHeader}>
          <Text style={styles.canteenTitle}>Canteen Instructions</Text>
          <Text style={styles.canteenSubtitle}>KU Hall Booking System</Text>
        </View>

        <View style={styles.canteenSection}>
          <View style={styles.canteenRow}>
            <Text style={styles.canteenLabel}>Event Title:</Text>
            <Text style={styles.canteenValue}>{slot.title}</Text>
          </View>

          <View style={styles.canteenRow}>
            <Text style={styles.canteenLabel}>Venue:</Text>
            <Text style={styles.canteenValue}>{slot.venue}</Text>
          </View>

          <View style={styles.canteenRow}>
            <Text style={styles.canteenLabel}>Date:</Text>
            <Text style={styles.canteenValue}>
              {moment(slot.start).format("MMMM D, YYYY")}
            </Text>
          </View>

          <View style={styles.canteenRow}>
            <Text style={styles.canteenLabel}>Time:</Text>
            <Text style={styles.canteenValue}>
              {moment(slot.start).format("h:mm A")} -{" "}
              {moment(slot.end).format("h:mm A")}
            </Text>
          </View>

          <View style={styles.canteenRemarks}>
            <Text style={styles.canteenLabel}>Special Instructions:</Text>
            <Text style={styles.canteenRemarksText}>{slot.canteenRemarks}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Generated on: {moment().format("MMMM D, YYYY [at] h:mm A")}
          </Text>
        </View>
      </Page>
    )}
  </Document>
);

export default BookingPDF;