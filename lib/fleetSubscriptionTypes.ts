/**
 * Fleet Subscription & Organization Types
 * 
 * Defines roles, permissions, and data structures for the Fleet add-on subscription tier.
 * This is separate from fleetTypes.ts which handles fleet customer accounts (B2B customers).
 * 
 * Pricing Structure:
 * - $50 base (fleet addon)
 * - 4 dispatchers included, +$5/month each additional
 * - 4 technician seats minimum @ $25/month each, +$25/month each additional
 * - 1 owner (super user) included
 * - Minimum: $150/month
 */

// ============================================================================
// Constants
// ============================================================================

export const FLEET_SUBSCRIPTION_PRICING = {
    BASE_PRICE: 5000,           // $50 in cents
    TECHNICIAN_SEAT: 2500,       // $25 in cents
    EXTRA_DISPATCHER: 500,       // $5 in cents
    MIN_TECHNICIANS: 4,
    INCLUDED_DISPATCHERS: 4,
    MINIMUM_MONTHLY: 15000,      // $150 in cents
} as const;

// ============================================================================
// Types
// ============================================================================

export type FleetUserRole = 'owner' | 'dispatcher' | 'technician';

export type FleetSubscriptionPlan = 'fleet_basic' | 'fleet_pro';

export type OrganizationStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export type MemberStatus = 'active' | 'suspended' | 'pending';

/**
 * Fleet Organization - represents a business with a fleet subscription
 */
export interface FleetOrganization {
    id: string;
    ownerUserId: string;
    name: string;

    // Subscription
    plan: FleetSubscriptionPlan;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;

    // Seat limits
    maxDispatchers: number;
    maxTechnicians: number;

    // Billing
    billingCycle: 'monthly' | 'yearly';
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
    monthlyCost: number; // in cents

    // Status
    status: OrganizationStatus;

    // Metadata
    createdAt: number;
    updatedAt?: number;
}

/**
 * Fleet Member - a user linked to an organization with a specific role
 */
export interface FleetMember {
    id: string;
    organizationId: string;
    userId: string;

    // Role
    role: FleetUserRole;
    permissions?: FleetPermissions;

    // Profile
    displayName: string;
    phone?: string;
    email?: string;

    // Status
    status: MemberStatus;
    invitedBy?: string;
    invitedAt?: number;
    joinedAt?: number;

    // Metadata
    createdAt: number;
    updatedAt?: number;
}

/**
 * Fleet Invite - pending invitation to join an organization
 */
export interface FleetInvite {
    id: string;
    organizationId: string;
    email: string;
    role: Exclude<FleetUserRole, 'owner'>; // Can't invite owners
    inviteCode: string;

    // Display info
    organizationName: string;
    invitedByName: string;

    // Status
    expiresAt: number;
    acceptedAt?: number;
    acceptedByUserId?: string;

    // Metadata
    createdAt: number;
}

/**
 * Granular permissions that can override role defaults
 */
export interface FleetPermissions {
    canViewDispatchQueue: boolean;
    canClaimJobs: boolean;
    canAssignJobs: boolean;
    canManageTeam: boolean;
    canViewAnalytics: boolean;
    canEditSettings: boolean;
    canViewFinancials: boolean;
    canExportData: boolean;
}

// ============================================================================
// Role Permission Defaults
// ============================================================================

export const ROLE_PERMISSIONS: Record<FleetUserRole, FleetPermissions> = {
    owner: {
        canViewDispatchQueue: true,
        canClaimJobs: true,
        canAssignJobs: true,
        canManageTeam: true,
        canViewAnalytics: true,
        canEditSettings: true,
        canViewFinancials: true,
        canExportData: true,
    },
    dispatcher: {
        canViewDispatchQueue: true,
        canClaimJobs: true,
        canAssignJobs: true,
        canManageTeam: false,
        canViewAnalytics: false,
        canEditSettings: false,
        canViewFinancials: false,
        canExportData: false,
    },
    technician: {
        canViewDispatchQueue: true,
        canClaimJobs: true,
        canAssignJobs: false,
        canManageTeam: false,
        canViewAnalytics: false,
        canEditSettings: false,
        canViewFinancials: false,
        canExportData: false,
    },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get permissions for a member, merging role defaults with any overrides
 */
export function getMemberPermissions(member: FleetMember): FleetPermissions {
    const roleDefaults = ROLE_PERMISSIONS[member.role];
    if (!member.permissions) return roleDefaults;

    return {
        ...roleDefaults,
        ...member.permissions,
    };
}

/**
 * Check if a member has a specific permission
 */
export function hasPermission(member: FleetMember, permission: keyof FleetPermissions): boolean {
    const permissions = getMemberPermissions(member);
    return permissions[permission];
}

/**
 * Calculate monthly cost for a fleet configuration
 */
export function calculateFleetSubscriptionCost(
    technicianSeats: number,
    dispatcherSeats: number = FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS
): number {
    const techCost = Math.max(technicianSeats, FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS) * FLEET_SUBSCRIPTION_PRICING.TECHNICIAN_SEAT;
    const extraDispatchers = Math.max(0, dispatcherSeats - FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS);
    const dispatcherCost = extraDispatchers * FLEET_SUBSCRIPTION_PRICING.EXTRA_DISPATCHER;

    return FLEET_SUBSCRIPTION_PRICING.BASE_PRICE + techCost + dispatcherCost;
}

/**
 * Format cost in dollars
 */
export function formatSubscriptionCost(cents: number): string {
    return `$${(cents / 100).toFixed(0)}`;
}

/**
 * Generate a unique invite code
 */
export function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

/**
 * Check if invite is expired
 */
export function isInviteExpired(invite: FleetInvite): boolean {
    return Date.now() > invite.expiresAt;
}

/**
 * Get seat usage for an organization
 */
export interface SeatUsage {
    dispatchers: { current: number; max: number; available: number };
    technicians: { current: number; max: number; available: number };
}

export function getSeatUsage(org: FleetOrganization, members: FleetMember[]): SeatUsage {
    const activeMembers = members.filter(m => m.status === 'active');
    const dispatcherCount = activeMembers.filter(m => m.role === 'dispatcher').length;
    const technicianCount = activeMembers.filter(m => m.role === 'technician').length;

    return {
        dispatchers: {
            current: dispatcherCount,
            max: org.maxDispatchers,
            available: Math.max(0, org.maxDispatchers - dispatcherCount),
        },
        technicians: {
            current: technicianCount,
            max: org.maxTechnicians,
            available: Math.max(0, org.maxTechnicians - technicianCount),
        },
    };
}

/**
 * Check if organization can add more members of a given role
 */
export function canAddMember(org: FleetOrganization, members: FleetMember[], role: FleetUserRole): boolean {
    if (role === 'owner') return false; // Only one owner

    const usage = getSeatUsage(org, members);

    if (role === 'dispatcher') {
        return usage.dispatchers.available > 0;
    }

    return usage.technicians.available > 0;
}

/**
 * Generate unique IDs
 */
export function generateOrganizationId(): string {
    return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMemberId(): string {
    return `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateInviteId(): string {
    return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
