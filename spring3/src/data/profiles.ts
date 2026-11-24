
import {
  defaultRoles,
  getMemberPermissions,
  getHighestRole,
  type OrganizationRole,
  type Permission,
} from "./roles";

// ============================================
// USER TYPES
// ============================================

export type UserStatus =
  | "online"
  | "away"
  | "busy"
  | "offline";

export type UserProfile = {
  // Basic Information
  id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;

  // Professional Information
  position: string;
  department: string;
  supervisor: string;

  // Organization
  organizationId?: string;
  teamId?: string;
  roleIds: string[];

  // Profile Customization
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  skills?: string[];

  // Member Status
  status?: UserStatus;

  // Timestamps
  joinedAt?: string;
  updatedAt?: string;
};

// ============================================
// SAMPLE USER PROFILES
// ============================================

// Temporary demonstration data.
// Replace these with real Weaver members
// when the backend is connected.

export const defaultProfiles: UserProfile[] = [
  {
    id: "user-001",
    name: "Alex Morgan",
    username: "alexmorgan",
    email: "alex@example.com",
    bio: "Development lead focused on collaboration and building better digital experiences.",
    position: "Development Lead",
    department: "Development",
    supervisor: "",
    organizationId: "weaver",
    teamId: "development",
    roleIds: ["team-lead", "developer"],
    skills: [
      "React",
      "TypeScript",
      "Team Leadership",
    ],
    status: "online",
    joinedAt: "2026-01-15",
  },
  {
    id: "user-002",
    name: "Jordan Lee",
    username: "jordanlee",
    email: "jordan@example.com",
    bio: "Designer interested in user experience, accessibility, and visual communication.",
    position: "UX Designer",
    department: "Design",
    supervisor: "Alex Morgan",
    organizationId: "weaver",
    teamId: "design",
    roleIds: ["designer", "member"],
    skills: [
      "Figma",
      "UI Design",
      "Prototyping",
    ],
    status: "away",
    joinedAt: "2026-02-10",
  },
  {
    id: "user-003",
    name: "Taylor Brooks",
    username: "taylorbrooks",
    email: "taylor@example.com",
    bio: "Team member supporting development and organization activities.",
    position: "Developer",
    department: "Development",
    supervisor: "Alex Morgan",
    organizationId: "weaver",
    teamId: "development",
    roleIds: ["developer", "member"],
    skills: [
      "JavaScript",
      "React",
      "Testing",
    ],
    status: "offline",
    joinedAt: "2026-03-05",
  },
];

// ============================================
// PROFILE LOOKUP
// ============================================

export function getProfileById(
  profileId: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile | undefined {
  return profiles.find(
    (profile) => profile.id === profileId
  );
}

export function getProfileByUsername(
  username: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile | undefined {
  return profiles.find(
    (profile) =>
      profile.username.toLowerCase() ===
      username.toLowerCase()
  );
}

// ============================================
// PROFILE SEARCH
// ============================================

export function searchProfiles(
  query: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile[] {
  const search = query.trim().toLowerCase();

  if (!search) {
    return profiles;
  }

  return profiles.filter((profile) => {
    const searchableValues = [
      profile.name,
      profile.username,
      profile.position,
      profile.department,
      profile.bio,
      ...(profile.skills ?? []),
    ];

    return searchableValues.some((value) =>
      value.toLowerCase().includes(search)
    );
  });
}

// ============================================
// ORGANIZATION FILTERING
// ============================================

export function getProfilesByDepartment(
  department: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile[] {
  return profiles.filter(
    (profile) =>
      profile.department.toLowerCase() ===
      department.toLowerCase()
  );
}

export function getProfilesByTeam(
  teamId: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile[] {
  return profiles.filter(
    (profile) => profile.teamId === teamId
  );
}

export function getProfilesByRole(
  roleId: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile[] {
  return profiles.filter((profile) =>
    profile.roleIds.includes(roleId)
  );
}

// ============================================
// ROLE ASSIGNMENT
// ============================================

export function assignRole(
  profile: UserProfile,
  roleId: string,
  availableRoles: OrganizationRole[] = defaultRoles
): UserProfile {
  const roleExists = availableRoles.some(
    (role) => role.id === roleId
  );

  if (!roleExists) {
    return profile;
  }

  if (profile.roleIds.includes(roleId)) {
    return profile;
  }

  return {
    ...profile,
    roleIds: [...profile.roleIds, roleId],
    updatedAt: new Date().toISOString(),
  };
}

export function removeRole(
  profile: UserProfile,
  roleId: string
): UserProfile {
  return {
    ...profile,
    roleIds: profile.roleIds.filter(
      (id) => id !== roleId
    ),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// PROFILE PERMISSIONS
// ============================================

export function getProfilePermissions(
  profile: UserProfile,
  roles: OrganizationRole[] = defaultRoles
): Permission[] {
  return getMemberPermissions(
    profile.roleIds,
    roles
  );
}

export function getProfileHighestRole(
  profile: UserProfile,
  roles: OrganizationRole[] = defaultRoles
): OrganizationRole | undefined {
  return getHighestRole(
    profile.roleIds,
    roles
  );
}

// ============================================
// CHAIN OF COMMAND
// ============================================

export function getDirectReports(
  supervisorName: string,
  profiles: UserProfile[] = defaultProfiles
): UserProfile[] {
  return profiles.filter(
    (profile) =>
      profile.supervisor.toLowerCase() ===
      supervisorName.toLowerCase()
  );
}

export function getSupervisorProfile(
  profile: UserProfile,
  profiles: UserProfile[] = defaultProfiles
): UserProfile | undefined {
  if (!profile.supervisor) {
    return undefined;
  }

  return profiles.find(
    (member) =>
      member.name.toLowerCase() ===
      profile.supervisor.toLowerCase()
  );
}

// ============================================
// PROFILE UPDATES
// ============================================

export function updateProfile(
  profile: UserProfile,
  changes: Partial<UserProfile>
): UserProfile {
  return {
    ...profile,
    ...changes,
    id: profile.id,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// PROFILE DISPLAY HELPERS
// ============================================

export function getProfileInitials(
  profile: UserProfile
): string {
  return profile.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function getProfileDisplayName(
  profile: UserProfile
): string {
  return profile.name || profile.username;
}

export function getProfileStatusColor(
  status: UserStatus = "offline"
): string {
  const statusColors: Record<UserStatus, string> = {
    online: "#22c55e",
    away: "#f59e0b",
    busy: "#ef4444",
    offline: "#6b7280",
  };

  return statusColors[status];
}
