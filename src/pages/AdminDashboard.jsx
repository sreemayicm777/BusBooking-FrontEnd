import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { motion } from "framer-motion";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/");
            return;
        }
        fetchStats();
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            const res = await axiosInstance.get("/admin/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FEF9F2]">
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Analytics...</p>
        </div>
    );

    const COLORS = ['#DC2626', '#F87171'];

    return (
        <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            Live Administration
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin <span className="text-red-600">Dashboard</span></h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring platform performance and bus fleet utilization.</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="px-6 py-3 rounded-xl bg-white border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Revenue" value={`₹${(stats?.summary?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="red" />
                    <StatCard title="Bookings" value={stats?.summary?.totalBookings || 0} icon="🎫" color="blue" />
                    <StatCard title="Total Buses" value={stats?.summary?.totalBuses || 0} icon="🚌" color="emerald" />
                    <StatCard title="Total Users" value={stats?.summary?.totalUsers || 0} icon="👥" color="purple" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Trend Chart */}
                    <div className="lg:col-span-8 bg-white border border-red-100 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg className="w-32 h-32 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                            Revenue Overview
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.monthlyTrend}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#cbd5e1"
                                        fontSize={10}
                                        fontWeight="bold"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#64748b" }}
                                    />
                                    <YAxis
                                        stroke="#cbd5e1"
                                        fontSize={10}
                                        fontWeight="bold"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#64748b" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderColor: '#fee2e2',
                                            borderRadius: '16px',
                                            color: '#1e293b',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#DC2626"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payment Split Chart */}
                    <div className="lg:col-span-4 bg-white border border-red-100 p-8 rounded-3xl shadow-lg flex flex-col">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10">Payment Sources</h3>
                        <div className="flex-grow flex items-center justify-center relative">
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{stats?.summary?.totalRevenue ? "100%" : "0%"}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Online', value: stats?.summary?.onlineRevenue || 0 },
                                            { name: 'Cash', value: stats?.summary?.cashRevenue || 0 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {COLORS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-around mt-6 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">ONLINE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-300"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">CASH</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <TableSection title="Top Performing Routes" icon="📈">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-red-50">
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Path</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tickets</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Income</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.topRoutes?.map((route, i) => (
                                    <tr key={i} className="group hover:bg-red-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-700 font-bold">{route.origin}</span>
                                                <svg className="w-3 h-3 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" /></svg>
                                                <span className="text-slate-700 font-bold">{route.destination}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-center text-slate-500 font-bold">{route.bookings || 0}</td>
                                        <td className="py-5 text-right text-red-600 font-black">₹{(route.revenue || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableSection>

                    <TableSection title="Bus Availability Index" icon="🚐">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-red-50">
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus Unit</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Occupancy</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.busPerformance?.map((bus, i) => (
                                    <tr key={i} className="group hover:bg-red-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-bold">{bus.busName}</span>
                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{bus.busNumber}</span>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-600" style={{ width: `${bus.occupancyRate}%` }}></div>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500">{bus.occupancyRate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-right text-red-600 font-black">₹{(bus.totalRevenue || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableSection>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colorMaps = {
        red: "bg-red-600 text-white shadow-red-100",
        blue: "bg-blue-600 text-white shadow-blue-100",
        emerald: "bg-emerald-600 text-white shadow-emerald-100",
        purple: "bg-purple-600 text-white shadow-purple-100"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white border border-red-100 p-6 rounded-3xl shadow-md group transition-all"
        >
            <div className="flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl ${colorMaps[color]} flex items-center justify-center text-xl shadow-lg`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

function TableSection({ title, icon, children }) {
    return (
        <div className="bg-white border border-red-100 p-8 rounded-3xl shadow-lg pb-10">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                {title}
            </h3>
            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    )
}

export default AdminDashboard;
