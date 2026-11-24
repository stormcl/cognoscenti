
import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import {
  allPermissions,
  type OrganizationRole,
  type Permission,
} from "../../data/roles";

type RolePermissionsProps = {
  role: OrganizationRole;
  onSave: (updatedRole: OrganizationRole) => void;
  onCancel?: () => void;
  canManagePermissions?: boolean;
  allowedPermissions?: Permission[];
};

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

const categories: {
  title: string;
  permissions: Permission[];
}[] = [
  {
    title: "Organization",
    permissions: [
      "manage_organization",
      "manage_members",
      "manage_teams",
      "view_directory",
    ],
  },
  {
    title: "Roles and Permissions",
    permissions: [
      "manage_roles",
      "assign_roles",
    ],
  },
  {
    title: "Profiles",
    permissions: [
      "edit_own_profile",
      "edit_member_profiles",
    ],
  },
  {
    title: "Meetings and Attendance",
    permissions: [
      "manage_meetings",
      "manage_attendance",
      "view_attendance",
    ],
  },
  {
    title: "Documents and Communication",
    permissions: [
      "manage_documents",
      "view_documents",
      "manage_announcements",
      "moderate_discussions",
    ],
  },
];

export default function RolePermissions({
  role,
  onSave,
  onCancel,
  canManagePermissions = false,
  allowedPermissions,
}: RolePermissionsProps) {
  const [selectedPermissions, setSelectedPermissions] =
    useState<Permission[]>([...role.permissions]);

  const [error, setError] = useState("");

  const canEdit =
    canManagePermissions && !role.isSystem;

  function canChange(permission: Permission): boolean {
    return (
      canEdit &&
      (!allowedPermissions ||
        allowedPermissions.includes(permission))
    );
  }

  function togglePermission(permission: Permission) {
    if (!canChange(permission)) return;

    setSelectedPermissions((previous) =>
      previous.includes(permission)
        ? previous.filter((item) => item !== permission)
        : [...previous, permission]
    );

    setError("");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      setError("You cannot edit this role.");
      return;
    }

    const changedPermissions = allPermissions.filter(
      (permission) =>
        role.permissions.includes(permission) !==
        selectedPermissions.includes(permission)
    );

    if (changedPermissions.some((p) => !canChange(p))) {
      setError("You cannot change these permissions.");
      return;
    }

    onSave({
      ...role,
      permissions: selectedPermissions,
    });
  }

  const cardStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #8885",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
  };

  return (
    <form onSubmit={handleSave}>
      <div style={{ marginBottom: "24px" }}>
        <h1>Role Permissions</h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: role.color,
            }}
          />

          <h2>{role.name}</h2>
        </div>

        <p>{role.description}</p>

        <p style={{ opacity: 0.7 }}>
          {selectedPermissions.length} of{" "}
          {allPermissions.length} permissions enabled
        </p>

        {role.isSystem && (
          <p>
            This is a protected system role.
            Its permissions cannot be edited here.
          </p>
        )}
      </div>

      {categories.map((category) => (
        <section
          key={category.title}
          style={cardStyle}
        >
          <h3>{category.title}</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {category.permissions.map((permission) => (
              <label
                key={permission}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px",
                  border: "1px solid #8883",
                  borderRadius: "8px",
                  cursor: canChange(permission)
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(
                    permission
                  )}
                  disabled={!canChange(permission)}
                  onChange={() =>
                    togglePermission(permission)
                  }
                />

                <span>{permissionLabels[permission]}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {error && (
        <p role="alert" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
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
            background: "#2563eb",
            color: "#ffffff",
            opacity: canEdit ? 1 : 0.5,
          }}
        >
          Save Permissions
        </button>
      </div>
    </form>
  );
}
