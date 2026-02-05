/**
 * Fleet Subscription & Organization Types
 * 
 * Defines roles, permissions, and data structures for the Fleet add-on subscription tier.
 * Built for modern automotive locksmith dispatch operations.
 * 
 * Industry terms:
 * - Service Technician: Field tech who performs automotive locksmith work
 * - Dispatcher: Office/call center staff who manages job assignments
 * - Service Area: Geographic zones a technician covers
 * - ETA: Estimated time of arrival for field service
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

// Display labels for roles (locksmith industry terminology)
export const ROLE_LABELS: Record<FleetUserRole, string> = {
    owner: 'Fleet Owner',
    dispatcher: 'Dispatcher',
    technician: 'Service Technician',
} as const;

export const ROLE_ICONS: Record<FleetUserRole, string> = {
    owner: '👑',
    dispatcher: '📞',
    technician: '🔧',
} as const;

// Technician specialization options
export const TECHNICIAN_SPECIALIZATIONS = [
    'automotive_locksmith',    // General automotive key work
    'eeprom_specialist',       // EEPROM/dump reads
    'oem_programming',         // OEM tool certified (NASTF/VSP)
    'motorcycle_marine',       // Motorcycles, boats, RVs
    'safe_vault',             // Safes and vaults
    'commercial_access',      // Commercial door hardware
] as const;

export type TechnicianSpecialization = typeof TECHNICIAN_SPECIALIZATIONS[number];

// ============================================================================
// Types
// ============================================================================

export type FleetUserRole = 'owner' | 'dispatcher' | 'technician';

export type FleetSubscriptionPlan = 'fleet_basic' | 'fleet_pro' | 'fleet_enterprise';

export type OrganizationStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export type MemberStatus = 'active' | 'suspended' | 'pending' | 'on_break';

/**
 * Service Area - geographic zones for dispatching
 */
export interface ServiceArea {
    id: string;
    name: string;              // e.g., "North Dallas", "Downtown Houston"
    zipCodes?: string[];       // Covered ZIP codes
    radius?: number;           // Coverage radius in miles
    centerLat?: number;
    centerLng?: number;
}

/**
 * Fleet Organization - represents a business with a fleet subscription
 */
export interface FleetOrganization {
    id: string;
    ownerUserId: string;
    name: string;

    // Business Info
    businessPhone?: string;
    businessEmail?: string;
    businessAddress?: string;
    timezone?: string;        // e.g., 'America/Chicago'
    operatingHours?: {
        start: string;        // "08:00"
        end: string;          // "18:00"
        daysOfWeek: number[]; // [1,2,3,4,5] = Mon-Fri
    };

    // Subscription
    plan: FleetSubscriptionPlan;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;

    // Seat limits
    maxDispatchers: number;
    maxTechnicians: number;

    // Service Areas
    serviceAreas?: ServiceArea[];

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
    avatar?: string;

    // Technician-specific fields
    technicianProfile?: {
        specializations: TechnicianSpecialization[];
        certifications?: string[];          // e.g., "NASTF Certified", "Autel IM608 Trained"
        preferredTools?: string[];          // Tools they have in their van
        serviceAreaIds?: string[];          // Which zones they cover
        vehicleInfo?: string;               // "2024 Ford Transit - License ABC123"
        maxDailyJobs?: number;              // Capacity limit
        averageResponseTime?: number;       // Minutes (for routing optimization)
    };

    // Dispatcher-specific fields
    dispatcherProfile?: {
        canHandleAfterHours: boolean;
        languages?: string[];               // e.g., ['en', 'es']
    };

    // Status
    status: MemberStatus;
    currentStatus?: 'available' | 'busy' | 'on_job' | 'off_duty' | 'en_route';
    lastLocationUpdate?: number;
    lastKnownLocation?: { lat: number; lng: number };

    // Invitation tracking
    invitedBy?: string;
    invitedAt?: number;
    joinedAt?: number;

    // Performance metrics (auto-calculated)
    metrics?: {
        jobsCompleted?: number;
        averageRating?: number;
        completionRate?: number;          // % of assigned jobs completed
        averageTimeToComplete?: number;   // Minutes
    };

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

    // Pre-configured settings for the invite
    presetSpecializations?: TechnicianSpecialization[];
    presetServiceAreaIds?: string[];

    // Display info
    organizationName: string;
    invitedByName: string;

    // Status
    expiresAt: number;
    acceptedAt?: number;
    acceptedByUserId?: number;

    // Metadata
    createdAt: number;
}

/**
 * Granular permissions that can override role defaults
 */
export interface FleetPermissions {
    // Dispatch Operations
    canViewDispatchQueue: boolean;
    canClaimJobs: boolean;
    canAssignJobs: boolean;
    canReassignJobs: boolean;
    canCancelJobs: boolean;

    // Team Management
    canManageTeam: boolean;
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canEditMemberRoles: boolean;

    // Reporting & Analytics
    canViewAnalytics: boolean;
    canViewFinancials: boolean;
    canExportData: boolean;
    canViewTeamMetrics: boolean;

    // Settings
    canEditSettings: boolean;
    canManageServiceAreas: boolean;
    canManageBilling: boolean;
}

// ============================================================================
// Role Permission Defaults
// ============================================================================

export const ROLE_PERMISSIONS: Record<FleetUserRole, FleetPermissions> = {
    owner: {
        canViewDispatchQueue: true,
        canClaimJobs: true,
        canAssignJobs: true,
        canReassignJobs: true,
        canCancelJobs: true,
        canManageTeam: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canEditMemberRoles: true,
        canViewAnalytics: true,
        canViewFinancials: true,
        canExportData: true,
        canViewTeamMetrics: true,
        canEditSettings: true,
        canManageServiceAreas: true,
        canManageBilling: true,
    },
    dispatcher: {
        canViewDispatchQueue: true,
        canClaimJobs: true,
        canAssignJobs: true,
        canReassignJobs: true,
        canCancelJobs: false,
        canManageTeam: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canEditMemberRoles: false,
        canViewAnalytics: true,
        canViewFinancials: false,
        canExportData: false,
        canViewTeamMetrics: true,
        canEditSettings: false,
        canManageServiceAreas: false,
        canManageBilling: false,
    },
    technician: {
        canViewDispatchQueue: true,  // Can see queue to self-claim
        canClaimJobs: true,
        canAssignJobs: false,
        canReassignJobs: false,
        canCancelJobs: false,
        canManageTeam: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canEditMemberRoles: false,
        canViewAnalytics: false,
        canViewFinancials: false,
        canExportData: false,
        canViewTeamMetrics: false,
        canEditSettings: false,
        canManageServiceAreas: false,
        canManageBilling: false,
    },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get human-readable role label
 */
export function getRoleLabel(role: FleetUserRole): string {
    return ROLE_LABELS[role];
}

/**
 * Get role icon emoji
 */
export function getRoleIcon(role: FleetUserRole): string {
    return ROLE_ICONS[role];
}

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
 * Generate a unique invite code (easy to type/read)
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
    total: { current: number; max: number };
}

export function getSeatUsage(org: FleetOrganization, members: FleetMember[]): SeatUsage {
    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'on_break');
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
        total: {
            current: dispatcherCount + technicianCount + 1, // +1 for owner
            max: org.maxDispatchers + org.maxTechnicians + 1,
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
 * Get available technicians (for job assignment)
 */
export function getAvailableTechnicians(members: FleetMember[]): FleetMember[] {
    return members.filter(m =>
        m.role === 'technician' &&
        m.status === 'active' &&
        m.currentStatus === 'available'
    );
}

/**
 * Find best technician for a job (simple proximity + availability)
 */
export function findBestTechnicianForJob(
    members: FleetMember[],
    jobLocation?: { lat: number; lng: number },
    requiredSpecializations?: TechnicianSpecialization[]
): FleetMember | null {
    const available = getAvailableTechnicians(members);

    // Filter by specialization if required
    const qualified = requiredSpecializations?.length
        ? available.filter(m =>
            requiredSpecializations.every(spec =>
                m.technicianProfile?.specializations?.includes(spec)
            )
        )
        : available;

    if (qualified.length === 0) return null;
    if (!jobLocation) return qualified[0];

    // Sort by distance (simplified - would use proper haversine in production)
    const withDistance = qualified
        .filter(m => m.lastKnownLocation)
        .map(m => ({
            member: m,
            distance: Math.sqrt(
                Math.pow(m.lastKnownLocation!.lat - jobLocation.lat, 2) +
                Math.pow(m.lastKnownLocation!.lng - jobLocation.lng, 2)
            ),
        }))
        .sort((a, b) => a.distance - b.distance);

    return withDistance[0]?.member || qualified[0];
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

export function generateServiceAreaId(): string {
    return `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get specialization display label
 */
export function getSpecializationLabel(spec: TechnicianSpecialization): string {
    const labels: Record<TechnicianSpecialization, string> = {
        automotive_locksmith: 'Automotive Locksmith',
        eeprom_specialist: 'EEPROM/Dump Specialist',
        oem_programming: 'OEM Programming (NASTF)',
        motorcycle_marine: 'Motorcycle & Marine',
        safe_vault: 'Safe & Vault',
        commercial_access: 'Commercial Access Control',
    };
    return labels[spec];
}
