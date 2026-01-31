'use client';

import React, { useState, useMemo } from 'react';
import { JobLog } from '@/lib/useJobLogs';

interface CalendarViewProps {
    jobLogs: JobLog[];
    onAddJob: () => void;
    monthlyProfit?: number;
}

// Helper to get days in a month
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

// Format date as YYYY-MM-DD for comparison
function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ jobLogs, onAddJob, monthlyProfit }: CalendarViewProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Build job map by date
    const jobsByDate = useMemo(() => {
        const map = new Map<string, JobLog[]>();
        jobLogs.forEach(job => {
            const dateKey = job.date.split('T')[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(job);
        });
        return map;
    }, [jobLogs]);

    // Calculate monthly stats
    const monthStats = useMemo(() => {
        const monthJobs = jobLogs.filter(job => {
            const jobDate = new Date(job.date);
            return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
        });
        const revenue = monthJobs.reduce((sum, j) => sum + j.price, 0);
        const costs = monthJobs.reduce((sum, j) => sum + (j.partsCost || 0) + (j.keyCost || 0) + (j.gasCost || 0), 0);
        return {
            jobs: monthJobs.length,
            revenue,
            profit: revenue - costs,
            completed: monthJobs.filter(j => j.status === 'completed').length,
            pending: monthJobs.filter(j => j.status === 'pending' || j.status === 'in_progress').length,
        };
    }, [jobLogs, currentMonth, currentYear]);

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

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setSelectedDate(formatDateKey(today));
    };

    // Build calendar grid
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayKey = formatDateKey(today);

    const calendarDays: (number | null)[] = [];
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    // Selected date jobs
    const selectedJobs = selectedDate ? jobsByDate.get(selectedDate) || [] : [];

    return (
        <div className="space-y-6">
            {/* Month Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{monthStats.jobs}</div>
                    <div className="text-xs text-zinc-500 uppercase">Jobs</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">${monthStats.revenue.toFixed(0)}</div>
                    <div className="text-xs text-zinc-500 uppercase">Revenue</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">${monthStats.profit.toFixed(0)}</div>
                    <div className="text-xs text-zinc-500 uppercase">Profit</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{monthStats.pending}</div>
                    <div className="text-xs text-zinc-500 uppercase">Pending</div>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={prevMonth}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    ←
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
                    <button onClick={goToToday} className="text-xs text-yellow-500 hover:text-yellow-400">
                        Today
                    </button>
                </div>
                <button
                    onClick={nextMonth}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAY_NAMES.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-zinc-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                        if (day === null) {
                            return <div key={`empty-${idx}`} className="aspect-square" />;
                        }

                        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayJobs = jobsByDate.get(dateKey) || [];
                        const isToday = dateKey === todayKey;
                        const isSelected = dateKey === selectedDate;
                        const isFuture = new Date(dateKey) > today;
                        const hasCompleted = dayJobs.some(j => j.status === 'completed');
                        const hasPending = dayJobs.some(j => j.status === 'pending' || j.status === 'in_progress');

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                                    ${isSelected ? 'bg-yellow-500/30 border-2 border-yellow-500' : 'hover:bg-zinc-800'}
                                    ${isToday && !isSelected ? 'ring-2 ring-yellow-500/50' : ''}
                                    ${isFuture ? 'text-zinc-400' : 'text-white'}
                                `}
                            >
                                <span className={`text-sm font-medium ${isToday ? 'font-bold' : ''}`}>{day}</span>
                                {dayJobs.length > 0 && (() => {
                                    const dayRevenue = dayJobs.reduce((sum, j) => sum + j.price, 0);
                                    // Scale dot size based on revenue: small < $100, medium $100-$300, large $300+
                                    const dotSize = dayRevenue < 100 ? 'w-2 h-2' : dayRevenue < 300 ? 'w-3 h-3' : 'w-4 h-4';
                                    const dotColor = hasCompleted ? 'bg-green-500' : 'bg-yellow-500';
                                    return (
                                        <div className={`${dotSize} rounded-full ${dotColor} flex items-center justify-center mt-0.5`}>
                                            {dayRevenue >= 300 && <span className="text-[6px] font-bold text-black">{Math.round(dayRevenue / 100)}</span>}
                                        </div>
                                    );
                                })()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Jobs */}
            {selectedDate && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">
                            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <button
                            onClick={onAddJob}
                            className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold hover:bg-yellow-500/30"
                        >
                            + Add Job
                        </button>
                    </div>

                    {selectedJobs.length > 0 ? (
                        <div className="space-y-2">
                            {selectedJobs.map(job => (
                                <div key={job.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-white">{job.vehicle}</div>
                                        {job.customerName && <div className="text-sm text-blue-400">👤 {job.customerName}</div>}
                                        <div className="text-xs text-zinc-500 capitalize">{job.jobType.replace('_', ' ')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-400">${job.price.toFixed(0)}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            job.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {job.status?.replace('_', ' ') || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-zinc-500">
                            <p>No jobs on this date</p>
                            <p className="text-sm mt-1">Click "+ Add Job" to schedule one</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Job Button */}
            <button
                onClick={onAddJob}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all"
            >
                📝 Log New Job
            </button>
        </div>
    );
}
