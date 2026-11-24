
import { useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";

import type { UserProfile } from "../../data/profiles";
import { defaultRoles } from "../../data/roles";

type ProfileEditProps = {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel?: () => void;
  canAssignRoles?: boolean;
};

export default function ProfileEdit({
  profile,
  onSave,
  onCancel,
  canAssignRoles = false,
}: ProfileEditProps) {
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    roleIds: [...profile.roleIds],
    skills: [...(profile.skills ?? [])],
  });

  const [skillsInput, setSkillsInput] = useState(
    profile.skills?.join(", ") ?? ""
  );

  const [savedMessage, setSavedMessage] = useState("");

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: CSSProperties = {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "24px",
    color: "inherit",
  };

  const sectionStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #8887",
    backgroundColor: "transparent",
    color: "inherit",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "6px",
  };

  const fieldStyle: CSSProperties = {
    marginBottom: "16px",
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  };

  // ============================================
  // FIELD UPDATES
  // ============================================

  function updateField(
    field: keyof UserProfile,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSavedMessage("");
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const field = event.target.name as keyof UserProfile;
    updateField(field, event.target.value);
  }

  // ============================================
  // ROLE SELECTION
  // ============================================

  function toggleRole(roleId: string) {
    if (!canAssignRoles) return;

    setFormData((previous) => {
      const alreadyAssigned = previous.roleIds.includes(roleId);

      return {
        ...previous,
        roleIds: alreadyAssigned
          ? previous.roleIds.filter((id) => id !== roleId)
          : [...previous.roleIds, roleId],
      };
    });
  }

  // ============================================
  // SAVE PROFILE
  // ============================================

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updatedProfile: UserProfile = {
      ...formData,
      roleIds: canAssignRoles
        ? formData.roleIds
        : profile.roleIds,
      skills: skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedProfile);
    setSavedMessage("Profile submitted successfully.");
  }

  // ============================================
  // REUSABLE TEXT FIELD
  // ============================================

  function renderField(
    label: string,
    name: keyof UserProfile,
    placeholder: string,
    required = false
  ) {
    return (
      <div style={fieldStyle}>
        <label htmlFor={`profile-${name}`} style={labelStyle}>
          {label}
        </label>

        <input
          id={`profile-${name}`}
          name={name}
          type="text"
          value={String(formData[name] ?? "")}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <main style={containerStyle}>
      <form onSubmit={handleSubmit}>
        <h1>Edit Profile</h1>

        <p style={{ opacity: 0.7 }}>
          Update your personal information, professional
          details, and organization profile.
        </p>

        {/* ====================================
            PERSONAL INFORMATION
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Personal Information</h2>

          {renderField(
            "Display Name",
            "name",
            "Enter your full name",
            true
          )}

          {renderField(
            "Username",
            "username",
            "Choose a username",
            true
          )}

          <div style={fieldStyle}>
            <label htmlFor="profile-email" style={labelStyle}>
              Email Address
            </label>

            <input
              id="profile-email"
              name="email"
              type="email"
              value={formData.email ?? ""}
              onChange={handleInputChange}
              placeholder="name@example.com"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="profile-bio" style={labelStyle}>
              About Me
            </label>

            <textarea
              id="profile-bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell others about yourself..."
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>
        </section>

        {/* ====================================
            PROFESSIONAL INFORMATION
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Professional Information</h2>

          {renderField(
            "Position / Job Title",
            "position",
            "Example: Development Lead"
          )}

          {renderField(
            "Department",
            "department",
            "Example: Development"
          )}

          <div style={fieldStyle}>
            <label htmlFor="profile-skills" style={labelStyle}>
              Skills
            </label>

            <input
              id="profile-skills"
              type="text"
              value={skillsInput}
              onChange={(event) =>
                setSkillsInput(event.target.value)
              }
              placeholder="React, TypeScript, Design"
              style={inputStyle}
            />

            <small style={{ opacity: 0.65 }}>
              Separate skills with commas.
            </small>
          </div>

          {renderField(
            "Location",
            "location",
            "Example: Washington, DC"
          )}

          {renderField(
            "Website",
            "website",
            "https://example.com"
          )}
        </section>

        {/* ====================================
            ORGANIZATION INFORMATION
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Organization Information</h2>

          {renderField(
            "Supervisor / Reports To",
            "supervisor",
            "Example: Project Manager"
          )}

          {renderField(
            "Team ID",
            "teamId",
            "Example: development"
          )}

          <p style={{ fontSize: "13px", opacity: 0.7 }}>
            These fields describe your place within
            the organization's chain of command.
          </p>
        </section>

        {/* ====================================
            PROFILE CUSTOMIZATION
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Profile Customization</h2>

          {renderField(
            "Avatar Image URL",
            "avatarUrl",
            "https://example.com/avatar.png"
          )}

          {renderField(
            "Banner Image URL",
            "bannerUrl",
            "https://example.com/banner.png"
          )}
        </section>

        {/* ====================================
            ROLE ASSIGNMENT
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Organization Roles</h2>

          <p style={{ fontSize: "13px", opacity: 0.7 }}>
            Members may have multiple roles.
            Role assignments determine organizational
            responsibilities and permissions.
          </p>

          {!canAssignRoles && (
            <p style={{ fontSize: "13px", opacity: 0.7 }}>
              Role assignments can only be changed by
              authorized organization managers.
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {defaultRoles.map((role) => (
              <label
                key={role.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: "1px solid #8885",
                  borderRadius: "8px",
                  cursor: canAssignRoles
                    ? "pointer"
                    : "default",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  disabled={!canAssignRoles}
                />

                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: role.color,
                    flexShrink: 0,
                  }}
                />

                <span>
                  <strong>{role.name}</strong>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    {role.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ====================================
            ACTION BUTTONS
        ==================================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                ...buttonStyle,
                backgroundColor: "transparent",
                color: "inherit",
                border: "1px solid #888",
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: "#2563eb",
              color: "#ffffff",
            }}
          >
            Save Profile
          </button>
        </div>

        {savedMessage && (
          <p role="status" style={{ marginTop: "12px" }}>
            {savedMessage}
          </p>
        )}
      </form>
    </main>
  );
}
