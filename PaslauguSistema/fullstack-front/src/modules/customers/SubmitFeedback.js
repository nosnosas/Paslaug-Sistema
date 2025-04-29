import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const SubmitFeedback = () => {
  const { auth, userId } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
          "http://localhost:8080/customer/feedback",
          feedback,
          {
            params: {
              customerId: userId,
            },
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
      );

      console.log("Feedback submitted:", response.data);
      setSuccess("Atsiliepimas sėkmingai pateiktas!");
      setFeedback({
        rating: 5,
        comment: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(
          error.response?.data?.message ||
          "Nepavyko pateikti atsiliepimo. Bandykite dar kartą."
      );
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
                <h2 className="card-title text-center mb-4">Pateikti atsiliepimą</h2>

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
                    <label htmlFor="rating" className="form-label">
                      Įvertinimas
                    </label>
                    <select
                        className="form-select"
                        id="rating"
                        name="rating"
                        value={feedback.rating}
                        onChange={handleChange}
                        required
                    >
                      <option value="1">1 - Blogai</option>
                      <option value="2">2 - Patenkinamai</option>
                      <option value="3">3 - Gerai</option>
                      <option value="4">4 - Labai gerai</option>
                      <option value="5">5 - Puikiai</option>
                    </select>
                    <div className="invalid-feedback">
                      Pasirinkite įvertinimą.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="comment" className="form-label">
                      Jūsų atsiliepimas
                    </label>
                    <textarea
                        className="form-control"
                        id="comment"
                        name="comment"
                        rows="5"
                        value={feedback.comment}
                        onChange={handleChange}
                        placeholder="Pasidalinkite savo patirtimi su mumis..."
                        required
                    ></textarea>
                    <div className="invalid-feedback">
                      Pateikite savo atsiliepimą.
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                      {loading ? (
                          <>
                        <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        ></span>
                            Siunčiama...
                          </>
                      ) : (
                          "Pateikti atsiliepimą"
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

export default SubmitFeedback;