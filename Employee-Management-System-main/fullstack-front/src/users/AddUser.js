import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { email, password } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/user", user);
      console.log("Vartotojas užregistruotas:", response.data);
      alert("Registracija sėkminga!");
      navigate("/");
    } catch (error) {
      console.error("Klaida registruojant vartotoją:", error.response || error.message);
      if (error.response && error.response.status === 400) {
        alert(error.response.data);
      } else {
        alert("Nepavyko užregistruoti vartotojo. Bandykite dar kartą.");
      }
    }
  };

  return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
            <h2 className="text-center m-4">Registracija</h2>

            <form onSubmit={(e) => onSubmit(e)}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  El. paštas
                </label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Įrašykite savo el. paštą"
                    name="email"
                    value={email}
                    onChange={(e) => onInputChange(e)}
                    required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Slaptažodis
                </label>
                <input
                    type="password"
                    className="form-control"
                    placeholder="Įrašykite savo slaptažodį"
                    name="password"
                    value={password}
                    onChange={(e) => onInputChange(e)}
                    required
                />
              </div>

              <button type="submit" className="btn btn-outline-primary">
                Registruotis
              </button>
              <Link to="/" className="btn btn-outline-danger mx-2">
                Atšaukti
              </Link>
            </form>
          </div>
        </div>
      </div>
  );
}