import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BusCard = ({ bus, role, navigate, deleteBus }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const start = new Date(bus.startDateTime);
    const end = new Date(bus.endDateTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationString = `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;

    const rating = (3.5 + (bus._id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 15) / 10).toFixed(1);

    const isActive = bus.isActive;

    return (
        <div className={`rounded-3xl overflow-hidden transition-all group relative ${isActive
                ? "bg-white border border-slate-200 hover:border-red-300 hover:shadow-xl hover:shadow-red-900/5"
                : "bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50"
            }`}>
            {!isActive && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        Not Active
                    </span>
                </div>
            )}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-6 cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 select-none"
            >
                {/* 1. Brand & Type */}
                <div className="flex-1 flex items-center gap-4 w-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive
                            ? "bg-red-50 text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    <div>
                        <h3 className={`text-xl font-black tracking-tight ${isActive ? "text-slate-800" : "text-white"}`}>{bus.busName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{bus.busNumber}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <div className="flex items-center text-amber-500">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span className="ml-1 text-[11px] font-black">{rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Timeline */}
                <div className={`flex-[2] flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full border-y md:border-y-0 md:border-x py-4 md:py-0 px-0 md:px-8 ${isActive ? "border-slate-100" : "border-slate-800"}`}>
                    <div className="text-center md:text-left min-w-[80px]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{start.toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                            <p className={`text-2xl font-black leading-none ${isActive ? "text-slate-900" : "text-slate-100"}`}>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 truncate max-w-[100px]">{bus.from}</p>
                    </div>

                    <div className="flex-grow flex flex-col items-center gap-1 group/route">
                        <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">{durationString}</span>
                        <div className="w-full h-1 bg-slate-100 relative rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-red-600"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">DIRECT</span>
                    </div>

                    <div className="text-center md:text-right min-w-[70px]">
                        <p className={`text-2xl font-black ${isActive ? "text-slate-900" : "text-slate-100"}`}>{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[100px]">{bus.to}</p>
                    </div>
                </div>

                {/* 3. Pricing */}
                <div className="flex-1 flex items-center justify-between md:justify-end gap-6 w-full">
                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seats from</p>
                        <p className="text-3xl font-black text-red-600 leading-none">₹{bus.fare || 450}</p>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isActive
                                ? "border-slate-200 text-slate-400 hover:text-red-600"
                                : "border-slate-700 text-slate-500 hover:text-white"
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-50 bg-slate-50/50"
                    >
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Amenities & Route */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 px-1">
                                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Route Progression</h4>
                                </div>
                                <div className="space-y-4 pl-1 border-l-2 border-slate-200 ml-2">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-[6px] ring-4 ring-red-100"></div>
                                        <span className="text-sm font-bold text-slate-700">{bus.from}</span>
                                        <span className="text-[10px] text-slate-400 ml-auto font-black">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {bus.stops?.slice(1, -1).map((s, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-slate-300 -ml-[5px]"></div>
                                            <span className="text-sm text-slate-500 font-medium">{s.name}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-[6px] ring-4 ring-emerald-100"></div>
                                        <span className="text-sm font-bold text-slate-700">{bus.to}</span>
                                        <span className="text-[10px] text-slate-400 ml-auto font-black">{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Capacity & CTA */}
                            <div className="flex flex-col justify-center gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                                            <p className="text-3xl font-black text-slate-800">{bus.seatsAvailable} <span className="text-xs text-slate-400 tracking-normal font-bold">Seats Left</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Limit</p>
                                            <p className="text-lg font-black text-slate-500 opacity-50">{bus.totalSeats || 40}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(bus.seatsAvailable / (bus.totalSeats || 40)) * 100}%` }}
                                            className={`h-full rounded-full ${bus.seatsAvailable < 10 ? 'bg-red-500' : 'bg-red-600'}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {role === "user" && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/view-bus/${bus._id}`)}
                                                className={`px-6 py-4 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${isActive
                                                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                                                    }`}
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => navigate(`/book/${bus._id}`)}
                                                disabled={!bus.isActive || bus.seatsAvailable === 0}
                                                className="flex-grow bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                            >
                                                {bus.seatsAvailable === 0 ? "Full" : "Book Now"}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </button>
                                        </>
                                    )}
                                    {role === "admin" && (
                                        <div className="flex gap-3 w-full">
                                            <button onClick={() => navigate(`/update-bus/${bus._id}`)} className="flex-grow py-4 border-2 border-slate-200 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-50 transition-all">Edit Unit</button>
                                            <button onClick={() => deleteBus(bus._id)} className="w-14 py-4 border-2 border-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-50 transition-all flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusCard;
