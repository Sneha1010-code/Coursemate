import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const CONNECT_LABELS = {
  pending: "Pending",
  accepted: "Connected",
  declined: "Declined",
};

export default function BrowseMatches() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message || "Could not load matches.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConnect(id) {
    setActioningId(id);
    try {
      await api.sendConnectionRequest(id);
      await load();
    } catch (err) {
      setError(err.message || "Could not send request.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <div className="topnav">
        <Link to="/requests">Requests</Link>
        <button onClick={handleLogout}>Log out</button>
      </div>
      <h1 className="page-title">Browse Matches</h1>
      <div className="card">
        <p className="card-heading">People in Your Tutorial</p>

        {loading && <p className="empty-state">Loading matches…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && matches.length === 0 && (
          <p className="empty-state">
            No one else in your tutorial group yet. Check back soon!
          </p>
        )}

        {matches.map((m) => (
          <div className="match-card" key={m.id}>
            <div className="avatar">👤</div>
            <div className="match-info">
              <div className="match-name">{m.username}</div>
              <div className="match-detail">
                {m.course}
                {m.tutorial_group ? ` · ${m.tutorial_group}` : ""}
              </div>
              {m.interests && <div className="match-detail">Interests: {m.interests}</div>}
            </div>
            {m.connection_status ? (
              <span className={`status-badge status-${m.connection_status}`}>
                {CONNECT_LABELS[m.connection_status]}
              </span>
            ) : (
              <button
                className="btn btn-sm"
                onClick={() => handleConnect(m.id)}
                disabled={actioningId === m.id}
              >
                {actioningId === m.id ? "…" : "Connect"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
