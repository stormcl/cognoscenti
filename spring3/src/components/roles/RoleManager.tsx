
import { useState } from "react";
import type { CSSProperties } from "react";

import {
  defaultRoles,
  hasPermission,
  sortRolesByHierarchy,
  type OrganizationRole,
} from "../../data/roles";

import type { UserProfile } from "../../data/profiles";

import RoleEditor from "./RoleEditor";
import RoleAssignment from "./RoleAssignment";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type RoleManagerProps = {
  currentUser: UserProfile;
  members?: UserProfile[];
  initialRoles?: OrganizationRole[];

  onRolesChange?: (roles: OrganizationRole[]) => void;
  onMembersChange?: (members: UserProfile[]) => void;
};

type ManagerView = "list" | "create" | "edit" | "assign";

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoleManager({
  currentUser,
  members = [],
  initialRoles = defaultRoles,
  onRolesChange,
  onMembersChange,
}: RoleManagerProps) {
  const [roles, setRoles] = useState<OrganizationRole[]>(
    () => [...initialRoles]
  );

  const [memberList, setMemberList] = useState<UserProfile[]>(
    () => [...members]
  );

  const [view, setView] = useState<ManagerView>("list");

  const [selectedRole, setSelectedRole] =
    useState<OrganizationRole | undefined>();

  const [selectedMember, setSelectedMember] =
    useState<UserProfile | undefined>();

  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ============================================
  // PERMISSIONS
  // ============================================

  const canManageRoles = hasPermission(
    currentUser.roleIds,
    "manage_roles",
    roles
  );

  const canAssignRoles = hasPermission(
    currentUser.roleIds,
    "assign_roles",
    roles
  );

  // ============================================
  // ROLE FILTERING
  // ============================================

  const filteredRoles = sortRolesByHierarchy(roles).filter(
    (role) => {
      const query = searchQuery.trim().toLowerCase();

      return (
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
      );
    }
  );

  // ============================================
  // ROLE MANAGEMENT
  // ============================================

  function handleSaveRole(updatedRole: OrganizationRole) {
    if (!canManageRoles) {
      setErrorMessage("You cannot manage roles.");
      return;
    }

    const existingRole = roles.find(
      (role) => role.id === updatedRole.id
    );

    if (existingRole?.isSystem) {
      setErrorMessage(
        "Protected system roles cannot be edited."
      );
      return;
    }

    const updatedRoles = existingRole
      ? roles.map((role) =>
          role.id === updatedRole.id ? updatedRole : role
        )
      : [...roles, updatedRole];

    setRoles(updatedRoles);
    onRolesChange?.(updatedRoles);

    setSelectedRole(undefined);
    setErrorMessage("");
    setView("list");
  }

  function handleDeleteRole(role: OrganizationRole) {
    if (!canManageRoles || role.isSystem) {
      setErrorMessage(
        "You cannot delete this role."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete the "${role.name}" role? This will also remove it from assigned members.`
    );

    if (!confirmed) {
      return;
    }

    const updatedRoles = roles.filter(
      (item) => item.id !== role.id
    );

    const updatedMembers = memberList.map((member) => ({
      ...member,
      roleIds: member.roleIds.filter(
        (roleId) => roleId !== role.id
      ),
    }));

    setRoles(updatedRoles);
    setMemberList(updatedMembers);

    onRolesChange?.(updatedRoles);
    onMembersChange?.(updatedMembers);

    setErrorMessage("");
  }

  // ============================================
  // MEMBER ROLE ASSIGNMENT
  // ============================================

  function handleSaveMember(updatedMember: UserProfile) {
    const updatedMembers = memberList.map((member) =>
      member.id === updatedMember.id
        ? updatedMember
        : member
    );

    setMemberList(updatedMembers);
    onMembersChange?.(updatedMembers);

    setSelectedMember(undefined);
    setView("list");
  }

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: CSSProperties = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "24px",
    color: "inherit",
  };

  const cardStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  };

  const buttonStyle: CSSProperties = {
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #8885",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  };

  // ============================================
  // ROLE EDITOR VIEW
  // ============================================

  if (view === "create" || view === "edit") {
    return (
      <RoleEditor
        role={view === "edit" ? selectedRole : undefined}
        availableRoles={roles}
        canManageRoles={canManageRoles}
        onSave={handleSaveRole}
        onCancel={() => {
          setSelectedRole(undefined);
          setView("list");
        }}
      />
    );
  }

  // ============================================
  // ROLE ASSIGNMENT VIEW
  // ============================================

  if (view === "assign" && selectedMember) {
    return (
      <RoleAssignment
        member={selectedMember}
        currentUser={currentUser}
        availableRoles={roles}
        onSave={handleSaveMember}
        onCancel={() => {
          setSelectedMember(undefined);
          setView("list");
        }}
      />
    );
  }

  // ============================================
  // MAIN ROLE MANAGER
  // ============================================

  return (
    <main style={containerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "8px" }}>
            Organization Roles
          </h1>

          <p style={{ opacity: 0.7 }}>
            Manage roles, hierarchy, permissions,
            and member assignments.
          </p>
        </div>

        {canManageRoles && (
          <button
            type="button"
            onClick={() => {
              setSelectedRole(undefined);
              setView("create");
            }}
            style={{
              ...buttonStyle,
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              color: "#ffffff",
            }}
          >
            + Create Role
          </button>
        )}
      </div>

      {/* ====================================
          ROLE SEARCH
      ==================================== */}

      <section style={cardStyle}>
        <label
          htmlFor="role-manager-search"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Search Roles
        </label>

        <input
          id="role-manager-search"
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search by role name or description"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #8885",
            backgroundColor: "transparent",
            color: "inherit",
            boxSizing: "border-box",
          }}
        />
      </section>

      {/* ====================================
          ROLE LIST
      ==================================== */}

      <section style={cardStyle}>
        <h2>Role Hierarchy</h2>

        <p style={{ opacity: 0.7, fontSize: "13px" }}>
          Roles are ordered from highest to lowest.
          Higher roles have greater authority
          within the organization.
        </p>

        {filteredRoles.map((role) => {
          const assignedCount = memberList.filter(
            (member) =>
              member.roleIds.includes(role.id)
          ).length;

          return (
            <div
              key={role.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px",
                border: "1px solid #8885",
                borderRadius: "10px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: role.color,
                    flexShrink: 0,
                  }}
                />

                <div>
                  <strong>{role.name}</strong>

                  {role.isSystem && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        opacity: 0.6,
                      }}
                    >
                      System
                    </span>
                  )}

                  {role.isDefault && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        opacity: 0.6,
                      }}
                    >
                      Default
                    </span>
                  )}

                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "13px",
                      opacity: 0.7,
                    }}
                  >
                    {role.description}
                  </p>

                  <small style={{ opacity: 0.65 }}>
                    Level {role.position} |{" "}
                    {assignedCount} member(s) |{" "}
                    {role.permissions.length} permissions
                  </small>
                </div>
              </div>

              {canManageRoles && !role.isSystem && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setView("edit");
                    }}
                    style={buttonStyle}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteRole(role)
                    }
                    style={{
                      ...buttonStyle,
                      color: "#ef4444",
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredRoles.length === 0 && (
          <p>No matching roles found.</p>
        )}
      </section>

      {/* ====================================
          MEMBER ROLE ASSIGNMENTS
      ==================================== */}

      <section style={cardStyle}>
        <h2>Member Role Assignments</h2>

        {memberList.length === 0 ? (
          <p style={{ opacity: 0.7 }}>
            No members have been loaded.
          </p>
        ) : (
          memberList.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "14px",
                borderBottom: "1px solid #8885",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>{member.name}</strong>

                <p
                  style={{
                    margin: "4px 0",
                    fontSize: "13px",
                    opacity: 0.7,
                  }}
                >
                  @{member.username}
                </p>

                <small>
                  {member.roleIds
                    .map(
                      (roleId) =>
                        roles.find(
                          (role) =>
                            role.id === roleId
                        )?.name ?? roleId
                    )
                    .join(", ") || "No roles"}
                </small>
              </div>

              {canAssignRoles && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(member);
                    setView("assign");
                  }}
                  style={buttonStyle}
                >
                  Manage Roles
                </button>
              )}
            </div>
          ))
        )}
      </section>

      {errorMessage && (
        <p role="alert" style={{ color: "#ef4444" }}>
          {errorMessage}
        </p>
      )}
    </main>
  );
}
