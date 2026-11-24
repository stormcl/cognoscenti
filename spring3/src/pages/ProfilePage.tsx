
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import {
  defaultProfiles,
  getProfileById,
  getSupervisorProfile,
  type UserProfile,
} from "../data/profiles";

import {
  defaultRoles,
  hasPermission,
  type OrganizationRole,
} from "../data/roles";

import ProfileView from "../components/profile/ProfileView";
import ProfileEdit from "../components/profile/ProfileEdit";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type ProfilePageProps = {
  profileId?: string;
  currentUser?: UserProfile;
  profiles?: UserProfile[];
  availableRoles?: OrganizationRole[];

  onProfileUpdate?: (profile: UserProfile) => void;
  onBack?: () => void;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfilePage({
  profileId,
  currentUser,
  profiles = defaultProfiles,
  availableRoles = defaultRoles,
  onProfileUpdate,
  onBack,
}: ProfilePageProps) {
  // ============================================
  // PROFILE STATE
  // ============================================

  const initialProfile =
    (profileId
      ? getProfileById(profileId, profiles)
      : currentUser
        ? getProfileById(currentUser.id, profiles) ??
          currentUser
        : profiles[0]);

  const [profile, setProfile] = useState<
    UserProfile | undefined
  >(initialProfile);

  const [isEditing, setIsEditing] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  // Update displayed profile when the
  // selected member or supplied data changes.
  useEffect(() => {
    const nextProfile =
      (profileId
        ? getProfileById(profileId, profiles)
        : currentUser
          ? getProfileById(currentUser.id, profiles) ??
            currentUser
          : profiles[0]);

    setProfile(nextProfile);
    setIsEditing(false);
    setSuccessMessage("");
  }, [profileId, currentUser, profiles]);

  // ============================================
  // PERMISSION CHECKS
  // ============================================

  const isOwnProfile =
    Boolean(profile && currentUser) &&
    profile?.id === currentUser?.id;

  const canEditOwnProfile =
    isOwnProfile &&
    Boolean(
      currentUser &&
        hasPermission(
          currentUser.roleIds,
          "edit_own_profile",
          availableRoles
        )
    );

  const canEditOtherProfiles =
    !isOwnProfile &&
    Boolean(
      currentUser &&
        hasPermission(
          currentUser.roleIds,
          "edit_member_profiles",
          availableRoles
        )
    );

  const canEdit =
    canEditOwnProfile || canEditOtherProfiles;

  // Only role managers should see the role
  // assignment controls in ProfileEdit.
  // Actual authorization must be enforced
  // by the backend.
  const canAssignRoles = Boolean(
    currentUser &&
      hasPermission(
        currentUser.roleIds,
        "assign_roles",
        availableRoles
      )
  );

  // ============================================
  // SAVE PROFILE
  // ============================================

  function handleSave(updatedProfile: UserProfile) {
    if (!profile || !canEdit) {
      return;
    }

    // Preserve the profile's identity.
    // Role changes are handled separately
    // by RoleAssignment.tsx.
    const savedProfile: UserProfile = {
      ...profile,
      ...updatedProfile,
      id: profile.id,
      roleIds: [...profile.roleIds],
      updatedAt: new Date().toISOString(),
    };

    setProfile(savedProfile);
    setIsEditing(false);
    setSuccessMessage(
      "Profile updated in this session."
    );

    onProfileUpdate?.(savedProfile);
  }

  // ============================================
  // SUPERVISOR NAVIGATION
  // ============================================

  function handleViewSupervisor(name: string) {
    if (!profile) return;

    const supervisor = getSupervisorProfile(
      profile,
      profiles
    );

    if (
      supervisor &&
      supervisor.name.toLowerCase() ===
        name.toLowerCase()
    ) {
      setProfile(supervisor);
      setIsEditing(false);
      setSuccessMessage("");
    }
  }

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: CSSProperties = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
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

  // ============================================
  // PROFILE NOT FOUND
  // ============================================

  if (!profile) {
    return (
      <main style={containerStyle}>
        <h1>Profile Not Found</h1>

        <p>
          The requested member profile could not
          be found.
        </p>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={buttonStyle}
          >
            Back to Directory
          </button>
        )}
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
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={buttonStyle}
          >
            ← Back to Directory
          </button>
        )}

        <span
          style={{
            fontSize: "13px",
            opacity: 0.65,
          }}
        >
          Weaver Member Profile
        </span>
      </div>

      {/* ====================================
          SUCCESS MESSAGE
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
          PROFILE EDIT MODE
      ==================================== */}

      {isEditing && canEdit ? (
        <ProfileEdit
          profile={profile}
          canAssignRoles={false}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        /* ====================================
           PROFILE VIEW MODE
        ==================================== */

        <ProfileView
          profile={profile}
          canEdit={canEdit}
          onEdit={() => {
            if (canEdit) {
              setIsEditing(true);
              setSuccessMessage("");
            }
          }}
          onViewSupervisor={handleViewSupervisor}
        />
      )}
    </main>
  );
}
