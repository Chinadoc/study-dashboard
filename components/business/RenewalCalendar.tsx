'use client';

import React, { useState, useMemo } from 'react';
import { UserLicense } from './LicensureDashboard';

interface RenewalCalendarProps {
    licenses: UserLicense[];
    onSelectRenewal?: (license: UserLicense) => void;
}

// Helper functions (reused from CalendarView pattern)
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RenewalCalendar({ licenses, onSelectRenewal }: RenewalCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Build renewal map by date
    const renewalsByDate = useMemo(() => {
        const map = new Map<string, UserLicense[]>();
        licenses.forEach(license => {
            if (license.expirationDate) {
                const dateKey = license.expirationDate.split('T')[0];
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey)!.push(license);
            }
        });
        return map;
    }, [licenses]);

    // Get renewals for current month
    const monthRenewals = useMemo(() => {
        return licenses.filter(license => {
            if (!license.expirationDate) return false;
            const expiry = new Date(license.expirationDate);
            return expiry.getMonth() === currentMonth && expiry.getFullYear() === currentYear;
        });
    }, [licenses, currentMonth, currentYear]);

    // Navigation
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
        setSelectedDate(null);
    };

    // Build calendar grid
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayKey = formatDateKey(today);

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    // Selected date renewals
    const selectedRenewals = selectedDate ? renewalsByDate.get(selectedDate) || [] : [];

    // Get urgency for a renewal
    const getUrgencyColor = (license: UserLicense) => {
        const expiry = new Date(license.expirationDate);
        const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) return 'bg-red-500';
        if (daysLeft <= 7) return 'bg-orange-500';
        if (daysLeft <= 30) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    📅 Renewal Calendar
                </h3>
                <div className="text-xs text-gray-500">
                    {monthRenewals.length} renewal{monthRenewals.length !== 1 ? 's' : ''} this month
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={prevMonth}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                    ←
                </button>
                <div className="text-sm font-bold text-white">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                </div>
                <button
                    onClick={nextMonth}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                    →
                </button>
            </div>

            {/* Compact Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
                {DAY_NAMES.map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] font-bold text-gray-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayRenewals = renewalsByDate.get(dateKey) || [];
                    const isToday = dateKey === todayKey;
                    const isSelected = dateKey === selectedDate;
                    const hasRenewals = dayRenewals.length > 0;

                    // Get worst urgency for the day
                    let dotColor = 'bg-green-500';
                    if (hasRenewals) {
                        const urgencies = dayRenewals.map(r => {
                            const exp = new Date(r.expirationDate);
                            return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        });
                        const minDays = Math.min(...urgencies);
                        if (minDays <= 0) dotColor = 'bg-red-500 animate-pulse';
                        else if (minDays <= 7) dotColor = 'bg-orange-500';
                        else if (minDays <= 30) dotColor = 'bg-yellow-500';
                    }

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                            className={`
                                aspect-square rounded flex flex-col items-center justify-center relative transition-all text-xs
                                ${isSelected ? 'bg-yellow-500/30 ring-1 ring-yellow-500' : 'hover:bg-gray-800'}
                                ${isToday && !isSelected ? 'ring-1 ring-yellow-500/50' : ''}
                            `}
                        >
                            <span className={`${isToday ? 'font-bold text-yellow-400' : 'text-gray-400'}`}>
                                {day}
                            </span>
                            {hasRenewals && (
                                <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Renewals */}
            {selectedDate && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 mb-2">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                        })}
                    </div>
                    {selectedRenewals.length > 0 ? (
                        <div className="space-y-2">
                            {selectedRenewals.map(license => (
                                <div
                                    key={license.id}
                                    onClick={() => onSelectRenewal?.(license)}
                                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{license.icon}</span>
                                        <span className="text-sm text-white">{license.name}</span>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${getUrgencyColor(license)}`} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-2 text-gray-500 text-xs">
                            No renewals on this date
                        </div>
                    )}
                </div>
            )}

            {/* Upcoming renewals list */}
            {monthRenewals.length > 0 && !selectedDate && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 mb-2">This Month</div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {monthRenewals.slice(0, 3).map(license => (
                            <div
                                key={license.id}
                                className="flex items-center justify-between text-xs p-1.5 bg-gray-800/30 rounded"
                            >
                                <span className="text-gray-300 truncate">{license.icon} {license.name}</span>
                                <span className="text-gray-500">
                                    {new Date(license.expirationDate).getDate()}th
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
