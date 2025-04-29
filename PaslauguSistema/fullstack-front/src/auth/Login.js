import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Login() {
  let navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { username, password } = credentials;

  const onInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
          "http://localhost:8080/auth/login",
          credentials
      );

      if (response.data.status === "success") {
        console.log("Login response:", response.data);

        const userId = response.data.userId || response.data.id;
        const userRole = response.data.role;

        // Make sure to include userId in the login data
        login({
          token: response.data.token,
          username: response.data.username,
          role: userRole,
          userId: userId,
        });

        // Redirect based on role
        if (userRole === "CUSTOMER") {
          navigate(`/customer-dashboard/${userId}`);
        } else if (userRole === "EMPLOYEE") {
          navigate("/employee/calendar");
        } else if (userRole === "ADMIN") {
          navigate("/ViewAllUsers");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data) {
        setError(error.response.data.Error || "Prisijungti nepavyko");
      } else {
        setError("Prisijungti nepavyko. Bandykite dar kartą.");
      }
    }
  };

  return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
            <h2 className="text-center m-4">Prisijungimas</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
            )}

            <form onSubmit={(e) => onSubmit(e)}>
              <div className="mb-3">
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

              <div className="mb-3">
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

              <button type="submit" className="btn btn-primary">
                Prisijungti
              </button>
              <div className="mt-3">
                <p>
                  Neturite paskyros? <Link to="/signup">Registruotis</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}