
import type { CSSProperties } from "react";

import {
  defaultRoles,
  type OrganizationRole,
} from "../../data/roles";

// ============================================
// TYPES
// ============================================

export type ProfileRole = {
  id: string;
  name: string;
  color: string;
  description?: string;
  position?: number;
};

type ProfileRolesProps = {
  roles: ProfileRole[];
  size?: "small" | "medium" | "large";
  showDescriptions?: boolean;
  showHierarchy?: boolean;
  showEmptyMessage?: boolean;
};

// ============================================
// ROLE CONVERSION
// ============================================

// Converts assigned role IDs or names into
// displayable role badges.

export function getProfileRoles(
  roleIds: string[],
  availableRoles: OrganizationRole[] = defaultRoles
): ProfileRole[] {
  return roleIds.map((roleId) => {
    const matchingRole = availableRoles.find(
      (role) =>
        role.id === roleId ||
        role.name.toLowerCase() === roleId.toLowerCase()
    );

    if (matchingRole) {
      return {
        id: matchingRole.id,
        name: matchingRole.name,
        color: matchingRole.color,
        description: matchingRole.description,
        position: matchingRole.position,
      };
    }

    return {
      id: roleId.toLowerCase().replace(/\s+/g, "-"),
      name: roleId,
      color: "#64748b",
      description: "Custom organization role",
      position: 0,
    };
  });
}

// ============================================
// ROLE SORTING
// ============================================

// Higher organizational roles appear first.

export function sortProfileRoles(
  roles: ProfileRole[]
): ProfileRole[] {
  return [...roles].sort(
    (a, b) => (b.position ?? 0) - (a.position ?? 0)
  );
}

// ============================================
// ROLE BADGE COMPONENT
// ============================================

export default function ProfileRoles({
  roles,
  size = "medium",
  showDescriptions = false,
  showHierarchy = true,
  showEmptyMessage = true,
}: ProfileRolesProps) {
  const sizes = {
    small: {
      fontSize: "11px",
      padding: "3px 8px",
      dotSize: "6px",
    },
    medium: {
      fontSize: "13px",
      padding: "5px 12px",
      dotSize: "8px",
    },
    large: {
      fontSize: "15px",
      padding: "7px 15px",
      dotSize: "10px",
    },
  };

  const selectedSize = sizes[size];

  const displayedRoles = showHierarchy
    ? sortProfileRoles(roles)
    : roles;

  const containerStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  };

  // ============================================
  // EMPTY STATE
  // ============================================

  if (displayedRoles.length === 0) {
    if (!showEmptyMessage) {
      return null;
    }

    return (
      <p
        style={{
          opacity: 0.6,
          fontSize: "13px",
          margin: 0,
        }}
      >
        No roles assigned.
      </p>
    );
  }

  // ============================================
  // ROLE DISPLAY
  // ============================================

  return (
    <div
      style={containerStyle}
      aria-label="Member roles"
    >
      {displayedRoles.map((role) => (
        <span
          key={role.id}
          title={role.description || role.name}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: selectedSize.padding,
            border: `1px solid ${role.color}`,
            borderRadius: "20px",
            backgroundColor: "transparent",
            color: "inherit",
            fontSize: selectedSize.fontSize,
            fontWeight: 600,
            lineHeight: 1.4,
            whiteSpace: "normal",
          }}
        >
          {/* Colored role indicator */}
          <span
            aria-hidden="true"
            style={{
              width: selectedSize.dotSize,
              height: selectedSize.dotSize,
              minWidth: selectedSize.dotSize,
              borderRadius: "50%",
              backgroundColor: role.color,
              flexShrink: 0,
              display: "inline-block",
            }}
          />

          {/* Role name */}
          <span>{role.name}</span>

          {/* Optional description */}
          {showDescriptions && role.description && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 400,
                opacity: 0.75,
              }}
            >
              ({role.description})
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
