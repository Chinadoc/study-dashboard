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
        });
    } else if (inventory.length > 0 && totalUnits > 0) {
        alerts.push({
            type: 'info',
            icon: '📦',
            message: `${totalUnits} units across ${inventory.length} item types`,
        });
    }

    if (alerts.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {alerts.slice(0, 2).map((alert, i) => {
                const content = (
                    <div
                        key={i}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                            ${alert.type === 'warning'
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                : alert.type === 'success'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }
                            ${alert.link ? 'hover:opacity-80 cursor-pointer transition-opacity' : ''}
                        `}
                    >
                        <span>{alert.icon}</span>
                        <span>{alert.message}</span>
                    </div>
                );

                return alert.link ? (
                    <Link key={i} href={alert.link}>{content}</Link>
                ) : (
                    content
                );
            })}
        </div>
    );
}
