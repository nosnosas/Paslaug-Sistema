import React from "react";
import { Link } from "react-router-dom";

export default function navbar() {
  return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container-fluid">
            {/* Brand Name */}
            <Link className="navbar-brand" to="/">
              Socialinių paslaugų sistema
            </Link>
            {/* Navbar Toggler for Mobile Screens */}
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            {/* Navbar Links */}
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto">
                {/* Button: ADMINISTRACINĖ INFORMACIJA */}
                <li className="nav-item">
                  <Link className="nav-link" to="/administracine-informacija">
                    ADMINISTRACINĖ INFORMACIJA
                  </Link>
                </li>
                {/* Button: PASLAUGOS */}
                <li className="nav-item">
                  <Link className="nav-link" to="/paslaugos">
                    PASLAUGOS
                  </Link>
                </li>
                {/* Button: KONTAKTAI */}
                <li className="nav-item">
                  <Link className="nav-link" to="/kontaktai">
                    KONTAKTAI
                  </Link>
                </li>
                {/* Button: PRISIJUNGIMAS */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    PRISIJUNGIMAS
                  </Link>
                </li>
                {/* Button: REGISTRACIJA */}
                <li className="nav-item">
                  <Link className="nav-link" to="/registracija">
                    REGISTRACIJA
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
  );
}