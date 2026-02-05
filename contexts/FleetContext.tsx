'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE } from '@/lib/config';
import { useAuth } from './AuthContext';
import {
    FleetOrganization,
    FleetMember,
    FleetInvite,
    FleetUserRole,
    FleetPermissions,
    SeatUsage,
    ROLE_PERMISSIONS,
    getSeatUsage,
    canAddMember,
    generateInviteCode,
    generateOrganizationId,
    generateMemberId,
    generateInviteId,
    FLEET_SUBSCRIPTION_PRICING,
} from '@/lib/fleetSubscriptionTypes';

// ============================================================================
// Context Types
// ============================================================================

interface FleetContextType {
    // State
    organization: FleetOrganization | null;
    members: FleetMember[];
    currentMember: FleetMember | null;
    invites: FleetInvite[];
    loading: boolean;
    error: string | null;

    // Role & Permissions
    role: FleetUserRole | null;
    permissions: FleetPermissions | null;
    isFleetOwner: boolean;
    isFleetMember: boolean;

    // Seat usage
    seatUsage: SeatUsage | null;
    canAddDispatcher: boolean;
    canAddTechnician: boolean;

    // Actions
    createOrganization: (name: string) => Promise<FleetOrganization | null>;
    inviteMember: (email: string, role: Exclude<FleetUserRole, 'owner'>) => Promise<{ inviteCode: string; inviteLink: string } | null>;
    removeMember: (memberId: string) => Promise<boolean>;
    updateMemberRole: (memberId: string, role: FleetUserRole) => Promise<boolean>;
    acceptInvite: (inviteCode: string) => Promise<boolean>;
    refresh: () => Promise<void>;
    refreshOrganization: () => Promise<void>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

// ============================================================================
// API Helpers
// ============================================================================

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('session_token') || localStorage.getItem('auth_token')
        : null;

    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!res.ok) {
            console.error(`Fleet API error ${res.status}:`, await res.text());
            return null;
        }

        return res.json();
    } catch (e) {
        console.error('Fleet API request failed:', e);
        return null;
    }
}

// ============================================================================
// Provider
// ============================================================================

export const FleetProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth();

    const [organization, setOrganization] = useState<FleetOrganization | null>(null);
    const [members, setMembers] = useState<FleetMember[]>([]);
    const [invites, setInvites] = useState<FleetInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // =========================================================================
    // Derived State
    // =========================================================================

    const currentMember = members.find(m => m.userId === user?.id) || null;
    const role = currentMember?.role || null;
    const permissions = role ? ROLE_PERMISSIONS[role] : null;
    const isFleetOwner = role === 'owner';
    const isFleetMember = !!currentMember;

    const seatUsage = organization ? getSeatUsage(organization, members) : null;
    const canAddDispatcher = organization ? canAddMember(organization, members, 'dispatcher') : false;
    const canAddTechnician = organization ? canAddMember(organization, members, 'technician') : false;

    // =========================================================================
    // Load Fleet Data
    // =========================================================================

    const loadFleetData = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch organization and members
            const data = await apiRequest<{
                organization: FleetOrganization | null;
                members: FleetMember[];
                invites: FleetInvite[];
            }>('/api/fleet/organization');

            if (data) {
                setOrganization(data.organization);
                setMembers(data.members || []);
                setInvites(data.invites || []);
            }
        } catch (e) {
            setError('Failed to load fleet data');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        loadFleetData();
    }, [loadFleetData]);

    // =========================================================================
    // Actions
    // =========================================================================

    const createOrganization = useCallback(async (name: string): Promise<FleetOrganization | null> => {
        if (!user) return null;

        const newOrg: FleetOrganization = {
            id: generateOrganizationId(),
            ownerUserId: user.id,
            name,
            plan: 'fleet_basic',
            maxDispatchers: FLEET_SUBSCRIPTION_PRICING.INCLUDED_DISPATCHERS,
            maxTechnicians: FLEET_SUBSCRIPTION_PRICING.MIN_TECHNICIANS,
            billingCycle: 'monthly',
            monthlyCost: FLEET_SUBSCRIPTION_PRICING.MINIMUM_MONTHLY,
            status: 'active',
            createdAt: Date.now(),
        };

        const result = await apiRequest<{ organization: FleetOrganization }>('/api/fleet/organization', {
            method: 'POST',
            body: JSON.stringify(newOrg),
        });

        if (result?.organization) {
            setOrganization(result.organization);
            // Owner is automatically a member
            const ownerMember: FleetMember = {
                id: generateMemberId(),
                organizationId: result.organization.id,
                userId: user.id,
                role: 'owner',
                displayName: user.name,
                email: user.email,
                status: 'active',
                joinedAt: Date.now(),
                createdAt: Date.now(),
            };
            setMembers([ownerMember]);
            return result.organization;
        }

        return null;
    }, [user]);

    const inviteMember = useCallback(async (
        email: string,
        role: Exclude<FleetUserRole, 'owner'>
    ): Promise<{ inviteCode: string; inviteLink: string } | null> => {
        if (!organization || !user) return null;

        // Check seat limits
        if (role === 'dispatcher' && !canAddDispatcher) {
            setError('Dispatcher seat limit reached. Upgrade to add more.');
            return null;
        }
        if (role === 'technician' && !canAddTechnician) {
            setError('Technician seat limit reached. Upgrade to add more.');
            return null;
        }

        const inviteCode = generateInviteCode();
        const invite: FleetInvite = {
            id: generateInviteId(),
            organizationId: organization.id,
            email,
            role,
            inviteCode,
            organizationName: organization.name,
            invitedByName: user.name,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            createdAt: Date.now(),
        };

        const result = await apiRequest<{ invite: FleetInvite }>('/api/fleet/invite', {
            method: 'POST',
            body: JSON.stringify(invite),
        });

        if (result?.invite) {
            setInvites(prev => [...prev, result.invite]);
            const inviteLink = `${window.location.origin}/fleet/invite/${inviteCode}`;
            return { inviteCode, inviteLink };
        }

        return null;
    }, [organization, user, canAddDispatcher, canAddTechnician]);

    const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
        const member = members.find(m => m.id === memberId);
        if (!member || member.role === 'owner') return false; // Can't remove owner

        const result = await apiRequest<{ success: boolean }>(`/api/fleet/members/${memberId}`, {
            method: 'DELETE',
        });

        if (result?.success) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
            return true;
        }

        return false;
    }, [members]);

    const updateMemberRole = useCallback(async (memberId: string, newRole: FleetUserRole): Promise<boolean> => {
        const member = members.find(m => m.id === memberId);
        if (!member || member.role === 'owner') return false; // Can't change owner role

        const result = await apiRequest<{ member: FleetMember }>(`/api/fleet/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole }),
        });

        if (result?.member) {
            setMembers(prev => prev.map(m => m.id === memberId ? result.member : m));
            return true;
        }

        return false;
    }, [members]);

    const acceptInvite = useCallback(async (inviteCode: string): Promise<boolean> => {
        if (!user) return false;

        const result = await apiRequest<{ member: FleetMember; organization: FleetOrganization }>('/api/fleet/invite/accept', {
            method: 'POST',
            body: JSON.stringify({ inviteCode, userId: user.id }),
        });

        if (result?.member && result?.organization) {
            setOrganization(result.organization);
            setMembers(prev => [...prev, result.member]);
            return true;
        }

        return false;
    }, [user]);

    // =========================================================================
    // Render
    // =========================================================================

    return (
        <FleetContext.Provider
            value={{
                organization,
                members,
                currentMember,
                invites,
                loading,
                error,
                role,
                permissions,
                isFleetOwner,
                isFleetMember,
                seatUsage,
                canAddDispatcher,
                canAddTechnician,
                createOrganization,
                inviteMember,
                removeMember,
                updateMemberRole,
                acceptInvite,
                refresh: loadFleetData,
                refreshOrganization: loadFleetData,
            }}
        >
            {children}
        </FleetContext.Provider>
    );
};

// ============================================================================
// Hook
// ============================================================================

export const useFleet = () => {
    const context = useContext(FleetContext);
    if (context === undefined) {
        throw new Error('useFleet must be used within a FleetProvider');
    }
    return context;
};

// ============================================================================
// Permission Guard Hook
// ============================================================================

export function useFleetPermission(permission: keyof FleetPermissions): boolean {
    const { permissions } = useFleet();
    return permissions?.[permission] ?? false;
}

export function useRequireFleetRole(allowedRoles: FleetUserRole[]): {
    hasAccess: boolean;
    role: FleetUserRole | null;
} {
    const { role } = useFleet();
    const hasAccess = role !== null && allowedRoles.includes(role);
    return { hasAccess, role };
}
