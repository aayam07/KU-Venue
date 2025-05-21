import React, { useState, useEffect } from "react";
import "./HallDetails.css";
import slotService from "../../Services/service";

const hallData = {
  multipurpose: {
    name: "Multipurpose Hall",
    buildingNumber: "B-203",
    capacity: 100,
    acAvailable: true,
    projectorAvailable: false,
    description: "Versatile space suitable for various events and activities.",
    image: "https://example.com/multipurpose.jpg",
  },
  senate: {
    name: "Senate Hall",
    buildingNumber: "C-305",
    capacity: 50,
    acAvailable: true,
    projectorAvailable: true,
    description: "Elegant hall perfect for formal meetings and presentations.",
    image: "https://example.com/senate.jpg",
  },
  "mini-auditorium": {
    name: "Mini Auditorium",
    buildingNumber: "D-102",
    capacity: 150,
    acAvailable: true,
    projectorAvailable: true,
    description: "Compact auditorium with modern audio-visual facilities.",
    image: "https://example.com/mini-auditorium.jpg",
  },
  ciku: {
    name: "CIKU Hall",
    buildingNumber: "E-201",
    capacity: 80,
    acAvailable: true,
    projectorAvailable: true,
    description: "Modern hall with advanced technical facilities.",
    image: "https://example.com/ciku.jpg",
  },
  ntic: {
    name: "NTIC",
    buildingNumber: "F-301",
    capacity: 120,
    acAvailable: true,
    projectorAvailable: true,
    description: "Technical hall with state-of-the-art equipment.",
    image: "https://example.com/ntic.jpg",
  },
  "cv-raman": {
    name: "CV Raman",
    buildingNumber: "A-101",
    capacity: 200,
    acAvailable: true,
    projectorAvailable: true,
    description:
      "A state-of-the-art auditorium equipped with modern audio-visual facilities.",
    image: "https://example.com/cv-raman.jpg",
  },
};

const HallDetails = () => {
  const [hallInfo, setHallInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get hall name from URL - remove the leading slash if present
    const pathSegments = window.location.pathname.split("/");
    const hallName = pathSegments[pathSegments.length - 1]; // Get the last segment of the path
    console.log("Current hall name from URL:", hallName);
    setHallInfo(hallData[hallName]);

    // Create a mapping of URL names to venue names
    const venueMapping = {
      "cv-raman": "CV Raman Auditorium",
      multipurpose: "Multipurpose Hall",
      senate: "Senate Hall",
      ntic: "NTIC Hall",
    };

    // Fetch events for the hall
    slotService
      .getAllSlots()
      .then((response) => {
        console.log("All slots:", response.data.slots);
        console.log("Looking for venue:", venueMapping[hallName]);

        const approvedSlots = response.data.slots.filter((slot) => {
          const isApproved = slot.status === "approved";
          const isMatchingVenue = slot.venue === venueMapping[hallName];

          console.log(`Slot: ${slot.title}`);
          console.log(`Venue: ${slot.venue}`);
          console.log(`Expected venue: ${venueMapping[hallName]}`);
          console.log(`Is matching? ${isMatchingVenue}`);

          return isApproved && isMatchingVenue;
        });

        // Sort events by date and time
        const sortedEvents = approvedSlots.sort((a, b) => {
          const dateA = new Date(a.start);
          const dateB = new Date(b.start);
          return dateA - dateB;
        });

        // Filter out past events
        const currentDate = new Date();
        const upcomingEvents = sortedEvents.filter((event) => {
          const eventDate = new Date(event.start);
          return eventDate >= currentDate;
        });

        console.log(
          "Upcoming events for",
          venueMapping[hallName],
          ":",
          upcomingEvents
        );
        setEvents(upcomingEvents);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, [window.location.pathname]); // Add pathname as dependency to re-run when URL changes

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!hallInfo) {
    return <div className="error">Hall information not found</div>;
  }

  return (
    <div className="hall-details-container">
      {/* Carousel for hall images */}
      <div className="hall-carousel" style={{ marginBottom: '2rem', width: '100%' }}>
        <div id="hallImagesCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" className="d-block w-100" alt="Hall 1" style={{ maxHeight: '300px', objectFit: 'cover' }} />
            </div>
            <div className="carousel-item">
              <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80" className="d-block w-100" alt="Hall 2" style={{ maxHeight: '300px', objectFit: 'cover' }} />
            </div>
            <div className="carousel-item">
              <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80" className="d-block w-100" alt="Hall 3" style={{ maxHeight: '300px', objectFit: 'cover' }} />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#hallImagesCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#hallImagesCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      {/* End Carousel */}
      <div className="hall-info-section">
        <h2>{hallInfo.name}</h2>
        <div className="hall-info-box">
          <div className="info-item">
            <span className="label">Building Number:</span>
            <span className="value">{hallInfo.buildingNumber}</span>
          </div>
          <div className="info-item">
            <span className="label">Capacity:</span>
            <span className="value">{hallInfo.capacity} people</span>
          </div>
          <div className="info-item">
            <span className="label">AC Available:</span>
            <span className="value">{hallInfo.acAvailable ? "Yes" : "No"}</span>
          </div>
          <div className="info-item">
            <span className="label">Projector Available:</span>
            <span className="value">
              {hallInfo.projectorAvailable ? "Yes" : "No"}
            </span>
          </div>
          <div className="info-item description">
            <span className="label">Description:</span>
            <span className="value">{hallInfo.description}</span>
          </div>
        </div>
      </div>

      <div className="events-section">
        <h2>Upcoming Events</h2>
        {events.length === 0 ? (
          <div className="no-events">No upcoming events</div>
        ) : (
          <div className="events-list">
            {events.map((event, index) => (
              <div key={index} className="event-card">
                <h3>{event.title}</h3>
                <div className="event-details">
                  <p>
                    <strong>Booked by:</strong> {event.username}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.start).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(event.start).toLocaleTimeString()} -{" "}
                    {new Date(event.end).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {event.contactNumber || "Not provided"}
                  </p>
                  <p>
                    <strong>Responsible Person:</strong>{" "}
                    {event.responsiblePerson || "Not provided"}
                  </p>
                  {event.canteenRemarks && (
                    <p>
                      <strong>Canteen Remarks:</strong> {event.canteenRemarks}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status ${event.status.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HallDetails;
