import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeeSendMessage = () => {
  const { auth, userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse recipient ID from query string if exists
  const params = new URLSearchParams(location.search);
  const preselectedRecipientId = params.get("recipientId");

  const [message, setMessage] = useState({
    subject: "",
    content: "",
  });
  const [users, setUsers] = useState({
    customers: [],
    employees: [],
  });
  const [selectedRecipientId, setSelectedRecipientId] = useState(
      preselectedRecipientId || ""
  );
  const [recipientType, setRecipientType] = useState("customer"); // customer or employee
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [auth, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      // Filter users by role
      const customerUsers = response.data.filter(
          (user) => user.role === "CUSTOMER"
      );

      // Filter employees but exclude the current user
      const employeeUsers = response.data.filter(
          (user) => user.role === "EMPLOYEE" && user.id !== userId
      );

      setUsers({
        customers: customerUsers,
        employees: employeeUsers,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage({ ...message, [name]: value });
  };

  const handleRecipientTypeChange = (e) => {
    setRecipientType(e.target.value);
    setSelectedRecipientId(""); // Reset selected recipient when changing type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!selectedRecipientId) {
      setError("Please select a recipient to send the message to.");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending message with data:", {
        message,
        senderId: userId,
        recipientId: selectedRecipientId,
      });

      // First, ensure the message object has all required fields
      const messageData = {
        subject: message.subject,
        content: message.content,
      };

      const response = await axios({
        method: "post",
        url: "http://localhost:8080/employee/messages",
        data: messageData,
        params: {
          senderId: userId,
          recipientId: selectedRecipientId,
        },
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Message sent successfully:", response.data);
      setSuccess("Message sent successfully!");
      setMessage({
        subject: "",
        content: "",
      });
      setSelectedRecipientId("");
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        setError(
            error.response.data?.message ||
            `Failed to send message. Server responded with status ${error.response.status}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        setError(
            "No response received from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Send Message</h2>

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
                  <div className="mb-4">
                    <label htmlFor="recipientType" className="form-label">
                      Recipient Type
                    </label>
                    <select
                        className="form-select"
                        id="recipientType"
                        name="recipientType"
                        value={recipientType}
                        onChange={handleRecipientTypeChange}
                        required
                    >
                      <option value="customer">Customer</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="recipientId" className="form-label">
                      Select{" "}
                      {recipientType === "customer" ? "Customer" : "Employee"}
                    </label>
                    <select
                        className="form-select"
                        id="recipientId"
                        name="recipientId"
                        value={selectedRecipientId}
                        onChange={(e) => setSelectedRecipientId(e.target.value)}
                        required
                    >
                      <option value="">Choose a {recipientType}...</option>
                      {recipientType === "customer"
                          ? users.customers.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                          ))
                          : users.employees.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                          ))}
                    </select>
                    <div className="invalid-feedback">
                      Please select a recipient to send the message to.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="subject"
                        name="subject"
                        value={message.subject}
                        onChange={handleChange}
                        placeholder="Enter message subject..."
                        required
                    />
                    <div className="invalid-feedback">
                      Please enter a subject for your message.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="content" className="form-label">
                      Message
                    </label>
                    <textarea
                        className="form-control"
                        id="content"
                        name="content"
                        rows="5"
                        value={message.content}
                        onChange={handleChange}
                        placeholder="Type your message here..."
                        required
                    ></textarea>
                    <div className="invalid-feedback">
                      Please enter your message.
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
                            Sending...
                          </>
                      ) : (
                          "Send Message"
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

export default EmployeeSendMessage;
