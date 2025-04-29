import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { auth, logout, role, userId } = useAuth();
    const navigate = useNavigate();

    // Debug console logs to check values
    useEffect(() => {
        console.log("Auth context values:", {
            token: auth?.token,
            username: auth?.username,
            role,
            userId,
        });
    }, [auth, role, userId]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Function to determine the home link based on user role
    const getHomeLink = () => {
        if (!auth?.token) return "/";

        switch(role) {
            case "CUSTOMER":
                return `/customer-dashboard/${userId}`;
            case "EMPLOYEE":
                return "/employee/calendar";
            case "ADMIN":
                return "/ViewAllUsers";
            default:
                return "/";
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <Link className="navbar-brand" to={getHomeLink()}>
                    Socialinių paslaugų sistema
                </Link>
                {/* Debug info */}
                <div
                    style={{
                        color: "white",
                        fontSize: "16px",
                        position: "absolute",
                        right: "250px",
                        top: "15px",
                    }}
                >
                    Rolė: {role === "EMPLOYEE" ? "DARBUOTOJAS" : role === "ADMIN" ? "ADMINISTRATORIUS" : role === "CUSTOMER" ? "KLIENTAS" : role || "nėra"} | ID: {userId || "nėra"}
                </div>


                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {!auth?.token && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/administracine-informacija">
                                        ADMINISTRACINĖ INFORMACIJA
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/paslaugos">
                                        PASLAUGOS
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/kontaktai">
                                        KONTAKTAI
                                    </Link>
                                </li>
                            </>
                        )}

                        {auth?.token && role === "ADMIN" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/ViewAllUsers">
                                        Vartotojai
                                    </Link>
                                </li>
                            </>
                        )}
                        {role === "EMPLOYEE" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/employee/tasks">
                                        Užduotys
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/employee/task-list">
                                        Užduočių sąrašas
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/employee/calendar">
                                        Kalendorius
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/employee/documents">
                                        Dokumentai
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/employee/appointments">
                                        Paskyrimai
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/employee/messages">
                                        Žinutės
                                    </Link>
                                </li>
                            </>
                        )}

                        {auth?.token && role === "CUSTOMER" && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to={`/customer-dashboard/${userId || ""}`}
                                    >
                                        Klientui
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="d-flex">
                        {auth?.token ? (
                            <>
                <span className="navbar-text me-3">
                  Sveiki, {auth.username}
                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-light"
                                >
                                    Atsijungti
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="btn btn-outline-light me-2" to="/login">
                                    Prisijungti
                                </Link>
                                <Link className="btn btn-outline-light" to="/signup">
                                    Registracija
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}