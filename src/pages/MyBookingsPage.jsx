import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { generateTicketPDF } from "../utils/ticketGenerator";
import { motion, AnimatePresence } from "framer-motion";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMyBookings();
  }, [user, navigate]);

  const fetchMyBookings = async () => {
    try {
      const res = await axiosInstance.get("/bookings/my-bookings");
      const activeBookings = res.data.filter(b => b.status === "confirmed" && new Date(b.bus.startDateTime) > new Date());
      setBookings(activeBookings);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axiosInstance.put(`/bookings/cancel/${id}`);
        fetchMyBookings();
      } catch (err) {
        alert("Cancellation failed: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Upcoming Travels
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My <span className="text-red-600">Bookings</span></h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Your active reservations and digital boarding passes.</p>
          </div>
          <Link
            to="/booking-history"
            className="px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest transition-all hover:bg-red-50 shadow-sm"
          >
            Past History
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Tickets...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-red-100 p-16 rounded-[2.5rem] text-center shadow-xl">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-100">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2.5" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">No Active Bookings</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">It seems you haven't reserved any seats yet. Ready to start your journey?</p>
            <Link to="/search" className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 transition-all inline-block">
              Find a Bus
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-red-100 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-lg group hover:border-red-300 transition-all"
              >
                <div className="w-2 bg-red-600 transition-all group-hover:w-4"></div>

                <div className="flex-grow p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div className="space-y-6 flex-grow">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reference: #{booking._id.slice(-6).toUpperCase()}</span>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-black text-slate-900">{booking.bus.from}</p>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">ORIGIN</p>
                          </div>
                          <div className="flex-grow flex items-center px-2">
                            <div className="h-[2px] w-full bg-red-50 relative">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-black text-slate-900">{booking.bus.to}</p>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">DESTINATION</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Travel Date</p>
                          <p className="text-slate-800 font-bold">{new Date(booking.bus.startDateTime).toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seats</p>
                          <p className="text-red-600 font-black tracking-widest">{booking.seats.join(", ")}</p>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bus Unit</p>
                          <p className="text-slate-800 font-bold uppercase">{booking.bus.busName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-6 md:min-w-[200px] border-l border-slate-50 pl-0 md:pl-10">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-slate-900 leading-none">₹{booking.totalFare}</p>
                        <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${booking.paymentStatus === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {booking.paymentStatus === 'completed' ? 'Verified' : 'Unpaid'}
                        </span>
                      </div>

                      <div className="flex flex-col w-full gap-2">
                        <button
                          onClick={() => generateTicketPDF(booking, booking.bus)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-md shadow-red-100"
                        >
                          Print Ticket
                        </button>
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="w-full text-slate-400 hover:text-red-600 font-black uppercase tracking-widest text-[9px] py-2 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;