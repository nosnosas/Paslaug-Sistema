import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const CustomerMessages = () => {
  const { auth, userId } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatMessagesRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    console.log("Customer Messages Component Mounted");
    console.log("Current User ID:", userId);
    console.log("Auth token:", auth.token);

    // Fetch employees and messages
    fetchEmployees();
    fetchMessages(true);
  }, [auth, navigate]);

  const fetchEmployees = async () => {
    try {
      console.log("Fetching employees...");
      const response = await axios.get("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const employeeUsers = response.data.filter(
          (user) => user.role === "EMPLOYEE"
      );
      console.log("Fetched employees:", employeeUsers);
      setEmployees(employeeUsers);
    } catch (error) {
      console.error("Error fetching employees:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Nepavyko įkelti darbuotojų. Bandykite dar kartą vėliau.");
    }
  };

  const fetchMessages = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      console.log("Fetching messages for customer ID:", userId);
      console.log("Auth token:", auth.token);

      const response = await axios.get(
          `http://localhost:8080/customer/messages/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );

      console.log("API Response Status:", response.status);
      console.log("API Response Headers:", response.headers);
      console.log("API Response Data:", response.data);

      // Check if response.data is an object with sent, received, and unread properties
      if (response.data && typeof response.data === "object") {
        const sent = Array.isArray(response.data.sent)
            ? response.data.sent
            : [];
        const received = Array.isArray(response.data.received)
            ? response.data.received
            : [];
        const unread = Array.isArray(response.data.unread)
            ? response.data.unread
            : [];

        console.log("Sent messages:", sent);
        console.log("Received messages:", received);
        console.log("Unread messages:", unread);

        // Combine and sort all messages
        const allMessages = [...sent, ...received].sort(
            (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
        );
        console.log("Combined messages:", allMessages);
        setMessages(allMessages);
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Gautas netikėtas duomenų formatas iš serverio");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error config:", error.config);
      console.error("Error details:", error.response?.data || error.message);
      setError("Nepavyko įkelti žinučių. Bandykite dar kartą vėliau.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when selected employee changes
  useEffect(() => {
    if (selectedEmployee) {
      scrollToBottom();
    }
  }, [selectedEmployee]);

  // Set up polling for new messages
  useEffect(() => {
    // Start polling when component mounts
    pollingIntervalRef.current = setInterval(() => {
      if (auth?.token) {
        fetchMessages(false);
      }
    }, 3000); // Check every 3 seconds

    // Clean up polling when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [auth?.token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedEmployee) return;

    try {
      console.log("Sending message to employee:", selectedEmployee.id);
      console.log("Message data:", {
        subject: "Chat Message",
        content: newMessage,
        senderId: userId,
        recipientId: selectedEmployee.id,
      });

      const messageData = {
        subject: "Pokalbio žinutė",
        content: newMessage,
      };

      const response = await axios.post(
          "http://localhost:8080/customer/messages",
          messageData,
          {
            params: {
              senderId: userId,
              recipientId: selectedEmployee.id,
            },
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );

      console.log("Message sent successfully:", response.data);
      setNewMessage("");

      // Add the new message to the messages array
      if (response.data) {
        setMessages((prevMessages) => [...prevMessages, response.data]);
      }

      // Refresh messages to ensure we have the latest state
      fetchMessages(false);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error config:", error.config);
      console.error("Error details:", error.response?.data || error.message);
      setError("Nepavyko išsiųsti žinutės. Bandykite dar kartą.");
    }
  };

  const getMessagesWithEmployee = (employeeId) => {
    if (!Array.isArray(messages)) {
      console.error("Messages is not an array:", messages);
      return [];
    }

    console.log("All messages before filtering:", messages);
    console.log("Filtering messages for employee:", employeeId);
    console.log("Current user ID:", userId);

    const filteredMessages = messages.filter((message) => {
      // Convert IDs to numbers for comparison
      const messageSenderId = Number(message.sender?.id);
      const messageRecipientId = Number(message.recipient?.id);
      const currentUserId = Number(userId);
      const selectedEmployeeId = Number(employeeId);

      const isSentByUser = messageSenderId === currentUserId;
      const isReceivedByUser = messageRecipientId === currentUserId;
      const isFromSelectedEmployee = messageSenderId === selectedEmployeeId;
      const isToSelectedEmployee = messageRecipientId === selectedEmployeeId;

      console.log("Message:", {
        id: message.id,
        senderId: messageSenderId,
        recipientId: messageRecipientId,
        currentUserId,
        selectedEmployeeId,
        isSentByUser,
        isReceivedByUser,
        isFromSelectedEmployee,
        isToSelectedEmployee,
      });

      return (
          (isSentByUser && isToSelectedEmployee) ||
          (isReceivedByUser && isFromSelectedEmployee)
      );
    });

    console.log("Filtered messages:", filteredMessages);
    console.log("Filtered messages details:", {
      total: filteredMessages.length,
      sent: filteredMessages.filter(
          (m) => Number(m.sender?.id) === Number(userId)
      ).length,
      received: filteredMessages.filter(
          (m) => Number(m.recipient?.id) === Number(userId)
      ).length,
      unread: filteredMessages.filter(
          (m) => !m.isRead && Number(m.recipient?.id) === Number(userId)
      ).length,
    });

    return filteredMessages;
  };

  // Add useEffect to log messages when they change
  useEffect(() => {
    console.log("Messages state updated:", messages);
  }, [messages]);

  // Add useEffect to log selected employee changes
  useEffect(() => {
    if (selectedEmployee) {
      console.log("Selected employee changed:", selectedEmployee);
      const messagesWithEmployee = getMessagesWithEmployee(selectedEmployee.id);
      console.log("Messages with selected employee:", messagesWithEmployee);
    }
  }, [selectedEmployee, messages]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
      <div className="container-fluid">
        <div className="row">
          {/* Employee List */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Darbuotojai</h5>
              </div>
              <div className="list-group list-group-flush">
                {employees.length === 0 ? (
                    <div className="text-center p-3">
                      <p className="text-muted mb-0">Nėra galimų darbuotojų</p>
                    </div>
                ) : (
                    employees.map((employee) => (
                        <button
                            key={employee.id}
                            className={`list-group-item list-group-item-action ${
                                selectedEmployee?.id === employee.id ? "active" : ""
                            }`}
                            onClick={() => {
                              console.log("Employee selected:", employee);
                              setSelectedEmployee(employee);
                            }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{employee.name}</h6>
                              <small className="text-muted">
                                {getMessagesWithEmployee(employee.id).length > 0
                                    ? "Aktyvus pokalbis"
                                    : "Nėra žinučių"}
                              </small>
                            </div>
                            {getMessagesWithEmployee(employee.id).some(
                                (m) => !m.isRead && m.recipient?.id === userId
                            ) && (
                                <span className="badge bg-primary rounded-pill">
                          Naujas
                        </span>
                            )}
                          </div>
                        </button>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-md-9">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  {selectedEmployee
                      ? `Pokalbis su ${selectedEmployee.name}`
                      : "Pasirinkite darbuotoją, kad pradėtumėte pokalbį"}
                </h5>
              </div>
              <div className="card-body">
                {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Kraunama...</span>
                      </div>
                    </div>
                ) : selectedEmployee ? (
                    <>
                      <div
                          ref={chatMessagesRef}
                          className="chat-messages"
                          style={{
                            height: "400px",
                            overflowY: "auto",
                            padding: "1rem",
                          }}
                      >
                        {getMessagesWithEmployee(selectedEmployee.id).map(
                            (message) => {
                              console.log("Rendering message:", message);
                              const isSentByUser =
                                  Number(message.sender?.id) === Number(userId);
                              return (
                                  <div
                                      key={message.id}
                                      className={`message ${
                                          isSentByUser ? "text-end" : "text-start"
                                      } mb-3`}
                                  >
                                    <div
                                        className={`d-inline-block p-2 rounded ${
                                            isSentByUser
                                                ? "bg-primary text-white"
                                                : "bg-light"
                                        }`}
                                        style={{
                                          maxWidth: "70%",
                                          borderRadius: "15px",
                                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                      <div className="message-content">
                                        {message.content}
                                      </div>
                                      <small
                                          className={`d-block ${
                                              isSentByUser ? "text-white-50" : "text-muted"
                                          }`}
                                      >
                                        {formatDate(message.sentAt)}
                                      </small>
                                    </div>
                                  </div>
                              );
                            }
                        )}
                      </div>

                      <form onSubmit={sendMessage} className="mt-3">
                        <div className="input-group">
                          <input
                              type="text"
                              className="form-control"
                              placeholder="Įveskite savo žinutę..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                          />
                          <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={!newMessage.trim()}
                          >
                            Siųsti
                          </button>
                        </div>
                      </form>
                    </>
                ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">
                        Pasirinkite darbuotoją iš sąrašo, kad pradėtumėte pokalbį
                      </p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CustomerMessages;