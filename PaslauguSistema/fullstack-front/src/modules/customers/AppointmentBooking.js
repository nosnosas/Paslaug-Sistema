import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AppointmentBooking = () => {
    const { auth, role, userId } = useAuth();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState({
        date: "",
        time: "",
        description: "",
    });

    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!auth?.token) {
            navigate("/login");
            return;
        }

        console.log("Component mounted, auth token:", auth?.token);
        fetchEmployees();
    }, [auth, navigate]);

    const fetchEmployees = async () => {
        try {
            console.log("Fetching employees...");
            setError(""); // Clear any existing error
            const response = await axios.get("http://localhost:8080/users", {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            console.log("API Response:", response.data);

            const employeeUsers = response.data.filter(
                (user) => user.role === "EMPLOYEE"
            );
            console.log("Filtered Employees:", employeeUsers);

            setEmployees(employeeUsers);
            if (employeeUsers.length === 0) {
                setError("Šiuo metu nėra pasiekiamų darbuotojų.");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            console.error("Error details:", error.response?.data || error.message);
            setError("Nepavyko įkelti darbuotojų sąrašo. Bandykite dar kartą vėliau.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppointment({
            ...appointment,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!userId) {
            setError(
                "Vartotojo ID yra būtinas. Įsitikinkite, kad esate tinkamai prisijungę."
            );
            setLoading(false);
            return;
        }

        const dateTimeString = `${appointment.date}T${appointment.time}`;

        const appointmentData = {
            appointmentDate: dateTimeString,
            serviceType: appointment.description,
            status: "SCHEDULED",
            notes: "",
            treatmentDetails: "",
        };

        try {
            const response = await axios.post(
                `http://localhost:8080/customer/appointments?customerId=${userId}&employeeId=${selectedEmployeeId}`,
                appointmentData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            console.log("Appointment booked:", response.data);
            setSuccess("Susitikimas sėkmingai užregistruotas!");

            setAppointment({
                date: "",
                time: "",
                description: "",
            });
            setSelectedEmployeeId("");
        } catch (error) {
            console.error("Error booking appointment:", error);
            setError(
                error.response?.data?.message ||
                "Nepavyko užregistruoti susitikimo. Bandykite dar kartą."
            );
        } finally {
            setLoading(false);
        }
    };

    if (role !== "CUSTOMER" && role !== "ADMIN") {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <div className="card-body text-center">
                                <h2 className="text-danger mb-4">Prieiga negalima</h2>
                                <p className="text-muted">
                                    Tik klientai gali registruoti susitikimus. Jūsų dabartinis vaidmuo yra:{" "}
                                    {role || "nežinomas"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">
                                Užregistruoti susitikimą
                            </h2>

                            {/* Debug info - only show in development */}{process.env.NODE_ENV === "development" && (
                            <div className="alert alert-info small mb-4">
                                Vartotojo ID: {userId || "Nerasta"} | Rolė: {role === "CUSTOMER" ? "KLIENTAS" : role || "Nerasta"}
                            </div>
                        )}


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

                            <form
                                onSubmit={handleSubmit}
                                className="needs-validation"
                                noValidate
                            >
                                <div className="mb-3 text-start">
                                    <label htmlFor="date" className="form-label">
                                        Susitikimo data
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="date"
                                        name="date"
                                        value={appointment.date}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Pasirinkite susitikimo datą.
                                    </div>
                                </div>

                                <div className="mb-3 text-start">
                                    <label htmlFor="time" className="form-label">
                                        Susitikimo laikas
                                    </label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        id="time"
                                        name="time"
                                        value={appointment.time}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Pasirinkite susitikimo laiką.
                                    </div>
                                </div>

                                <div className="mb-3 text-start">
                                    <label htmlFor="employeeId" className="form-label">
                                        Pasirinkite darbuotoją
                                    </label>
                                    <select
                                        className="form-select"
                                        id="employeeId"
                                        name="employeeId"
                                        value={selectedEmployeeId}
                                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        required
                                    >
                                        <option value="">Pasirinkite darbuotoją...</option>
                                        {employees && employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <option key={employee.id} value={employee.id}>
                                                    {employee.firstName || ''} {employee.lastName || ''}
                                                    {!employee.firstName && !employee.lastName && employee.email}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Nėra pasiekiamų darbuotojų</option>
                                        )}
                                    </select>
                                    <div className="invalid-feedback">
                                        Pasirinkite darbuotoją susitikimui.
                                    </div>
                                </div>

                                <div className="mb-4 text-start">
                                    <label htmlFor="description" className="form-label">
                                        Aprašymas
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        rows="4"
                                        value={appointment.description}
                                        onChange={handleChange}
                                        placeholder="Trumpas susitikimo aprašymas..."
                                        required
                                    ></textarea>
                                    <div className="invalid-feedback">
                                        Pateikite susitikimo aprašymą.
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Registruojama...
                                            </>
                                        ) : (
                                            "Registruoti susitikimą"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentBooking;