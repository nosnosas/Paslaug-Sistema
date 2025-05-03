import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeeAppointments = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allAppointments, setAllAppointments] = useState([]);

  const { auth, userId } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
      setError("");
      const response = await axios.get(
          "http://localhost:8080/employee/appointments",
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );
      setAllAppointments(response.data);
      setAppointments(response.data);
    } catch (error) {
      console.error("Klaida gaunant susitikimus:", error);
      setError("Nepavyko įkelti susitikimų. Bandykite dar kartą vėliau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("Ar tikrai norite ištrinti šį susitikimą?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.delete(
          `http://localhost:8080/employee/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );

      setSuccess("Susitikimas sėkmingai ištrintas!");
      setAppointments(appointments.filter(app => app.id !== appointmentId));
    } catch (error) {
      console.error("Klaida ištrinant susitikimą:", error);
      setError(
          error.response?.data?.message ||
          "Nepavyko ištrinti susitikimo. Bandykite dar kartą."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.put(
          `http://localhost:8080/employee/appointments/${selectedAppointment.id}`,
          selectedAppointment,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );

      setSuccess("Susitikimas sėkmingai atnaujintas!");
      setShowViewModal(false);
      fetchAppointments();
    } catch (error) {
      console.error("Klaida atnaujinant susitikimą:", error);
      setError(
          error.response?.data?.message ||
          "Nepavyko atnaujinti susitikimo. Bandykite dar kartą."
      );
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


  const handleFilter = () => {
    if (!startDate && !endDate) {
      setAppointments(allAppointments);
      return;
    }

    let filtered = [...allAppointments];

    if (startDate) {
      const startDateTime = new Date(startDate);
      filtered = filtered.filter(appointment =>
          new Date(appointment.appointmentDate) >= startDateTime
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59);
      filtered = filtered.filter(appointment =>
          new Date(appointment.appointmentDate) <= endDateTime
      );
    }

    setAppointments(filtered);
  };

  // Add a reset filter function:

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppointments(allAppointments);
  };

  if (loading && appointments.length === 0) {
    return (
        <div className="container py-5">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Kraunama...</span>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="card-title mb-0">Susitikimų valdymas</h2>
                </div>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <label htmlFor="startDate" className="form-label">Nuo datos</label>
                    <input
                        type="date"
                        className="form-control"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="endDate" className="form-label">Iki datos</label>
                    <input
                        type="date"
                        className="form-control"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button
                        className="btn btn-primary me-2"
                        onClick={handleFilter}
                    >
                      Filtruoti
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={resetFilter}
                    >
                      Atstatyti
                    </button>
                  </div>
                </div>
                {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                    <tr>
                      <th>Paslaugos tipas</th>
                      <th>Klientas</th>
                      <th>Data ir laikas</th>
                      <th>Būsena</th>
                      <th>Pastabos</th>
                      <th>Veiksmai</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.serviceType}</td>
                          <td>{appointment.customer?.name || "Nežinoma"}</td>
                          <td>
                            {format(
                                new Date(appointment.appointmentDate),
                                "yyyy-MM-dd HH:mm"
                            )}
                          </td>
                          <td>
                          <span
                              className={`badge ${getStatusBadgeClass(
                                  appointment.status
                              )}`}
                          >
                            {appointment.status === "SCHEDULED"
                                ? "Suplanuota"
                                : appointment.status === "COMPLETED"
                                    ? "Įvykdyta"
                                    : appointment.status === "CANCELLED"
                                        ? "Atšaukta"
                                        : appointment.status}
                          </span>
                          </td>
                          <td>{appointment.notes || "Nėra pastabų"}</td>
                          <td>
                            <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowViewModal(true);
                                }}
                            >
                              Peržiūrėti
                            </button>
                            <button
                                className="btn btn-sm btn-danger ms-2"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              Ištrinti
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for viewing/editing */}
        {showViewModal && selectedAppointment && (
            <div className="modal show" style={{ display: "block" }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Susitikimo detalės</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowViewModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleUpdateAppointment}>
                      <div className="mb-3">
                        <label htmlFor="serviceType" className="form-label">
                          Paslaugos tipas
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="serviceType"
                            value={selectedAppointment.serviceType}
                            onChange={(e) =>
                                setSelectedAppointment({
                                  ...selectedAppointment,
                                  serviceType: e.target.value,
                                })
                            }
                            required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="appointmentDate" className="form-label">
                          Data ir laikas
                        </label>
                        <input
                            type="datetime-local"
                            className="form-control"
                            id="appointmentDate"
                            value={format(
                                new Date(selectedAppointment.appointmentDate),
                                "yyyy-MM-dd'T'HH:mm"
                            )}
                            onChange={(e) =>
                                setSelectedAppointment({
                                  ...selectedAppointment,
                                  appointmentDate: e.target.value,
                                })
                            }
                            required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="status" className="form-label">
                          Būsena
                        </label>
                        <select
                            className="form-select"
                            id="status"
                            value={selectedAppointment.status}
                            onChange={(e) =>
                                setSelectedAppointment({
                                  ...selectedAppointment,
                                  status: e.target.value,
                                })
                            }
                        >
                          <option value="SCHEDULED">Suplanuota</option>
                          <option value="COMPLETED">Įvykdyta</option>
                          <option value="CANCELLED">Atšaukta</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="notes" className="form-label">
                          Pastabos
                        </label>
                        <textarea
                            className="form-control"
                            id="notes"
                            rows="3"
                            value={selectedAppointment.notes || ""}
                            onChange={(e) =>
                                setSelectedAppointment({
                                  ...selectedAppointment,
                                  notes: e.target.value,
                                })
                            }
                        ></textarea>
                      </div>
                      <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowViewModal(false)}
                        >
                          Uždaryti
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                          {loading ? "Atnaujinama..." : "Atnaujinti"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger me-2"
                            onClick={() => {
                              setShowViewModal(false);
                              handleDeleteAppointment(selectedAppointment.id);
                            }}
                        >
                          Ištrinti
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default EmployeeAppointments;