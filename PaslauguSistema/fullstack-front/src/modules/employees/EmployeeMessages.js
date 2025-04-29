import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeeMessages = () => {
  const { auth, userId } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatMessagesRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isInitialLoad = useRef(true);

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

  // Scroll to bottom when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      scrollToBottom();
    }
  }, [selectedCustomer]);

  // Set up polling for new messages
  useEffect(() => {
    // Start polling when component mounts
    pollingIntervalRef.current = setInterval(() => {
      if (auth?.token) {
        fetchMessages(false); // Pass false to indicate this is a polling update
      }
    }, 3000); // Check every 3 seconds

    // Clean up polling when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    console.log("Employee Messages Component Mounted");
    console.log("Current User ID:", userId);
    fetchMessages(true); // Pass true to indicate this is initial load
  }, [auth, navigate]);

  const fetchMessages = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      console.log("Fetching messages for employee ID:", userId);
      const response = await axios.get(
          `http://localhost:8080/employee/messages/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );

      console.log("API Response:", response.data);
      const { sent = [], received = [], unread = [] } = response.data;
      console.log("Sent messages:", sent);
      console.log("Received messages:", received);
      console.log("Unread messages:", unread);

      // Combine and sort all messages
      const allMessages = [...sent, ...received].sort(
          (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
      );
      console.log("Combined messages:", allMessages);
      setMessages(allMessages);

      // Get unique customers who have messaged the employee
      const uniqueCustomers = new Map();
      received.forEach((message) => {
        if (message.sender && !uniqueCustomers.has(message.sender.id)) {
          uniqueCustomers.set(message.sender.id, message.sender);
        }
      });
      const customerList = Array.from(uniqueCustomers.values());
      console.log("Unique customers:", customerList);
      setCustomers(customerList);
    } catch (error) {
      console.error("Error fetching messages:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Failed to load messages. Please try again later.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCustomer) return;

    try {
      console.log("Sending message to customer:", selectedCustomer.id);
      const messageData = {
        subject: "Chat Message",
        content: newMessage,
      };

      const response = await axios.post(
          "http://localhost:8080/employee/messages",
          messageData,
          {
            params: {
              senderId: userId,
              recipientId: selectedCustomer.id,
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
      fetchMessages(false); // Pass false to indicate this is not initial load
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Failed to send message. Please try again.");
    }
  };

  const getMessagesWithCustomer = (customerId) => {
    if (!Array.isArray(messages)) {
      console.error("Messages is not an array:", messages);
      return [];
    }

    console.log("All messages before filtering:", messages);
    console.log("Filtering messages for customer:", customerId);
    console.log("Current user ID:", userId);

    const filteredMessages = messages.filter((message) => {
      // Convert IDs to numbers for comparison
      const messageSenderId = Number(message.sender?.id);
      const messageRecipientId = Number(message.recipient?.id);
      const currentUserId = Number(userId);
      const selectedCustomerId = Number(customerId);

      const isSentByUser = messageSenderId === currentUserId;
      const isReceivedByUser = messageRecipientId === currentUserId;
      const isFromSelectedCustomer = messageSenderId === selectedCustomerId;
      const isToSelectedCustomer = messageRecipientId === selectedCustomerId;

      console.log("Message:", {
        id: message.id,
        senderId: messageSenderId,
        recipientId: messageRecipientId,
        currentUserId,
        selectedCustomerId,
        isSentByUser,
        isReceivedByUser,
        isFromSelectedCustomer,
        isToSelectedCustomer,
      });

      return (
          (isSentByUser && isToSelectedCustomer) ||
          (isReceivedByUser && isFromSelectedCustomer)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
      <div className="container-fluid py-4 my-4">
        <div className="row">
          {/* Customer List */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Klientai</h5>
              </div>
              <div className="list-group list-group-flush">
                {customers.length === 0 ? (
                    <div className="text-center p-3">
                      <p className="text-muted mb-0">
                        Klientai Jums dar nerašė
                      </p>
                    </div>
                ) : (
                    customers.map((customer) => (
                        <button
                            key={customer.id}
                            className={`list-group-item list-group-item-action ${
                                selectedCustomer?.id === customer.id ? "active" : ""
                            }`}
                            onClick={() => {
                              console.log("Customer selected:", customer);
                              setSelectedCustomer(customer);
                            }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{customer.name}</h6>
                              <small className="text-muted">
                                {getMessagesWithCustomer(customer.id).length > 0
                                    ? "Aktyvus susirašinėjimas"
                                    : "Nėra žinučių"}
                              </small>
                            </div>
                            {getMessagesWithCustomer(customer.id).some(
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
                  {selectedCustomer
                      ? `Susirašinėjimas su ${selectedCustomer.name}`
                      : "Pasirinkti klientą"}
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
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                ) : selectedCustomer ? (
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
                        {getMessagesWithCustomer(selectedCustomer.id).map(
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
                              placeholder="Rašykite čia..."
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
                        Pasirinkti klientą žinutės atsakymui
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

export default EmployeeMessages;
