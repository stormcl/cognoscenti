
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import {
  defaultRoles,
  hasPermission,
  type OrganizationRole,
} from "../data/roles";

import {
  defaultProfiles,
  type UserProfile,
} from "../data/profiles";

import RoleManager from "../components/roles/RoleManager";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type RoleManagementPageProps = {
  currentUser?: UserProfile;
  initialRoles?: OrganizationRole[];
  initialMembers?: UserProfile[];

  onRolesUpdate?: (roles: OrganizationRole[]) => void;
  onMembersUpdate?: (members: UserProfile[]) => void;

  onBack?: () => void;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function RoleManagementPage({
  currentUser,
  initialRoles = defaultRoles,
  initialMembers = defaultProfiles,
  onRolesUpdate,
  onMembersUpdate,
  onBack,
}: RoleManagementPageProps) {
  // ============================================
  // ORGANIZATION STATE
  // ============================================

  const [roles, setRoles] = useState<OrganizationRole[]>(
    () => [...initialRoles]
  );

  const [members, setMembers] = useState<UserProfile[]>(
    () => [...initialMembers]
  );

  const [successMessage, setSuccessMessage] =
    useState("");

  // Synchronize with data supplied by the parent.
  useEffect(() => {
    setRoles([...initialRoles]);
  }, [initialRoles]);

  useEffect(() => {
    setMembers([...initialMembers]);
  }, [initialMembers]);

  // ============================================
  // CURRENT USER
  // ============================================

  // Do not assume that the first member
  // is an administrator.
  const activeUser = currentUser;

  // ============================================
  // PERMISSIONS
  // ============================================

  const canManageRoles = Boolean(
    activeUser &&
      hasPermission(
        activeUser.roleIds,
        "manage_roles",
        roles
      )
  );

  const canAssignRoles = Boolean(
    activeUser &&
      hasPermission(
        activeUser.roleIds,
        "assign_roles",
        roles
      )
  );

  const canAccessManagement =
    canManageRoles || canAssignRoles;

  // ============================================
  // ROLE UPDATES
  // ============================================

  function handleRolesChange(
    updatedRoles: OrganizationRole[]
  ) {
    if (!canManageRoles) {
      return;
    }

    setRoles(updatedRoles);
    setSuccessMessage(
      "Role changes updated in this session."
    );

    onRolesUpdate?.(updatedRoles);
  }

  // ============================================
  // MEMBER UPDATES
  // ============================================

  function handleMembersChange(
    updatedMembers: UserProfile[]
  ) {
    if (!canManageRoles && !canAssignRoles) {
      return;
    }

    setMembers(updatedMembers);
    setSuccessMessage(
      "Member role assignments updated in this session."
    );

    onMembersUpdate?.(updatedMembers);
  }

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    color: "inherit",
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #8885",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  };

  const cardStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  };

  // ============================================
  // ACCESS DENIED
  // ============================================

  if (!activeUser || !canAccessManagement) {
    return (
      <main style={containerStyle}>
        <section style={cardStyle}>
          <h1>Access Denied</h1>

          <p>
            You do not have permission to manage
            organization roles or member assignments.
          </p>

          <p style={{ opacity: 0.7 }}>
            Contact an organization administrator
            if you believe you should have access.
          </p>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={buttonStyle}
            >
              Back to Organization
            </button>
          )}
        </section>
      </main>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <main style={containerStyle}>
      {/* ====================================
          PAGE NAVIGATION
      ==================================== */}

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
            Role Management
          </h1>

          <p style={{ opacity: 0.7 }}>
            Configure organization roles,
            permissions, hierarchy, and
            member assignments.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={buttonStyle}
          >
            Back to Organization
          </button>
        )}
      </div>

      {/* ====================================
          CURRENT ACCESS
      ==================================== */}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>
          Your Administrative Access
        </h2>

        <p>
          Signed in as{" "}
          <strong>{activeUser.name}</strong>
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              border: "1px solid #8885",
              fontSize: "13px",
            }}
          >
            Role Management:{" "}
            {canManageRoles ? "Allowed" : "Restricted"}
          </span>

          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              border: "1px solid #8885",
              fontSize: "13px",
            }}
          >
            Role Assignment:{" "}
            {canAssignRoles ? "Allowed" : "Restricted"}
          </span>
        </div>
      </section>

      {/* ====================================
          SESSION UPDATE MESSAGE
      ==================================== */}

      {successMessage && (
        <p
          role="status"
          style={{
            padding: "12px 16px",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {successMessage}
        </p>
      )}

      {/* ====================================
          ROLE MANAGER
      ==================================== */}

      <RoleManager
        currentUser={activeUser}
        members={members}
        initialRoles={roles}
        onRolesChange={handleRolesChange}
        onMembersChange={handleMembersChange}
      />
    </main>
  );
}
