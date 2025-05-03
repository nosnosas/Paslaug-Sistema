import React, { useState } from "react";
import AppointmentBooking from "./AppointmentBooking";
import AppointmentHistory from "./AppointmentHistory";
import CustomerCalendar from "./CustomerCalendar";
import SubmitFeedback from "./SubmitFeedback";
import SendMessage from "./SendMessage";
import CustomerMessages from "./CustomerMessages";

const CustomerDashboard = ({ customerId }) => {
  const [activeTab, setActiveTab] = useState("appointments");

  const renderTabContent = () => {
    switch (activeTab) {
      case "appointments":
        return <AppointmentBooking />;
      case "history":
        return <AppointmentHistory customerId={customerId} />;
      case "calendar":
        return <CustomerCalendar customerId={customerId} />;
      case "feedback":
        return <SubmitFeedback customerId={customerId} />;
      case "messages":
        return <SendMessage customerId={customerId} />;
      case "customerMessages":
        return <CustomerMessages customerId={customerId} />;
      default:
        return <AppointmentBooking />;
    }
  };

  return (
      <div className="container mt-4">
        {/* <h2 className="text-center">Kliento valdymo skydelis</h2> */}
        <div className="tabs mb-4">
          <button
              onClick={() => setActiveTab("appointments")}
              className={`btn ${activeTab === "appointments" ? "active-tab" : ""}`}
          >
            Rezervuoti susitikimą
          </button>
          <button
              onClick={() => setActiveTab("history")}
              className={`btn ${activeTab === "history" ? "active-tab" : ""}`}
          >
            Susitikimų istorija
          </button>
          <button
              onClick={() => setActiveTab("calendar")}
              className={`btn ${activeTab === "calendar" ? "active-tab" : ""}`}
          >
            Kliento kalendorius
          </button>
          <button
              onClick={() => setActiveTab("feedback")}
              className={`btn ${activeTab === "feedback" ? "active-tab" : ""}`}
          >
            Pateikti atsiliepimą
          </button>
          <button
              onClick={() => setActiveTab("messages")}
              className={`btn ${activeTab === "messages" ? "active-tab" : ""}`}
          >
            Siųsti žinutę
          </button>
          <button
              onClick={() => setActiveTab("customerMessages")}
              className={`btn ${
                  activeTab === "customerMessages" ? "active-tab" : ""
              }`}
          >
            Kliento žinutės
          </button>
        </div>
        <div className="tab-content mt-4">{renderTabContent()}</div>
      </div>
  );
};

export default CustomerDashboard;