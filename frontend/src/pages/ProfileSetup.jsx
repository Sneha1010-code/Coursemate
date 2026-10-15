import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");
  const [lookingFor, setLookingFor] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addTag() {
    const value = newTag.trim();
    if (value && !lookingFor.includes(value)) {
      setLookingFor([...lookingFor, value]);
    }
    setNewTag("");
    setAddingTag(false);
  }

  function removeTag(tag) {
    setLookingFor(lookingFor.filter((t) => t !== tag));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.updateProfileSetup({ interests, bio, looking_for: lookingFor });
      navigate("/matches");
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <h1 className="page-title">Profile Setup</h1>
      <div className="card">
        <p className="card-heading">Set up your profile</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field">
            <label htmlFor="interests">Interests</label>
            <input
              id="interests"
              type="text"
              placeholder="eg:hiking,gaming,anime,etc"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="bio">Short bio</label>
            <textarea
              id="bio"
              rows={2}
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Looking for:</label>
            <div className="tag-row">
              {lookingFor.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {addingTag ? (
                <input
                  autoFocus
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onBlur={addTag}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  style={{ width: 110, padding: "6px 10px", borderRadius: 999 }}
                />
              ) : (
                <button
                  type="button"
                  className="tag-add"
                  onClick={() => setAddingTag(true)}
                  aria-label="Add tag"
                >
                  +
                </button>
              )}
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Saving…" : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
