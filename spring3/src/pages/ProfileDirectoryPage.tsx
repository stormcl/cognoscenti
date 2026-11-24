
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import {
  defaultProfiles,
  getProfileInitials,
  getProfileStatusColor,
  searchProfiles,
  type UserProfile,
  type UserStatus,
} from "../data/profiles";

import {
  defaultRoles,
  type OrganizationRole,
} from "../data/roles";

import ProfileRoles, {
  getProfileRoles,
} from "../components/profile/ProfileRoles";

// ============================================
// COMPONENT PROPERTIES
// ============================================

type ProfileDirectoryPageProps = {
  profiles?: UserProfile[];
  availableRoles?: OrganizationRole[];
  onViewProfile?: (profile: UserProfile) => void;
};

type StatusFilter = "all" | UserStatus;

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfileDirectoryPage({
  profiles = defaultProfiles,
  availableRoles = defaultRoles,
  onViewProfile,
}: ProfileDirectoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  // ============================================
  // FILTER OPTIONS
  // ============================================

  const departments = useMemo(
    () =>
      [...new Set(profiles.map((p) => p.department))]
        .filter(Boolean)
        .sort(),
    [profiles]
  );

  const teams = useMemo(
    () =>
      [...new Set(profiles.map((p) => p.teamId))]
        .filter((team): team is string => Boolean(team))
        .sort(),
    [profiles]
  );

  // ============================================
  // FILTERED MEMBERS
  // ============================================

  const filteredProfiles = useMemo(() => {
    return searchProfiles(searchQuery, profiles)
      .filter(
        (profile) =>
          departmentFilter === "all" ||
          profile.department === departmentFilter
      )
      .filter(
        (profile) =>
          teamFilter === "all" ||
          profile.teamId === teamFilter
      )
      .filter(
        (profile) =>
          roleFilter === "all" ||
          profile.roleIds.includes(roleFilter)
      )
      .filter(
        (profile) =>
          statusFilter === "all" ||
          (profile.status ?? "offline") === statusFilter
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [
    profiles,
    searchQuery,
    departmentFilter,
    teamFilter,
    roleFilter,
    statusFilter,
  ]);

  // ============================================
  // RESET FILTERS
  // ============================================

  function resetFilters() {
    setSearchQuery("");
    setDepartmentFilter("all");
    setTeamFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
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

  const cardStyle: CSSProperties = {
    border: "1px solid #8885",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "transparent",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "8px",
    border: "1px solid #8886",
    backgroundColor: "transparent",
    color: "inherit",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #8885",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "7px",
  };

  // ============================================
  // MEMBER CARD
  // ============================================

  function renderMember(profile: UserProfile) {
    const roles = getProfileRoles(
      profile.roleIds,
      availableRoles
    );

    const initials = getProfileInitials(profile);

    const status = profile.status ?? "offline";

    const statusColor = getProfileStatusColor(status);

    const isList = viewMode === "list";

    return (
      <article
        key={profile.id}
        style={{
          ...cardStyle,
          display: "flex",
          flexDirection: isList ? "row" : "column",
          alignItems: isList ? "center" : "stretch",
          gap: "16px",
          minWidth: 0,
        }}
      >
        {/* Member Avatar */}
        <div
          style={{
            position: "relative",
            width: isList ? "65px" : "85px",
            height: isList ? "65px" : "85px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "#334155",
              backgroundImage: profile.avatarUrl
                ? `url("${profile.avatarUrl}")`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isList ? "20px" : "26px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {!profile.avatarUrl && initials}
          </div>

          <span
            title={status}
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              width: "13px",
              height: "13px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              border: "2px solid #1e293b",
            }}
          />
        </div>

        {/* Member Information */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              margin: "0 0 4px",
            }}
          >
            {profile.name}
          </h2>

          <p
            style={{
              fontSize: "13px",
              opacity: 0.65,
              margin: "0 0 10px",
            }}
          >
            @{profile.username}
          </p>

          <p
            style={{
              fontSize: "14px",
              margin: "0 0 6px",
            }}
          >
            {profile.position || "Member"}
          </p>

          <p
            style={{
              fontSize: "12px",
              opacity: 0.7,
              margin: "0 0 12px",
            }}
          >
            {profile.department || "No department"}

            {profile.teamId
              ? ` | ${profile.teamId}`
              : ""}
          </p>

          <ProfileRoles
            roles={roles}
            size="small"
            showHierarchy
            showEmptyMessage={false}
          />
        </div>

        {/* View Profile */}
        {onViewProfile && (
          <button
            type="button"
            onClick={() => onViewProfile(profile)}
            style={{
              ...buttonStyle,
              alignSelf: isList
                ? "center"
                : "flex-start",
            }}
          >
            View Profile
          </button>
        )}
      </article>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <main style={containerStyle}>
      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "8px" }}>
          Member Directory
        </h1>

        <p style={{ opacity: 0.7 }}>
          Find organization members, explore
          professional profiles, and view
          organizational roles.
        </p>
      </header>

      {/* ====================================
          SEARCH AND FILTERS
      ==================================== */}

      <section
        style={{
          ...cardStyle,
          marginBottom: "24px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Search Members
        </h2>

        <label
          htmlFor="directory-search"
          style={labelStyle}
        >
          Search by name, username, position,
          department, or skill
        </label>

        <input
          id="directory-search"
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search organization members..."
          style={inputStyle}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {/* Department */}
          <div>
            <label
              htmlFor="directory-department"
              style={labelStyle}
            >
              Department
            </label>

            <select
              id="directory-department"
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option value="all">
                All Departments
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>
          </div>

          {/* Team */}
          <div>
            <label
              htmlFor="directory-team"
              style={labelStyle}
            >
              Team
            </label>

            <select
              id="directory-team"
              value={teamFilter}
              onChange={(event) =>
                setTeamFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option value="all">
                All Teams
              </option>

              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="directory-role"
              style={labelStyle}
            >
              Role
            </label>

            <select
              id="directory-role"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option value="all">
                All Roles
              </option>

              {availableRoles.map((role) => (
                <option
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="directory-status"
              style={labelStyle}
            >
              Status
            </label>

            <select
              id="directory-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              style={inputStyle}
            >
              <option value="all">
                All Statuses
              </option>

              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={resetFilters}
            style={buttonStyle}
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* ====================================
          DIRECTORY TOOLBAR
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
        <p style={{ margin: 0 }}>
          <strong>{filteredProfiles.length}</strong>{" "}
          of {profiles.length} members
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            style={{
              ...buttonStyle,
              backgroundColor:
                viewMode === "grid"
                  ? "#2563eb"
                  : "transparent",
              color:
                viewMode === "grid"
                  ? "#ffffff"
                  : "inherit",
            }}
          >
            Grid
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            style={{
              ...buttonStyle,
              backgroundColor:
                viewMode === "list"
                  ? "#2563eb"
                  : "transparent",
              color:
                viewMode === "list"
                  ? "#ffffff"
                  : "inherit",
            }}
          >
            List
          </button>
        </div>
      </div>

      {/* ====================================
          MEMBER DIRECTORY
      ==================================== */}

      {filteredProfiles.length > 0 ? (
        <section
          aria-label="Organization members"
          style={{
            display: "grid",
            gridTemplateColumns:
              viewMode === "grid"
                ? "repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
                : "1fr",
            gap: "16px",
          }}
        >
          {filteredProfiles.map(renderMember)}
        </section>
      ) : (
        <section
          style={{
            ...cardStyle,
            textAlign: "center",
            padding: "40px",
          }}
        >
          <h2>No Members Found</h2>

          <p style={{ opacity: 0.7 }}>
            Try changing your search or filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            style={buttonStyle}
          >
            Clear Filters
          </button>
        </section>
      )}
    </main>
  );
}
