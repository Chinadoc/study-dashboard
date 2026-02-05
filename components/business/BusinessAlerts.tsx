'use client';

import React from 'react';
import Link from 'next/link';
import { useInventory } from '@/contexts/InventoryContext';
import { getLowStockItems } from '@/lib/inventoryTypes';

export default function BusinessAlerts() {
    const { inventory, loading } = useInventory();

    if (loading) return null;

    // Calculate alerts
    const lowStockItems = getLowStockItems(inventory);
    const lowStockCount = lowStockItems.length;

    // Calculate insights
    const totalKeys = inventory.filter(i => i.type === 'key').length;
    const totalBlanks = inventory.filter(i => i.type === 'blank').length;
    const totalTools = inventory.filter(i => i.type === 'tool').length;
    const totalUnits = inventory.reduce((sum, i) => sum + i.qty, 0);

    // Get unique makes from inventory
    const makes = new Set<string>();
    inventory.forEach(item => {
        if (item.vehicle) {
            item.vehicle.split(',').forEach(v => {
                const make = v.trim().split(' ')[0];
                if (make && make.length > 2) makes.add(make);
            });
        }
    });

    // No alerts if inventory is empty
    if (inventory.length === 0) return null;

    const alerts: { type: 'warning' | 'info' | 'success'; icon: string; message: string; link?: string }[] = [];

    // Low stock warning
    if (lowStockCount > 0) {
        alerts.push({
            type: 'warning',
            icon: '🛒',
            message: `${lowStockCount} item${lowStockCount > 1 ? 's' : ''} running low – consider restocking`,
            link: '/business/inventory?tab=low'
        });
    }

    // Stock insights
    if (totalKeys > 5) {
        alerts.push({
            type: 'success',
            icon: '🔑',
            message: `${totalKeys} key types covering ${makes.size} makes`,
            link: '/business/tools?tab=coverage'
        });
    } else if (inventory.length > 0 && totalUnits > 0) {
        alerts.push({
            type: 'info',
            icon: '📦',
            message: `${totalUnits} units across ${inventory.length} item types`,
        });
    }

    if (alerts.length === 0) return null;

    const AlertChip = ({ alert, index }: { alert: typeof alerts[0]; index: number }) => {
        const chipContent = (
            <div
                className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                    flex-1 min-w-0
                    transition-all duration-200 active:scale-95
                    ${alert.type === 'warning'
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-300 border border-orange-500/40'
                        : alert.type === 'success'
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-300 border border-green-500/40'
                            : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-300 border border-blue-500/40'
                    }
                    ${alert.link ? 'hover:scale-[1.02] cursor-pointer' : ''}
                `}
            >
                <span className="text-sm flex-shrink-0">{alert.icon}</span>
                <span className="truncate">{alert.message}</span>
                {alert.link && (
                    <span className="text-[10px] opacity-60 flex-shrink-0">→</span>
                )}
            </div>
        );

        return alert.link ? (
            <Link key={index} href={alert.link} className="flex-1 min-w-0">
                {chipContent}
            </Link>
        ) : (
            <div key={index} className="flex-1 min-w-0">
                {chipContent}
            </div>
        );
    };

    return (
        <div className="relative z-10">
            {/* Flex container - side by side, no scroll */}
            <div className="flex gap-2">
                {alerts.slice(0, 2).map((alert, i) => (
                    <AlertChip key={i} alert={alert} index={i} />
                ))}
            </div>

            {/* Fade edge indicators on mobile when there are multiple alerts */}
            {alerts.length > 1 && (
                <>
                    <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-gray-900/80 to-transparent pointer-events-none sm:hidden" />
                </>
            )}
        </div>
    );
}

