import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function PendingRequests() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("sent");
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getConnections();
      setConnections(data);
    } catch (err) {
      setError(err.message || "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id) {
    setActioningId(id);
    try {
      await api.cancelConnection(id);
      await load();
    } catch (err) {
      setError(err.message || "Could not cancel request.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleAccept(id) {
    setActioningId(id);
    try {
      await api.acceptConnection(id);
      await load();
    } catch (err) {
      setError(err.message || "Could not accept request.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDecline(id) {
    setActioningId(id);
    try {
      await api.declineConnection(id);
      await load();
    } catch (err) {
      setError(err.message || "Could not decline request.");
    } finally {
      setActioningId(null);
    }
  }

  const shown = connections.filter((c) => c.direction === tab);

  return (
    <div className="app-shell">
      <h1 className="page-title">Pending Requests</h1>
      <div className="card">
        <p className="card-heading">Pending Requests</p>
        <div className="tabs">
          <button
            className={`tab ${tab === "sent" ? "active" : ""}`}
            onClick={() => setTab("sent")}
          >
            Sent
          </button>
          <button
            className={`tab ${tab === "received" ? "active" : ""}`}
            onClick={() => setTab("received")}
          >
            Received
          </button>
        </div>

        {loading && <p className="empty-state">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && shown.length === 0 && (
          <p className="empty-state">
            {tab === "sent" ? "You haven't sent any requests yet." : "No requests received yet."}
          </p>
        )}

        {shown.map((c) => (
          <div className="request-card" key={c.id}>
            <div className="avatar">👤</div>
            <div className="match-info">
              <div className="match-name">{c.other_username}</div>
              <div className="request-status">Status: {c.status}</div>
            </div>
            {tab === "sent" && c.status === "pending" && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleCancel(c.id)}
                disabled={actioningId === c.id}
              >
                Cancel
              </button>
            )}
            {tab === "received" && c.status === "pending" && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-sm"
                  onClick={() => handleAccept(c.id)}
                  disabled={actioningId === c.id}
                >
                  Accept
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDecline(c.id)}
                  disabled={actioningId === c.id}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}

        <button className="btn btn-secondary" onClick={() => navigate("/matches")}>
          Back to matches
        </button>
      </div>
    </div>
  );
}
