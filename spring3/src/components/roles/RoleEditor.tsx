
import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import {
  allPermissions,
  createCustomRole,
  type OrganizationRole,
  type Permission,
} from "../../data/roles";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type RoleEditorProps = {
  role?: OrganizationRole;
  availableRoles?: OrganizationRole[];
  onSave: (role: OrganizationRole) => void;
  onCancel?: () => void;
  canManageRoles?: boolean;
};

// ============================================
// PERMISSION LABELS
// ============================================

const permissionLabels: Record<Permission, string> = {
  manage_organization: "Manage Organization",
  manage_roles: "Manage Roles",
  assign_roles: "Assign Roles",
  manage_members: "Manage Members",
  edit_own_profile: "Edit Own Profile",
  edit_member_profiles: "Edit Member Profiles",
  view_directory: "View Member Directory",
  manage_teams: "Manage Teams",
  manage_meetings: "Manage Meetings",
  manage_attendance: "Manage Attendance",
  view_attendance: "View Attendance",
  manage_documents: "Manage Documents",
  view_documents: "View Documents",
  manage_announcements: "Manage Announcements",
  moderate_discussions: "Moderate Discussions",
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoleEditor({
  role,
  availableRoles = [],
  onSave,
  onCancel,
  canManageRoles = false,
}: RoleEditorProps) {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(
    role?.description ?? ""
  );
  const [color, setColor] = useState(
    role?.color ?? "#64748b"
  );
  const [position, setPosition] = useState(
    role?.position ?? 20
  );
  const [permissions, setPermissions] = useState<Permission[]>(
    role?.permissions ?? []
  );
  const [isDefault, setIsDefault] = useState(
    role?.isDefault ?? false
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Reset editor when switching roles
  useEffect(() => {
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setColor(role?.color ?? "#64748b");
    setPosition(role?.position ?? 20);
    setPermissions([...(role?.permissions ?? [])]);
    setIsDefault(role?.isDefault ?? false);
    setErrorMessage("");
  }, [role]);

  // System roles are protected.
  const isProtectedRole = role?.isSystem ?? false;

  const canEdit = canManageRoles && !isProtectedRole;

  // ============================================
  // PERMISSION TOGGLE
  // ============================================

  function togglePermission(permission: Permission) {
    if (!canEdit) return;

    setPermissions((previous) =>
      previous.includes(permission)
        ? previous.filter((item) => item !== permission)
        : [...previous, permission]
    );
  }

  // ============================================
  // SAVE ROLE
  // ============================================

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!canEdit) {
      setErrorMessage(
        "You do not have permission to edit this role."
      );
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Role name is required.");
      return;
    }

    const duplicateName = availableRoles.some(
      (existingRole) =>
        existingRole.name.toLowerCase() ===
          trimmedName.toLowerCase() &&
        existingRole.id !== role?.id
    );

    if (duplicateName) {
      setErrorMessage(
        "Another role already uses this name."
      );
      return;
    }

    if (
      !Number.isInteger(position) ||
      position < 1 ||
      position > 99
    ) {
      setErrorMessage(
        "Role hierarchy must be between 1 and 99."
      );
      return;
    }

    const updatedRole: OrganizationRole = role
      ? {
          ...role,
          name: trimmedName,
          description: description.trim(),
          color,
          position,
          permissions: [...permissions],
          isDefault,
        }
      : {
          ...createCustomRole(
            trimmedName,
            color,
            description.trim(),
            permissions,
            position
          ),
          isDefault,
        };

    onSave(updatedRole);
  }

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
    marginBottom: "7px",
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid #8885",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 600,
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <main style={containerStyle}>
      <h1>{role ? "Edit Role" : "Create Role"}</h1>

      <p style={{ opacity: 0.7 }}>
        Configure a role's appearance, hierarchy,
        and permissions within Weaver.
      </p>

      {isProtectedRole && (
        <p role="alert" style={{ color: "#f59e0b" }}>
          This is a protected system role.
          Its settings cannot be edited here.
        </p>
      )}

      {!canManageRoles && (
        <p style={{ opacity: 0.7 }}>
          You do not have permission to manage roles.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* ====================================
            ROLE INFORMATION
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Role Information</h2>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="role-name" style={labelStyle}>
              Role Name
            </label>

            <input
              id="role-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Example: Project Coordinator"
              maxLength={50}
              required
              disabled={!canEdit}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="role-description"
              style={labelStyle}
            >
              Description
            </label>

            <textarea
              id="role-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe this role's responsibilities"
              rows={4}
              maxLength={300}
              disabled={!canEdit}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="role-color" style={labelStyle}>
              Role Color
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <input
                id="role-color"
                type="color"
                value={color}
                onChange={(event) =>
                  setColor(event.target.value)
                }
                disabled={!canEdit}
                style={{
                  width: "50px",
                  height: "42px",
                  cursor: canEdit
                    ? "pointer"
                    : "not-allowed",
                }}
              />

              <span>{color.toUpperCase()}</span>
            </div>
          </div>
        </section>

        {/* ====================================
            ROLE PREVIEW
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Role Preview</h2>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              border: `1px solid ${color}`,
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />

            {name || "New Role"}
          </span>
        </section>

        {/* ====================================
            ROLE HIERARCHY
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Role Hierarchy</h2>

          <p style={{ opacity: 0.7, fontSize: "13px" }}>
            Higher numbers indicate higher-ranking roles.
            Role hierarchy affects which roles managers
            may assign or modify.
          </p>

          <label
            htmlFor="role-position"
            style={labelStyle}
          >
            Hierarchy Level
          </label>

          <input
            id="role-position"
            type="number"
            min={1}
            max={99}
            step={1}
            value={position}
            onChange={(event) =>
              setPosition(Number(event.target.value))
            }
            disabled={!canEdit}
            style={inputStyle}
          />
        </section>

        {/* ====================================
            ROLE PERMISSIONS
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Permissions</h2>

          <p style={{ opacity: 0.7, fontSize: "13px" }}>
            Select which actions members with this
            role are allowed to perform.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            {allPermissions.map((permission) => (
              <label
                key={permission}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  border: "1px solid #8885",
                  borderRadius: "8px",
                  opacity: canEdit ? 1 : 0.55,
                }}
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() =>
                    togglePermission(permission)
                  }
                  disabled={!canEdit}
                />

                <span style={{ fontSize: "13px" }}>
                  {permissionLabels[permission]}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ====================================
            DEFAULT ROLE
        ==================================== */}

        <section style={sectionStyle}>
          <h2>Default Role</h2>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) =>
                setIsDefault(event.target.checked)
              }
              disabled={!canEdit}
            />

            <span>
              Automatically assign this role
              to new organization members.
            </span>
          </label>
        </section>

        {/* ====================================
            ERROR MESSAGE
        ==================================== */}

        {errorMessage && (
          <p role="alert" style={{ color: "#ef4444" }}>
            {errorMessage}
          </p>
        )}

        {/* ====================================
            ACTION BUTTONS
        ==================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={buttonStyle}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!canEdit}
            style={{
              ...buttonStyle,
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              color: "#ffffff",
              opacity: canEdit ? 1 : 0.5,
              cursor: canEdit
                ? "pointer"
                : "not-allowed",
            }}
          >
            {role ? "Save Changes" : "Create Role"}
          </button>
        </div>
      </form>
    </main>
  );
}
