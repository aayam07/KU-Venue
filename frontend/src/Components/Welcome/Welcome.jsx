import React from "react";
import "./Welcome.css";
import { Table } from "react-bootstrap";
import moment from "moment";

export default function Welcome({ events }) {
  // Sort events by date and filter out past events
  const upcomingEvents = events
    .filter(event => moment(event.start).isAfter(moment()))
    .sort((a, b) => moment(a.start).diff(moment(b.start)));

  return (
    <section className="welcome-section">
      <div className="welcome-container">
        <h1 className="welcome-title">
          Welcome to <br />
          <span className="highlight">KU Hall Booking System</span>
        </h1>

        <div className="content-section">
          <div className="upcoming-events">
            <h2>Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingEvents.map((event, index) => (
                    <tr key={event._id}>
                      <td>{moment(event.start).format("D MMM YYYY")}</td>
                      <td>{event.title}</td>
                      <td>{event.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="no-events">No upcoming events</div>
            )}
          </div>

          <div className="instructions">
            <h2>Instructions</h2>
            <ol>
              <li>This website provides information on events that have already been scheduled, including their dates and time.</li>
              <li>To make a booking, you need to be logged in. Then, go to the calendar interface and click on the date you want to book.</li>
              <li>Students are limited to viewing the scheduled events and are unable to make bookings.</li>
              <li>Only departments, authorized personnels, and staff members are authorized to make bookings.</li>
              <li>Bookings are directed to the admin for approval or rejection.</li>
              <li>Events that are approved are exclusively showcased on the calendar interface, while those that are rejected are indicated as such on the dashboard page.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
