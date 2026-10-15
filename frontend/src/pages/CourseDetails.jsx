import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function CourseDetails() {
  const navigate = useNavigate();
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [tutorialGroup, setTutorialGroup] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.updateCourseDetails({
        university,
        course,
        tutorial_group: tutorialGroup,
      });
      navigate("/profile-setup");
    } catch (err) {
      setError(err.message || "Could not save your course details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <h1 className="page-title">Course Details</h1>
      <div className="card">
        <p className="card-heading">Your Course Details</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field">
            <label htmlFor="university">University</label>
            <input
              id="university"
              type="text"
              required
              placeholder="eg:La Trobe University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="course">Course</label>
            <input
              id="course"
              type="text"
              required
              placeholder="eg:Bachelor's of business"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tutorial">Tutorial Group</label>
            <input
              id="tutorial"
              type="text"
              required
              placeholder="eg:tutorial 3,wednesday"
              value={tutorialGroup}
              onChange={(e) => setTutorialGroup(e.target.value)}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
