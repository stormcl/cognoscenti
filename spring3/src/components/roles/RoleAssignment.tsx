
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import {
  defaultRoles,
  getHighestRole,
  hasPermission,
  type OrganizationRole,
} from "../../data/roles";

import type { UserProfile } from "../../data/profiles";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type RoleAssignmentProps = {
  member: UserProfile;
  currentUser: UserProfile;
  availableRoles?: OrganizationRole[];
  onSave: (updatedMember: UserProfile) => void;
  onCancel?: () => void;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoleAssignment({
  member,
  currentUser,
  availableRoles = defaultRoles,
  onSave,
  onCancel,
}: RoleAssignmentProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    () => [...member.roleIds]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset selection when switching members
  useEffect(() => {
    setSelectedRoleIds([...member.roleIds]);
    setSearchQuery("");
    setErrorMessage("");
  }, [member]);

  // ============================================
  // PERMISSION CHECKS
  // ============================================

  const canAssign = hasPermission(
    currentUser.roleIds,
    "assign_roles",
    availableRoles
  );

  const highestManagerRole = getHighestRole(
    currentUser.roleIds,
    availableRoles
  );

  const managerPosition = highestManagerRole?.position ?? 0;

  const memberHighestRole = getHighestRole(
    member.roleIds,
    availableRoles
  );

  const isSelf = currentUser.id === member.id;

  // Prevent assigning roles at or above
  // the manager's highest role.
  function canModifyRole(role: OrganizationRole): boolean {
    if (!canAssign || isSelf) {
      return false;
    }

    if (role.id === "owner") {
      return false;
    }

    if (role.isSystem && role.id === "member") {
      return false;
    }

    if (role.position >= managerPosition) {
      return false;
    }

    // Prevent modifying members who already
    // outrank or equal the current manager.
    if (
      memberHighestRole &&
      memberHighestRole.position >= managerPosition
    ) {
      return false;
    }

    return true;
  }

  // ============================================
  // SEARCH AND SORT ROLES
  // ============================================

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...availableRoles]
      .filter(
        (role) =>
          role.name.toLowerCase().includes(query) ||
          role.description.toLowerCase().includes(query)
      )
      .sort((a, b) => b.position - a.position);
  }, [availableRoles, searchQuery]);

  // ============================================
  // TOGGLE ROLE
  // ============================================

  function toggleRole(role: OrganizationRole) {
    if (!canModifyRole(role)) {
      return;
    }

    setSelectedRoleIds((previous) =>
      previous.includes(role.id)
        ? previous.filter((id) => id !== role.id)
        : [...previous, role.id]
    );

    setErrorMessage("");
  }

  // ============================================
  // SAVE ROLE ASSIGNMENTS
  // ============================================

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAssign || isSelf) {
      setErrorMessage(
        "You do not have permission to change these roles."
      );
      return;
    }

    const previousRoles = new Set(member.roleIds);
    const nextRoles = new Set(selectedRoleIds);

    const changedRoleIds = [
      ...new Set([
        ...member.roleIds,
        ...selectedRoleIds,
      ]),
    ].filter(
      (roleId) =>
        previousRoles.has(roleId) !== nextRoles.has(roleId)
    );

    const unauthorizedChange = changedRoleIds.some(
      (roleId) => {
        const role = availableRoles.find(
          (item) => item.id === roleId
        );

        return !role || !canModifyRole(role);
      }
    );

    if (unauthorizedChange) {
      setErrorMessage(
        "One or more role changes are not permitted."
      );
      return;
    }

    const updatedMember: UserProfile = {
      ...member,
      roleIds: [...selectedRoleIds],
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedMember);
  }

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "24px",
    color: "inherit",
  };

  const cardStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
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
      <h1>Assign Member Roles</h1>

      <p style={{ opacity: 0.7 }}>
        Manage organizational roles and responsibilities
        for individual members.
      </p>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>
          {member.name}
        </h2>

        <p style={{ opacity: 0.7 }}>
          @{member.username}
        </p>

        <p>
          {member.position || "Organization Member"}
          {member.department
            ? ` | ${member.department}`
            : ""}
        </p>
      </section>

      <form onSubmit={handleSubmit}>
        <section style={cardStyle}>
          <h2>Available Roles</h2>

          <label
            htmlFor="role-search"
            style={{
              display: "block",
              marginBottom: "8px",
            }}
          >
            Search roles
          </label>

          <input
            id="role-search"
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search by name or description"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #8885",
              backgroundColor: "transparent",
              color: "inherit",
              boxSizing: "border-box",
              marginBottom: "20px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {filteredRoles.map((role) => {
              const checked =
                selectedRoleIds.includes(role.id);

              const editable = canModifyRole(role);

              return (
                <label
                  key={role.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px",
                    border: checked
                      ? `1px solid ${role.color}`
                      : "1px solid #8885",
                    borderRadius: "10px",
                    opacity: editable ? 1 : 0.55,
                    cursor: editable
                      ? "pointer"
                      : "not-allowed",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!editable}
                    onChange={() => toggleRole(role)}
                  />

                  <span
                    aria-hidden="true"
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: role.color,
                      flexShrink: 0,
                    }}
                  />

                  <span style={{ flex: 1 }}>
                    <strong>{role.name}</strong>

                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        opacity: 0.7,
                        marginTop: "4px",
                      }}
                    >
                      {role.description}
                    </span>
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    Level {role.position}
                  </span>
                </label>
              );
            })}

            {filteredRoles.length === 0 && (
              <p>No matching roles found.</p>
            )}
          </div>
        </section>

        {errorMessage && (
          <p role="alert" style={{ color: "#ef4444" }}>
            {errorMessage}
          </p>
        )}

        {!canAssign && (
          <p style={{ opacity: 0.7 }}>
            You do not have permission to assign roles.
          </p>
        )}

        {isSelf && (
          <p style={{ opacity: 0.7 }}>
            You cannot change your own roles.
          </p>
        )}

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
            disabled={!canAssign || isSelf}
            style={{
              ...buttonStyle,
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              color: "#ffffff",
              opacity: !canAssign || isSelf ? 0.5 : 1,
              cursor:
                !canAssign || isSelf
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Save Roles
          </button>
        </div>
      </form>
    </main>
  );
}
