
/* ============================================
   WEAVER ROLE AND PERMISSION SYSTEM
============================================ */

// ============================================
// PERMISSION TYPES
// ============================================

export type Permission =
  | "manage_organization"
  | "manage_roles"
  | "assign_roles"
  | "manage_members"
  | "edit_own_profile"
  | "edit_member_profiles"
  | "view_directory"
  | "manage_teams"
  | "manage_meetings"
  | "manage_attendance"
  | "view_attendance"
  | "manage_documents"
  | "view_documents"
  | "manage_announcements"
  | "moderate_discussions";

// ============================================
// ALL AVAILABLE PERMISSIONS
// ============================================

export const allPermissions: Permission[] = [
  "manage_organization",
  "manage_roles",
  "assign_roles",
  "manage_members",
  "edit_own_profile",
  "edit_member_profiles",
  "view_directory",
  "manage_teams",
  "manage_meetings",
  "manage_attendance",
  "view_attendance",
  "manage_documents",
  "view_documents",
  "manage_announcements",
  "moderate_discussions",
];

// ============================================
// ORGANIZATION ROLE TYPE
// ============================================

export type OrganizationRole = {
  id: string;
  name: string;
  description: string;
  color: string;

  // Higher number = higher role hierarchy
  position: number;

  // Permissions granted by this role
  permissions: Permission[];

  // Automatically assigned to new members
  isDefault: boolean;

  // Protected built-in role
  isSystem: boolean;
};

// ============================================
// DEFAULT ORGANIZATION ROLES
// ============================================

export const defaultRoles: OrganizationRole[] = [
  {
    id: "owner",
    name: "Owner",
    description: "Full control of the organization",
    color: "#d97706",
    position: 100,
    permissions: [...allPermissions],
    isDefault: false,
    isSystem: true,
  },
  {
    id: "administrator",
    name: "Administrator",
    description: "Manages organization operations",
    color: "#dc2626",
    position: 90,
    permissions: allPermissions.filter(
      (permission) =>
        permission !== "manage_organization"
    ),
    isDefault: false,
    isSystem: true,
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Moderates members and discussions",
    color: "#2563eb",
    position: 70,
    permissions: [
      "edit_own_profile",
      "view_directory",
      "view_attendance",
      "view_documents",
      "moderate_discussions",
    ],
    isDefault: false,
    isSystem: false,
  },
  {
    id: "team-lead",
    name: "Team Lead",
    description: "Coordinates team responsibilities",
    color: "#7c3aed",
    position: 60,
    permissions: [
      "edit_own_profile",
      "view_directory",
      "manage_meetings",
      "view_attendance",
      "view_documents",
    ],
    isDefault: false,
    isSystem: false,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Works on application development",
    color: "#0891b2",
    position: 40,
    permissions: [
      "edit_own_profile",
      "view_directory",
      "view_documents",
    ],
    isDefault: false,
    isSystem: false,
  },
  {
    id: "designer",
    name: "Designer",
    description: "Works on visual and interface design",
    color: "#db2777",
    position: 40,
    permissions: [
      "edit_own_profile",
      "view_directory",
      "view_documents",
    ],
    isDefault: false,
    isSystem: false,
  },
  {
    id: "member",
    name: "Member",
    description: "Standard organization member",
    color: "#64748b",
    position: 10,
    permissions: [
      "edit_own_profile",
      "view_directory",
      "view_documents",
    ],
    isDefault: true,
    isSystem: true,
  },
];

// ============================================
// ROLE LOOKUP
// ============================================

export function getRoleById(
  roleId: string,
  roles: OrganizationRole[] = defaultRoles
): OrganizationRole | undefined {
  return roles.find(
    (role) => role.id === roleId
  );
}

// ============================================
// GET ALL MEMBER PERMISSIONS
// ============================================

// Members may have multiple roles.
// Permissions are combined across those roles.

export function getMemberPermissions(
  roleIds: string[],
  roles: OrganizationRole[] = defaultRoles
): Permission[] {
  const permissions = new Set<Permission>();

  roleIds.forEach((roleId) => {
    const role = getRoleById(roleId, roles);

    role?.permissions.forEach((permission) => {
      permissions.add(permission);
    });
  });

  return Array.from(permissions);
}

// ============================================
// CHECK MEMBER PERMISSION
// ============================================

export function hasPermission(
  roleIds: string[],
  permission: Permission,
  roles: OrganizationRole[] = defaultRoles
): boolean {
  return getMemberPermissions(
    roleIds,
    roles
  ).includes(permission);
}

// ============================================
// GET HIGHEST MEMBER ROLE
// ============================================

export function getHighestRole(
  roleIds: string[],
  roles: OrganizationRole[] = defaultRoles
): OrganizationRole | undefined {
  return roles
    .filter((role) => roleIds.includes(role.id))
    .sort((a, b) => b.position - a.position)[0];
}

// ============================================
// ROLE HIERARCHY VALIDATION
// ============================================

// Determines whether a manager may manage
// a particular role based on permissions
// and hierarchy.

export function canManageRole(
  managerRoleIds: string[],
  targetRoleId: string,
  roles: OrganizationRole[] = defaultRoles
): boolean {
  if (
    !hasPermission(
      managerRoleIds,
      "manage_roles",
      roles
    )
  ) {
    return false;
  }

  const targetRole = getRoleById(
    targetRoleId,
    roles
  );

  const highestManagerRole = getHighestRole(
    managerRoleIds,
    roles
  );

  if (!targetRole || !highestManagerRole) {
    return false;
  }

  // Owner role cannot be managed here.
  if (targetRole.id === "owner") {
    return false;
  }

  // Managers can only manage roles below them.
  return (
    highestManagerRole.position >
    targetRole.position
  );
}

// ============================================
// SORT ROLES BY HIERARCHY
// ============================================

export function sortRolesByHierarchy(
  roles: OrganizationRole[]
): OrganizationRole[] {
  return [...roles].sort(
    (a, b) => b.position - a.position
  );
}

// ============================================
// CREATE CUSTOM ROLE
// ============================================

export function createCustomRole(
  name: string,
  color = "#64748b",
  description = "",
  permissions: Permission[] = [],
  position = 20
): OrganizationRole {
  return {
    id: `custom-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name,
    description,
    color,
    position,
    permissions,
    isDefault: false,
    isSystem: false,
  };
}

// ============================================
// ROLE DISPLAY HELPERS
// ============================================

export function getRoleColor(
  roleId: string,
  roles: OrganizationRole[] = defaultRoles
): string {
  return (
    getRoleById(roleId, roles)?.color ??
    "#64748b"
  );
}

export function getRoleName(
  roleId: string,
  roles: OrganizationRole[] = defaultRoles
): string {
  return (
    getRoleById(roleId, roles)?.name ??
    "Unknown Role"
  );
}
