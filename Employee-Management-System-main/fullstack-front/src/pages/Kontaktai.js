import React from "react";
import "./Home.css"; // Reuse the same styles

export default function Kontaktai() {
    return (
        <div className="container my-5">
            <h1 className="text-primary text-center mb-4">Kontaktai</h1>
            <p className="text-center mb-5">
                Susisiekite su mumis, jeigu turite klausimų ar reikia daugiau informacijos.
            </p>

            {/* Centered Contact Information Section */}
            <div className="row justify-content-center mb-4">
                <div className="col-md-6">
                    <h5 className="text-secondary text-center">Kontaktinė informacija</h5>
                    <ul className="list-unstyled text-center">
                        <li><strong>El. paštas:</strong> <a href="mailto:info@spcentras.lt">info@spcentras.lt</a></li>
                        <li><strong>Telefonas:</strong> <a href="tel:+37012345678">+370 1234 5678</a></li>
                        <li><strong>Adresas:</strong> Vilnius, Socialinės paslaugos g. 10, LT-12345</li>
                    </ul>
                    <p className="text-center">Darbo laikas: Pirmadieniais – Penktadieniais, 8:00 – 16:00.</p>
                </div>
            </div>

            {/* Organizational Structure Section */}
            <div className="my-5">
                <h5 className="text-secondary">Organizacijos struktūra</h5>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <div className="card shadow border-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">Direktorius</h6>
                                <p className="card-text">Jonas Jonaitis</p>
                                <p className="card-text"><strong>El. paštas:</strong> <a href="mailto:direktorius@spcentras.lt">direktorius@spcentras.lt</a></p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <div className="card shadow border-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">Socialinių paslaugų skyrius</h6>
                                <p className="card-text">Petras Petraitis</p>
                                <p className="card-text"><strong>El. paštas:</strong> <a href="mailto:sp.skyrius@spcentras.lt">sp.skyrius@spcentras.lt</a></p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <div className="card shadow border-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">Finansų skyrius</h6>
                                <p className="card-text">Laura Laurienė</p>
                                <p className="card-text"><strong>El. paštas:</strong> <a href="mailto:finansai@spcentras.lt">finansai@spcentras.lt</a></p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <div className="card shadow border-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">Techninė pagalba</h6>
                                <p className="card-text">Jonas Jonka</p>
                                <p className="card-text"><strong>El. paštas:</strong> <a href="mailto:pagalba@spcentras.lt">pagalba@spcentras.lt</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}