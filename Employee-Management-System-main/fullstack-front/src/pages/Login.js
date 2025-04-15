import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const { email, password } = credentials;

    const onInputChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:8080/login", credentials);
            alert("Prisijungimas sėkmingas!");
            console.log(result.data); // Logged-in user data
            navigate("/"); // Redirect to homepage
        } catch (error) {
            alert("Blogi duomenys, mėginkite dar kartą."); // Invalid credentials
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
                    <h2 className="text-center m-4">Prisijungimas</h2>

                    <form onSubmit={(e) => onSubmit(e)}>
                        <div className="mb-3">
                            <label htmlFor="ElPaštas" className="form-label">
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
                            <label htmlFor="Password" className="form-label">
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

                        <button type="submit" className="btn btn-primary">
                            Prisijungti
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}