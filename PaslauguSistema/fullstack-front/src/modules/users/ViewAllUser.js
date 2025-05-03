import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ViewAllUser() {
  const [users, setUsers] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState(""); // State for the delete message

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const result = await axios.get("http://localhost:8080/users");
      setUsers(result.data);
    } catch (error) {
      console.error("There was an error fetching the users!", error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/user/${userId}`);
      loadUser(); // Reload the user list after deletion
      setDeleteMessage("Naudotojas ištrintas sėkmingai!"); // Set the success message
    } catch (error) {
      console.error("There was an error deleting the user!", error);
      setDeleteMessage("There was an error deleting the user!"); // Set the error message
    }

    // Clear the delete message after 3 seconds
    setTimeout(() => setDeleteMessage(""), 3000);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 border rounded p-4 mt-2 shadow">
          <h2 className="text-center m-4">Naudotojų detalės</h2>

          {/* Add User Button */}
          <Link className="btn btn-primary add-user-btn" to={"/adduser"}>
            <i className="fas fa-plus"></i> Registruoti
          </Link>

          {/* Display the delete message */}
          {deleteMessage && (
            <div className="alert alert-info mt-3" role="alert">
              {deleteMessage}
            </div>
          )}

          {/* Table for displaying user details */}
          <table className="table table-bordered mt-4">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vardas</th>
                <th>Vartotojo vardas</th>
                <th>El. paštas</th>
                <th>Veiksmai</th> {/* New column for actions */}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Edit Button */}
                    <Link
                      to={`/edituser/${user.id}`}
                      className="btn btn-warning btn-sm me-2"
                    >
                      <i className="fas fa-edit"></i> Redaguoti
                    </Link>

                    {/* view Button */}
                    <Link
                      to={`/viewuser/${user.id}`}
                      className="btn btn-info btn-sm me-2"
                    >
                      <i className="fas fa-eye"></i> Žiūrėti
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <i className="fas fa-trash-alt"></i> Ištrinti
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
