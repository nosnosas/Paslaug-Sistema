import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import "bootstrap/dist/css/bootstrap.min.css";

const TaskList = () => {
  const { auth, userId, role } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    fetchTasks();
  }, [auth, navigate, filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let endpoint = "http://localhost:8080/employee/tasks";

      if (role === "EMPLOYEE") {
        if (filter === "assigned") {
          endpoint = `http://localhost:8080/employee/tasks/assigned/${userId}`;
        } else if (filter === "created") {
          endpoint = `http://localhost:8080/employee/tasks/created/${userId}`;
        }
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const tasksData = Array.isArray(response.data) ? response.data : [];
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Nepavyko įkelti užduočių. Bandykite dar kartą vėliau.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
      };

      await axios.put(
          `http://localhost:8080/employee/tasks/${taskId}`,
          updatedTask,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
          }
      );

      // Update local state
      setTasks(
          tasks.map((task) =>
              task.id === taskId ? { ...task, status: newStatus } : task
          )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Nepavyko atnaujinti užduoties būsenos. Bandykite dar kartą.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-warning";
      case "IN_PROGRESS":
        return "bg-info";
      case "COMPLETED":
        return "bg-success";
      case "CANCELLED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    if (!priority) return "bg-secondary";

    switch (priority.toUpperCase()) {
      case "HIGH":
        return "bg-danger";
      case "MEDIUM":
        return "bg-warning";
      case "LOW":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  if (loading) {
    return (
        <div className="container py-5">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Kraunama...</span>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="card-title mb-0">Užduočių valdymas</h2>
                  <div className="btn-group">
                    <button
                        className={`btn ${
                            filter === "all" ? "btn-primary" : "btn-outline-primary"
                        }`}
                        onClick={() => setFilter("all")}
                    >
                      Visos užduotys
                    </button>
                    {role === "EMPLOYEE" && (
                        <>
                          <button
                              className={`btn ${
                                  filter === "assigned"
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                              }`}
                              onClick={() => setFilter("assigned")}
                          >
                            Man priskirtos
                          </button>
                          <button
                              className={`btn ${
                                  filter === "created"
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                              }`}
                              onClick={() => setFilter("created")}
                          >
                            Mano sukurtos
                          </button>
                        </>
                    )}
                  </div>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                )}

                {tasks.length === 0 ? (
                    <div className="text-center py-5">
                      <h4 className="text-muted">Užduočių nerasta</h4>
                      <p className="text-muted">
                        Nėra užduočių, atitinkančių jūsų dabartinį filtrą.
                      </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                        <tr>
                          <th>Pavadinimas</th>
                          <th>Terminas</th>
                          <th>Prioritetas</th>
                          <th>Būsena</th>
                          <th>Priskirta</th>
                          <th>Sukūrė</th>
                          <th>Veiksmai</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                              <td>{task.title}</td>
                              <td>
                                {task.dueDate
                                    ? format(new Date(task.dueDate), "MMM dd, yyyy")
                                    : "Nenustatyta"}
                              </td>
                              <td>
                            <span
                                className={`badge ${getPriorityBadgeClass(
                                    task.priority
                                )}`}
                            >
                              {task.priority || "Nenustatyta"}
                            </span>
                              </td>
                              <td>
                            <span
                                className={`badge ${getStatusBadgeClass(
                                    task.status
                                )}`}
                            >
                              {task.status === "PENDING" ? "Laukiama" :
                                  task.status === "IN_PROGRESS" ? "Vykdoma" :
                                      task.status === "COMPLETED" ? "Baigta" :
                                          task.status === "CANCELLED" ? "Atšaukta" : task.status}
                            </span>
                              </td>
                              <td>{task.assignedTo?.name || "Nepriskirta"}</td>
                              <td>{task.createdBy?.name || "Nežinoma"}</td>
                              <td>
                                <div className="btn-group">
                                  <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleViewTask(task)}
                                  >
                                    Peržiūrėti
                                  </button>
                                  {role === "EMPLOYEE" &&
                                      task.assignedTo?.id === userId && (
                                          <select
                                              className="form-select form-select-sm"
                                              value={task.status}
                                              onChange={(e) =>
                                                  handleStatusChange(
                                                      task.id,
                                                      e.target.value
                                                  )
                                              }
                                          >
                                            <option value="PENDING">Laukiama</option>
                                            <option value="IN_PROGRESS">
                                              Vykdoma
                                            </option>
                                            <option value="COMPLETED">Baigta</option>
                                            <option value="CANCELLED">Atšaukta</option>
                                          </select>
                                      )}
                                </div>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Details Modal */}
        {selectedTask && (
            <div
                className={`modal fade ${showModal ? "show" : ""}`}
                style={{ display: showModal ? "block" : "none" }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedTask.title}</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p>
                          <strong>Aprašymas:</strong>
                        </p>
                        <p>{selectedTask.description}</p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Terminas:</strong>{" "}
                          {format(new Date(selectedTask.dueDate), "MMM dd, yyyy")}
                        </p>
                        <p>
                          <strong>Prioritetas:</strong>{" "}
                          <span
                              className={`badge ${getPriorityBadgeClass(
                                  selectedTask.priority
                              )}`}
                          >
                        {selectedTask.priority || "Nenustatyta"}
                      </span>
                        </p>
                        <p>
                          <strong>Būsena:</strong>{" "}
                          <span
                              className={`badge ${getStatusBadgeClass(
                                  selectedTask.status
                              )}`}
                          >
                        {selectedTask.status === "PENDING" ? "Laukiama" :
                            selectedTask.status === "IN_PROGRESS" ? "Vykdoma" :
                                selectedTask.status === "COMPLETED" ? "Baigta" :
                                    selectedTask.status === "CANCELLED" ? "Atšaukta" : selectedTask.status}
                      </span>
                        </p>
                        <p>
                          <strong>Priskirta:</strong>{" "}
                          {selectedTask.assignedTo?.name || "Nepriskirta"}
                        </p>
                        <p>
                          <strong>Sukūrė:</strong>{" "}
                          {selectedTask.createdBy?.name || "Nežinoma"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                    >
                      Uždaryti
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default TaskList;