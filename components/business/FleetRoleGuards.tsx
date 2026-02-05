'use client';

import React, { ReactNode } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { FleetUserRole, FleetPermissions, getRoleLabel, getRoleIcon } from '@/lib/fleetSubscriptionTypes';

// ============================================================================
// Role Gate Component - Conditionally renders children based on role
// ============================================================================

interface RoleGateProps {
    children: ReactNode;
    allowedRoles: FleetUserRole[];
    fallback?: ReactNode;
    requireFleetMember?: boolean;
}

/**
 * Conditionally renders children if user has one of the allowed roles.
 * 
 * @example
 * <RoleGate allowedRoles={['owner', 'dispatcher']}>
 *   <DispatchQueueView />
 * </RoleGate>
 */
export function RoleGate({
    children,
    allowedRoles,
    fallback = null,
    requireFleetMember = true,
}: RoleGateProps) {
    const { role, isFleetMember, loading } = useFleet();

    if (loading) return null;

    if (requireFleetMember && !isFleetMember) {
        return <>{fallback}</>;
    }

    if (role === null || !allowedRoles.includes(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

// ============================================================================
// Permission Gate Component - Conditionally renders based on permission
// ============================================================================

interface PermissionGateProps {
    children: ReactNode;
    permission: keyof FleetPermissions;
    fallback?: ReactNode;
}

/**
 * Conditionally renders children if user has the specified permission.
 * 
 * @example
 * <PermissionGate permission="canAssignJobs">
 *   <AssignJobButton />
 * </PermissionGate>
 */
export function PermissionGate({
    children,
    permission,
    fallback = null
}: PermissionGateProps) {
    const { permissions, loading } = useFleet();

    if (loading) return null;

    if (!permissions?.[permission]) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

// ============================================================================
// Access Denied Component
// ============================================================================

interface AccessDeniedProps {
    requiredRole?: FleetUserRole[];
    requiredPermission?: keyof FleetPermissions;
    title?: string;
    message?: string;
}

/**
 * Displays an access denied message with role information.
 */
export function AccessDenied({
    requiredRole,
    requiredPermission,
    title = 'Access Restricted',
    message,
}: AccessDeniedProps) {
    const { role, isFleetMember } = useFleet();

    const defaultMessage = !isFleetMember
        ? 'You need to be part of a fleet organization to access this page.'
        : requiredRole
            ? `This page is only accessible to ${requiredRole.map(r => getRoleLabel(r)).join(' or ')}.`
            : requiredPermission
                ? `You don't have permission to access this feature.`
                : 'You don\'t have permission to view this page.';

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400 max-w-md mb-6">{message || defaultMessage}</p>
            {role && (
                <div className="bg-slate-800/60 rounded-lg px-4 py-2 text-sm text-slate-400">
                    Your current role: <span className="text-white font-medium">{getRoleIcon(role)} {getRoleLabel(role)}</span>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// With Fleet Role HOC - Protects entire pages
// ============================================================================

interface WithFleetRoleOptions {
    allowedRoles: FleetUserRole[];
    redirectTo?: string;
    LoadingComponent?: React.ComponentType;
    AccessDeniedComponent?: React.ComponentType<AccessDeniedProps>;
}

/**
 * Higher-order component that protects a page based on fleet role.
 * 
 * @example
 * export default withFleetRole(DispatchPage, {
 *   allowedRoles: ['owner', 'dispatcher'],
 * });
 */
export function withFleetRole<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: WithFleetRoleOptions
) {
    const {
        allowedRoles,
        LoadingComponent,
        AccessDeniedComponent = AccessDenied,
    } = options;

    return function FleetRoleProtectedComponent(props: P) {
        const { role, isFleetMember, loading } = useFleet();

        if (loading) {
            if (LoadingComponent) return <LoadingComponent />;
            return (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            );
        }

        if (!isFleetMember || !role || !allowedRoles.includes(role)) {
            return <AccessDeniedComponent requiredRole={allowedRoles} />;
        }

        return <WrappedComponent {...props} />;
    };
}

// ============================================================================
// Owner Only Gate - Convenience component
// ============================================================================

interface OwnerOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Renders children only if user is the fleet owner.
 */
export function OwnerOnly({ children, fallback = null }: OwnerOnlyProps) {
    return (
        <RoleGate allowedRoles={['owner']} fallback={fallback}>
            {children}
        </RoleGate>
    );
}

// ============================================================================
// Dispatcher+ Gate - Dispatchers and Owners
// ============================================================================

interface DispatcherPlusProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Renders children if user is a dispatcher or owner.
 */
export function DispatcherPlus({ children, fallback = null }: DispatcherPlusProps) {
    return (
        <RoleGate allowedRoles={['owner', 'dispatcher']} fallback={fallback}>
            {children}
        </RoleGate>
    );
}

// ============================================================================
// Technician Only Gate
// ============================================================================

interface TechnicianOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Renders children only if user is a technician.
 */
export function TechnicianOnly({ children, fallback = null }: TechnicianOnlyProps) {
    return (
        <RoleGate allowedRoles={['technician']} fallback={fallback}>
            {children}
        </RoleGate>
    );
}

// ============================================================================
// Fleet Member Only Gate
// ============================================================================

interface FleetMemberOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Renders children only if user is any fleet member.
 */
export function FleetMemberOnly({ children, fallback = null }: FleetMemberOnlyProps) {
    const { isFleetMember, loading } = useFleet();

    if (loading) return null;
    if (!isFleetMember) return <>{fallback}</>;

    return <>{children}</>;
}

// ============================================================================
// Can Assign Jobs Gate
// ============================================================================

interface CanAssignJobsProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Renders children if user can assign jobs (owner or dispatcher).
 */
export function CanAssignJobs({ children, fallback = null }: CanAssignJobsProps) {
    return (
        <PermissionGate permission="canAssignJobs" fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

// ============================================================================
// Can Manage Team Gate
// ============================================================================

interface CanManageTeamProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Renders children if user can manage team (owner only by default).
 */
export function CanManageTeam({ children, fallback = null }: CanManageTeamProps) {
    return (
        <PermissionGate permission="canManageTeam" fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

// ============================================================================
// Role Badge Component
// ============================================================================

interface RoleBadgeProps {
    role: FleetUserRole;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

/**
 * Displays a styled badge for a fleet role.
 */
export function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
    const colors = {
        owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        dispatcher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        technician: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span className={`rounded-full border inline-flex items-center gap-1 ${colors[role]} ${sizes[size]}`}>
            {showIcon && <span>{getRoleIcon(role)}</span>}
            {getRoleLabel(role)}
        </span>
    );
}

// ============================================================================
// Use Can Helper Hook
// ============================================================================

/**
 * Hook to check multiple permissions at once.
 */
export function useCan(permission: keyof FleetPermissions): boolean {
    const { permissions } = useFleet();
    return permissions?.[permission] ?? false;
}

/**
 * Hook to check if user has any of the specified permissions.
 */
export function useCanAny(permissions: (keyof FleetPermissions)[]): boolean {
    const { permissions: userPermissions } = useFleet();
    if (!userPermissions) return false;
    return permissions.some(p => userPermissions[p]);
}

/**
 * Hook to check if user has all of the specified permissions.
 */
export function useCanAll(permissions: (keyof FleetPermissions)[]): boolean {
    const { permissions: userPermissions } = useFleet();
    if (!userPermissions) return false;
    return permissions.every(p => userPermissions[p]);
}
