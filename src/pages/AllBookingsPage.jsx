import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function AllBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/bookings");
      setBookings(res.data);
      setFilteredBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = bookings;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b._id.toLowerCase().includes(term) ||
        b.user?.name?.toLowerCase().includes(term) ||
        b.bus?.busName?.toLowerCase().includes(term)
      );
    }

    if (filterMethod !== "all") {
      result = result.filter(b => b.paymentMethod === filterMethod);
    }

    if (filterStatus !== "all") {
      result = result.filter(b => b.paymentStatus === filterStatus);
    }

    setFilteredBookings(result);
  }, [searchTerm, filterMethod, filterStatus, bookings]);

  const confirmPayment = async (id) => {
    if (window.confirm("Confirm payment received? This will mark the booking as paid.")) {
      try {
        await axiosInstance.put(`/admin/confirm-payment/${id}`);
        fetchBookings();
      } catch (err) {
        alert("Failed to confirm payment");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Reservation Audit
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">All <span className="text-red-600">Bookings</span></h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Review and verify every transaction within the booking network.</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-red-100 p-8 rounded-3xl shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Search Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="ID, Passenger, or Bus Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-400 font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Payment Channel</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold cursor-pointer"
              >
                <option value="all">Every Channel</option>
                <option value="online">Digital Wallet</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Settlement Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold cursor-pointer"
              >
                <option value="all">Every Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Awaiting Verification</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Results */}
        <div className="bg-white border border-red-100 rounded-[2rem] shadow-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-red-50 bg-red-50/20">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / Route</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger Detail</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Seats</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Ledger...</p>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      No records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <motion.tr
                      key={b._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-red-50/30 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-black text-sm tracking-tight mb-0.5 uppercase">ID {b._id.slice(-6)}</span>
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{b.bus?.from} → {b.bus?.to}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xs">
                            {b.user?.name ? b.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-bold leading-tight">{b.user?.name || "No Name"}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{b.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center text-slate-900 font-black tracking-widest">
                        {b.seats?.join(", ") || "?"}
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-black">₹{b.totalFare}</span>
                          <div className="flex items-center gap-2 mt-1">
                            {b.paymentMethod === 'online' ? (
                              <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.1em] bg-red-50 px-2 py-0.5 rounded border border-red-100">Digital</span>
                            ) : (
                              <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.1em] bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Cash</span>
                            )}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${b.paymentStatus === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                              {b.paymentStatus === 'completed' ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {b.paymentMethod === 'cash' && b.paymentStatus === 'pending' ? (
                          <button
                            onClick={() => confirmPayment(b._id)}
                            className="bg-white border-2 border-red-600 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center gap-2 ml-auto"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" /></svg>
                            Confirm Payment
                          </button>
                        ) : (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Log</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AllBookingsPage;
