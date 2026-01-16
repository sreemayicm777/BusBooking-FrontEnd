import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { generateTicketPDF } from "../utils/ticketGenerator";
import { motion } from "framer-motion";

function BookingHistoryPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchHistory();
    }, [user, navigate]);

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get("/bookings/my-bookings");
            // Filter for past or cancelled trips
            const historyBookings = res.data.filter(b =>
                b.status === "cancelled" || new Date(b.bus.startDateTime) <= new Date()
            );
            setBookings(historyBookings);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Trip Archive
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Travel <span className="text-slate-400">History</span></h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">A complete record of your previous adventures.</p>
                    </div>
                    <Link
                        to="/my-bookings"
                        className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-50"
                    >
                        Active Bookings
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Archives...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white border border-slate-100 p-16 rounded-[2.5rem] text-center shadow-sm">
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No History Found</h3>
                        <p className="text-slate-500 font-medium">Your travel history is currently empty.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center group hover:border-slate-300 transition-all opacity-80 hover:opacity-100"
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-center flex-grow">
                                    <div className="text-center md:text-left min-w-[120px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(booking.bus.startDateTime).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-500 font-bold">{new Date(booking.bus.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-slate-800 tracking-tight">{booking.bus.from} ➔ {booking.bus.to}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-black">{booking.bus.busName} • {booking.bus.busNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 mt-6 md:mt-0">
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900 leading-none">₹{booking.totalFare}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block ${booking.status === 'cancelled' ? 'text-red-500' : 'text-slate-400'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    {booking.status !== 'cancelled' && (
                                        <button
                                            onClick={() => generateTicketPDF(booking)}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-400 p-3 rounded-xl border border-slate-100 transition-all"
                                            title="Download Receipt"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingHistoryPage;
