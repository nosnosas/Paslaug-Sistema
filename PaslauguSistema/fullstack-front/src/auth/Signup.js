import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export default function Signup() {
  let navigate = useNavigate();
  const { login } = useAuth(); // Get the login function

  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "", // Add an initial empty value
    phoneNumber: "",
    address: "",
  });

  const [error, setError] = useState("");

  const { name, username, email, password, role, phoneNumber, address } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
          "http://localhost:8080/auth/signup",
          user
      );

      console.log("Signup response:", response.data);

      if (response.data.status === "success") {
        // Use the login function from context instead of directly setting localStorage
        login({
          token: response.data.token,
          username: response.data.username,
          role: response.data.role,
          userId: response.data.userId || response.data.id, // Try both fields
        });

        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response && error.response.data) {
        setError(error.response.data.Error || "Registration failed");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
            <h2 className="m-4">Registracija</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
            )}

            <form onSubmit={(e) => onSubmit(e)}>
              <div className="row">
                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="Name" className="form-label text-left">
                    Vardas
                  </label>
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Įveskite savo vardą"
                      name="name"
                      value={name}
                      onChange={(e) => onInputChange(e)}
                      required
                  />
                </div>

                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="Username" className="form-label">
                    Vartotojo vardas
                  </label>
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Įveskite vartotojo vardą"
                      name="username"
                      value={username}
                      onChange={(e) => onInputChange(e)}
                      required
                  />
                </div>

                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="role" className="form-label">
                    Rolė
                  </label>
                  <select
                      className="form-select"
                      name="role"
                      value={role}
                      onChange={onInputChange}
                      required
                  >
                    <option value="" disabled>
                      Pasirinkite rolę
                    </option>
                    <option value="ADMIN">ADMINISTRATORIUS</option>
                    <option value="EMPLOYEE">DARBUOTOJAS</option>
                    <option value="CUSTOMER">KLIENTAS</option>
                  </select>
                </div>

                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="phoneNumber" className="form-label">
                    Telefono numeris
                  </label>
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Įveskite telefono numerį"
                      name="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => onInputChange(e)}
                      required
                  />
                </div>

                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="address" className="form-label">
                    Adresas
                  </label>
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Įveskite adresą"
                      name="address"
                      value={address}
                      onChange={(e) => onInputChange(e)}
                      required
                  />
                </div>

                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="Email" className="form-label">
                    El. paštas
                  </label>
                  <input
                      type="email"
                      className="form-control"
                      placeholder="Įveskite el. paštą"
                      name="email"
                      value={email}
                      onChange={(e) => onInputChange(e)}
                      required
                  />
                </div>

                <div className="mb-3 col-md-6 text-start">
                  <label htmlFor="Password" className="form-label">
                    Slaptažodis
                  </label>
                  <input
                      type="password"
                      className="form-control"
                      placeholder="Įveskite slaptažodį"
                      name="password"
                      value={password}
                      onChange={(e) => onInputChange(e)}
                      required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Registruotis
              </button>
            </form>
            <div className="mt-3">
              Jau turite paskyrą? <Link to="/login">Prisijungti</Link>
            </div>
          </div>
        </div>
      </div>
  );
}