import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // If email confirmation was required, the profile row wasn't created
      // at sign-up time (there was no session yet) — create it now.
      let profile;
      try {
        profile = await api.getMyProfile();
      } catch {
        profile = await api.createProfile(email.split("@")[0]);
      }

      if (profile.onboarding_complete) {
        navigate("/matches");
      } else if (profile.university) {
        navigate("/profile-setup");
      } else {
        navigate("/course-details");
      }
    } catch (err) {
      setError(err.message || "Could not log in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <h1 className="page-title">Welcome Back</h1>
      <div className="card">
        <p className="card-heading">Log In to CourseMate</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field">
            <label htmlFor="email">University Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="eg:yourname@uni.edu.au"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
        <p className="helper-link">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
