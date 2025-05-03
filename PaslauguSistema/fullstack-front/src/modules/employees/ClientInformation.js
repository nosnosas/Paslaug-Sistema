import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import "bootstrap/dist/css/bootstrap.min.css";

const ClientInformation = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    fetchClients();
  }, [auth, navigate]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      // Filter for customers only
      const customerUsers = response.data.filter(
        (user) => user.role === "CUSTOMER"
      );
      setClients(customerUsers);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to load client information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientAppointments = async (clientId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/customer/appointments/history/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setClientAppointments(response.data);
    } catch (error) {
      console.error("Error fetching client appointments:", error);
      setClientAppointments([]);
    }
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    await fetchClientAppointments(client.id);
    setShowModal(true);
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

  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
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
              <h2 className="card-title mb-4">Klientų informacija</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ieškoti pagal vardą, el. paštą arba naudotojo vardą..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredClients.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Klientų nerasta</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Vardas</th>
                        <th>El. paštas</th>
                        <th>Naudotojo vardas</th>
                        <th>Veiksmai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.id}>
                          <td>{client.id}</td>
                          <td>{client.name || "Nenurodyta"}</td>
                          <td>{client.email}</td>
                          <td>{client.username}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewClient(client)}
                            >
                              Peržiūrėti detaliau
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && showModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Kliento informacija - {selectedClient.name || selectedClient.username}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Pagrindinė informacija</h6>
                    <p><strong>ID:</strong> {selectedClient.id}</p>
                    <p><strong>Vardas:</strong> {selectedClient.name || "Nenurodyta"}</p>
                    <p><strong>El. paštas:</strong> {selectedClient.email}</p>
                    <p><strong>Naudotojo vardas:</strong> {selectedClient.username}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Papildoma informacija</h6>
                    <p><strong>Telefono nr.:</strong> {selectedClient.phone || "Nenurodytas"}</p>
                    <p><strong>Adresas:</strong> {selectedClient.address || "Nenurodytas"}</p>
                    <p><strong>Registracijos data:</strong> {selectedClient.createdAt ? 
                      format(new Date(selectedClient.createdAt), "yyyy-MM-dd") : "Nežinoma"}</p>
                  </div>
                </div>

                <h6 className="mb-3">Kliento susitikimai</h6>
                {clientAppointments.length === 0 ? (
                  <p className="text-muted">Šis klientas neturi užregistruotų susitikimų.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Paslauga</th>
                          <th>Būsena</th>
                          <th>Darbuotojas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientAppointments.map((appointment) => (
                          <tr key={appointment.id}>
                            <td>{format(new Date(appointment.appointmentDate), "yyyy-MM-dd HH:mm")}</td>
                            <td>{appointment.serviceType}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status === "SCHEDULED" ? "Suplanuotas" :
                                 appointment.status === "COMPLETED" ? "Įvykdytas" :
                                 appointment.status === "CANCELLED" ? "Atšauktas" : appointment.status}
                              </span>
                            </td>
                            <td>{appointment.employee?.name || "Nepriskirta"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => navigate(`/employee/messages?recipientId=${selectedClient.id}&recipientType=customer`)}
                >
                  Siųsti žinutę
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Uždaryti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInformation;