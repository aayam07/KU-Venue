import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 150,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'left',
    fontSize: 12,
    color: '#666',
  }
});

const BookingPDF = ({ slot }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Venue Booking Confirmation</Text>
        <Text style={styles.subtitle}>KU Venue Booking System</Text>
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
          <Text style={styles.value}>{moment(slot.start).format('MMMM D, YYYY')}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {moment(slot.start).format('h:mm A')} - {moment(slot.end).format('h:mm A')}
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
      </View>

      <View style={styles.footer}>
        <Text>Booked by: {slot.responsiblePerson}</Text>
        <Text>Forum: {slot.username}</Text>
        <Text>Generated on: {moment().format('MMMM D, YYYY [at] h:mm A')}</Text>
      </View>
    </Page>
  </Document>
);

export default BookingPDF; 