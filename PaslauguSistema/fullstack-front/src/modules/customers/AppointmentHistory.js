import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import "bootstrap/dist/css/bootstrap.min.css";

const AppointmentHistory = () => {
  const { auth, userId } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, past

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    fetchAppointments();
  }, [auth, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
          `http://localhost:8080/customer/appointments/history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );
      setAppointments(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Nepavyko įkelti susitikimų istorijos. Bandykite dar kartą vėliau.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-primary";
      case "COMPLETED":
        return "bg-success";
      case "CANCELLED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "Suplanuotas";
      case "COMPLETED":
        return "Įvykdytas";
      case "CANCELLED":
        return "Atšauktas";
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);

    if (filter === "upcoming") {
      return appointmentDate >= now && appointment.status === "SCHEDULED";
    } else if (filter === "past") {
      return appointmentDate < now || appointment.status !== "SCHEDULED";
    }
    return true;
  });

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kraunama...</span>
          </div>
        </div>
    );
  }

  return (
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2">Susitikimų Istorija</h1>
              <div className="btn-group">
                <button
                    onClick={() => setFilter("all")}
                    className={`btn ${
                        filter === "all" ? "btn-primary" : "btn-outline-primary"
                    }`}
                >
                  Visi
                </button>
                <button
                    onClick={() => setFilter("upcoming")}
                    className={`btn ${
                        filter === "upcoming" ? "btn-primary" : "btn-outline-primary"
                    }`}
                >
                  Būsimi
                </button>
                <button
                    onClick={() => setFilter("past")}
                    className={`btn ${
                        filter === "past" ? "btn-primary" : "btn-outline-primary"
                    }`}
                >
                  Praėję
                </button>
              </div>
            </div>

            {/* Debug info - only show in development */}
            {process.env.NODE_ENV === "development" && (
                <div className="alert alert-info small mb-4">
                  Vartotojo ID: {userId || "Nerasta"} | Rolė: KLIENTAS
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
            )}

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">
                    Nerasta susitikimų pagal pasirinktą filtrą.
                  </p>
                </div>
            ) : (
                <div className="row g-4">
                  {filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="col-12">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="card-title mb-0">
                                {appointment.serviceType || "Paslauga nenurodyta"}
                              </h5>
                              <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                          {getStatusTranslation(appointment.status)}
                        </span>
                            </div>

                            <div className="row g-3">
                              <div className="col-md-6">
                                <p className="text-muted mb-1">Data ir laikas:</p>
                                <p className="mb-0 fw-bold">
                                  {format(new Date(appointment.appointmentDate), "yyyy-MM-dd HH:mm")}
                                </p>
                              </div>

                              <div className="col-md-6">
                                <p className="text-muted mb-1">Darbuotojas:</p>
                                <p className="mb-0 fw-bold">
                                  {appointment.employee?.name || "Nežinomas"} {appointment.employee?.surname || ""}
                                </p>
                              </div>
                            </div>

                            {appointment.notes && (
                                <div className="mt-3">
                                  <p className="text-muted mb-1">Pastabos:</p>
                                  <p className="mb-0">{appointment.notes}</p>
                                </div>
                            )}

                            {appointment.treatmentDetails && (
                                <div className="mt-3">
                                  <p className="text-muted mb-1">Suteiktos paslaugos:</p>
                                  <p className="mb-0">{appointment.treatmentDetails}</p>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AppointmentHistory;