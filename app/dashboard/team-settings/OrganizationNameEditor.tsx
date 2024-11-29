// components/OrganizationNameEditor.tsx
import React, { useState } from "react";

interface OrganizationNameEditorProps {
  initialName?: string;
  onUpdate: (newName: string) => void;
}

const OrganizationNameEditor: React.FC<OrganizationNameEditorProps> = ({
  initialName,
  onUpdate,
}) => {
  const [name, setName] = useState(initialName || "");
  const [isEditing, setIsEditing] = useState(!initialName); // Start editing if no initial name
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Organization name cannot be empty.");
      return;
    }

    setError(null);
    onUpdate(name);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <h3>Create Team Name</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={"Enter team name"}
          />
          <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <div>
          <h2>Organization Name: {name || "Not Set"}</h2>
          {!initialName && (
            <button onClick={() => setIsEditing(true)}>Create</button>
          )}
          {initialName && (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationNameEditor;
