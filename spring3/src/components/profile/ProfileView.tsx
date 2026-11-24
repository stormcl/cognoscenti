
import { useState } from "react";
import type { CSSProperties } from "react";

import type { UserProfile } from "../../data/profiles";

import {
  getProfileInitials,
  getProfileStatusColor,
} from "../../data/profiles";

import ProfileRoles, {
  getProfileRoles,
} from "./ProfileRoles";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type ProfileViewProps = {
  profile: UserProfile;
  onEdit?: () => void;
  onViewSupervisor?: (name: string) => void;
  onViewMember?: (memberId: string) => void;
  canEdit?: boolean;
};

type ProfileTab =
  | "overview"
  | "organization"
  | "roles";

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfileView({
  profile,
  onEdit,
  onViewSupervisor,
  canEdit = false,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] =
    useState<ProfileTab>("overview");

  const roles = getProfileRoles(profile.roleIds);

  const initials = getProfileInitials(profile);

  const statusColor = getProfileStatusColor(
    profile.status
  );

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: CSSProperties = {
    maxWidth: "950px",
    margin: "0 auto",
    padding: "24px",
    color: "inherit",
  };

  const cardStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "transparent",
  };

  const labelStyle: CSSProperties = {
    fontSize: "12px",
    opacity: 0.65,
    marginBottom: "5px",
  };

  const valueStyle: CSSProperties = {
    fontSize: "15px",
    fontWeight: 500,
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #8885",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
  };

  // ============================================
  // REUSABLE INFORMATION FIELD
  // ============================================

  function renderDetail(
    label: string,
    value?: string
  ) {
    return (
      <div>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>
          {value || "Not provided"}
        </div>
      </div>
    );
  }

  // ============================================
  // PROFILE HEADER
  // ============================================

  function renderHeader() {
    return (
      <section
        style={{
          ...cardStyle,
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Profile Banner */}
        <div
          style={{
            height: "150px",
            backgroundColor: "#1e293b",
            backgroundImage: profile.bannerUrl
              ? `url("${profile.bannerUrl}")`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                position: "relative",
                marginTop: "-65px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  border: "4px solid #1e293b",
                  backgroundColor: "#334155",
                  backgroundImage: profile.avatarUrl
                    ? `url("${profile.avatarUrl}")`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "32px",
                  fontWeight: 700,
                  boxSizing: "border-box",
                }}
              >
                {!profile.avatarUrl && initials}
              </div>

              {/* Online Status */}
              <span
                title={profile.status || "offline"}
                style={{
                  position: "absolute",
                  bottom: "7px",
                  right: "7px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: statusColor,
                  border: "3px solid #1e293b",
                }}
              />
            </div>

            {/* Member Information */}
            <div
              style={{
                flex: 1,
                minWidth: "200px",
              }}
            >
              <h1 style={{ margin: "0 0 4px" }}>
                {profile.name}
              </h1>

              <p
                style={{
                  margin: "0 0 10px",
                  opacity: 0.65,
                }}
              >
                @{profile.username}
              </p>

              <p style={{ margin: "0 0 12px" }}>
                {profile.position || "Member"}

                {profile.department &&
                  ` | ${profile.department}`}
              </p>

              <ProfileRoles
                roles={roles}
                size="medium"
                showHierarchy
              />
            </div>

            {/* Edit Button */}
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                style={buttonStyle}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================
  // PROFILE NAVIGATION
  // ============================================

  function renderNavigation() {
    const tabs: ProfileTab[] = [
      "overview",
      "organization",
      "roles",
    ];

    return (
      <nav
        aria-label="Profile sections"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            style={{
              ...buttonStyle,
              backgroundColor:
                activeTab === tab
                  ? "#2563eb"
                  : "transparent",
              color:
                activeTab === tab
                  ? "#ffffff"
                  : "inherit",
                border:
                  activeTab === tab
                    ? "1px solid #2563eb"
                    : "1px solid #8885",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
      </nav>
    );
  }

  // ============================================
  // OVERVIEW TAB
  // ============================================

  function renderOverview() {
    return (
      <>
        <section style={cardStyle}>
          <h2>About</h2>

          <p style={{ lineHeight: 1.7 }}>
            {profile.bio ||
              "This member has not added a bio yet."}
          </p>
        </section>

        <section style={cardStyle}>
          <h2>Professional Information</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "24px",
            }}
          >
            {renderDetail(
              "Position",
              profile.position
            )}

            {renderDetail(
              "Department",
              profile.department
            )}

            {renderDetail(
              "Location",
              profile.location
            )}

            {renderDetail(
              "Website",
              profile.website
            )}
          </div>
        </section>

        <section style={cardStyle}>
          <h2>Skills</h2>

          {profile.skills &&
          profile.skills.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #8885",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills added yet.</p>
          )}
        </section>
      </>
    );
  }

  // ============================================
  // ORGANIZATION TAB
  // ============================================

  function renderOrganization() {
    return (
      <>
        <section style={cardStyle}>
          <h2>Organization Information</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "24px",
            }}
          >
            {renderDetail(
              "Organization",
              profile.organizationId
            )}

            {renderDetail(
              "Department",
              profile.department
            )}

            {renderDetail(
              "Team",
              profile.teamId
            )}

            {renderDetail(
              "Position",
              profile.position
            )}
          </div>
        </section>

        <section style={cardStyle}>
          <h2>Chain of Command</h2>

          <p style={{ opacity: 0.7 }}>
            View this member's organizational
            reporting structure.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            {/* Supervisor */}
            {profile.supervisor && (
              <>
                <div
                  style={{
                    border: "1px solid #8885",
                    borderRadius: "10px",
                    padding: "20px",
                    width: "100%",
                    maxWidth: "320px",
                    boxSizing: "border-box",
                    textAlign: "center",
                  }}
                >
                  <div style={labelStyle}>
                    Reports To
                  </div>

                  {onViewSupervisor ? (
                    <button
                      type="button"
                      onClick={() =>
                        onViewSupervisor(
                          profile.supervisor
                        )
                      }
                      style={{
                        ...buttonStyle,
                        border: "none",
                        textDecoration: "underline",
                      }}
                    >
                      {profile.supervisor}
                    </button>
                  ) : (
                    <strong>
                      {profile.supervisor}
                    </strong>
                  )}
                </div>

                <div aria-hidden="true">↓</div>
              </>
            )}

            {/* Current Member */}
            <div
              style={{
                border: "2px solid #2563eb",
                borderRadius: "10px",
                padding: "20px",
                width: "100%",
                maxWidth: "320px",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              <div style={labelStyle}>
                Current Member
              </div>

              <strong>{profile.name}</strong>

              <p style={{ marginBottom: 0 }}>
                {profile.position || "Member"}
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ============================================
  // ROLES TAB
  // ============================================

  function renderRoles() {
    return (
      <section style={cardStyle}>
        <h2>Organization Roles</h2>

        <p style={{ opacity: 0.7 }}>
          Roles define this member's organizational
          responsibilities and access permissions.
        </p>

        <ProfileRoles
          roles={roles}
          size="large"
          showDescriptions
          showHierarchy
        />
      </section>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <main style={containerStyle}>
      {renderHeader()}

      {renderNavigation()}

      {activeTab === "overview" &&
        renderOverview()}

      {activeTab === "organization" &&
        renderOrganization()}

      {activeTab === "roles" &&
        renderRoles()}
    </main>
  );
}
