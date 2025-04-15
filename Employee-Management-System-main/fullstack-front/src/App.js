import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./layout/navbar";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddUser from "./users/AddUser";
import EditUser from "./users/EditUser";
import ViewUser from "./users/ViewUser";
import AdministracineInformacija from "./pages/AdministracineInformacija";
import Paslaugos from "./pages/Paslaugos"; // Import the Paslaugos page
import Kontaktai from "./pages/Kontaktai"; // Import the Kontaktai page
import Login from "./pages/Login";

function App() {
    return (
        <div className="App">
            <Router>
                <Navbar />
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/adduser" element={<AddUser />} />
                    <Route exact path="/registracija" element={<AddUser />} />
                    <Route exact path="/edituser/:id" element={<EditUser />} />
                    <Route exact path="/viewuser/:id" element={<ViewUser />} />
                    <Route
                        exact
                        path="/administracine-informacija"
                        element={<AdministracineInformacija />}
                    />
                    <Route
                        exact
                        path="/paslaugos"
                        element={<Paslaugos />}
                    /> {/* New Route for Paslaugos */}
                    <Route exact path="/kontaktai" element={<Kontaktai />} /> {/* New Route for Kontaktai */}
                    <Route exact path="/login" element={<Login />} />

                </Routes>
            </Router>
        </div>
    );
}

export default App;