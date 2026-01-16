import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { generateTicketPDF } from "../utils/ticketGenerator";
import { motion, AnimatePresence } from "framer-motion";

function BookBusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBusDetails();
  }, [id]);

  const fetchBusDetails = async () => {
    try {
      const res = await axiosInstance.get(`/buses/${id}`);
      setBus(res.data);
    } catch (err) {
      setError("Failed to load bus details.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    if (paymentMethod === "online") {
      setShowPaymentModal(true);
    } else {
      executeBooking("cash", "pending");
    }
  };

  const executeBooking = async (method, status) => {
    setBookingLoading(true);
    try {
      const res = await axiosInstance.post("/bookings/book", {
        busId: bus._id,
        seats: selectedSeats,
        paymentMethod: method,
      });

      const booking = res.data;
      booking.paymentStatus = status;

      if (method === "online") {
        setShowPaymentModal(false);
      }

      alert(`Booking Successful! ${method === 'cash' ? 'Please pay the amount on boarding.' : 'Payment confirmed.'}`);

      try {
        generateTicketPDF(booking, bus);
      } catch (pdfErr) {
        console.error("PDF generation failed", pdfErr);
      }

      navigate("/my-bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FEF9F2]">
      <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Bus Layout...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FEF9F2]">
      <div className="bg-white border border-red-100 p-10 rounded-3xl text-center max-w-md shadow-xl">
        <h2 className="text-2xl font-black text-red-600 mb-2">Error</h2>
        <p className="text-slate-500 mb-6 font-medium">{error}</p>
        <button onClick={() => navigate("/search")} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Back to Search</button>
      </div>
    </div>
  );

  const totalFare = selectedSeats.length * (bus.fare || 300);

  return (
    <div className="min-h-screen bg-[#FEF9F2] pb-20 pt-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-black uppercase tracking-widest text-[10px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            Back to Fleet
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{bus.busName}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{bus.from} to {bus.to} • {new Date(bus.startDateTime).toLocaleDateString()}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Seat Selection Area */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-red-100 shadow-xl p-6 md:p-10">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">Choose Your Seats</h2>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <LegendItem color="bg-slate-200 border-slate-300" label="Booked" />
                <LegendItem color="bg-white border-slate-200" label="Available" />
                <LegendItem color="bg-red-600 text-white border-red-600 shadow-md shadow-red-100" label="Selected" />
              </div>
            </div>

            <div className="flex justify-center py-10">
              <div className="relative bg-white border-4 border-slate-100 rounded-[3rem] p-12 shadow-inner w-full max-w-[340px]">
                {/* Driver Side */}
                <div className="flex justify-end mb-12 border-b-2 border-slate-50 pb-8 mr-4">
                  <div className="w-10 h-10 border-2 border-slate-200 rounded-xl flex items-center justify-center opacity-30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2.5" /></svg>
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                  {[1, 2, 3, 4, 5, 21, 22, 23, 24, 25].map(num => (
                    <Seat
                      key={num}
                      num={num}
                      status={bus.bookedSeats?.includes(num) ? "booked" : (selectedSeats.includes(num) ? "selected" : "available")}
                      onClick={() => toggleSeat(num)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-8 sticky top-28">
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Booking Summary</h3>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Selected Seats</span>
                  <span className="text-red-600 font-black tracking-widest">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <PaymentTab
                      active={paymentMethod === "online"}
                      onClick={() => setPaymentMethod("online")}
                      label="Online"
                      icon="💳"
                    />
                    <PaymentTab
                      active={paymentMethod === "cash"}
                      onClick={() => setPaymentMethod("cash")}
                      label="Cash"
                      icon="💵"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-100">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">₹{totalFare}</p>
              </div>

              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || bookingLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {bookingLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Complete Booking</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
              <p className="text-center text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-widest">Secure 128-bit Encryption</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border border-red-100 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-600 border border-red-100">
                <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" /></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Confirm Payment</h2>
              <p className="text-slate-500 font-medium mb-10">Proceeding with digital transaction of <span className="text-red-600 font-black">₹{totalFare}</span> for {selectedSeats.length} seats.</p>

              <div className="flex flex-col gap-3">
                <button onClick={() => executeBooking("online", "completed")} className="bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase tracking-widest text-xs">Verify & Pay</button>
                <button onClick={() => setShowPaymentModal(false)} className="bg-white text-slate-400 font-black py-4 rounded-xl hover:text-slate-600 transition-all uppercase tracking-widest text-[10px]">Back to Summary</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3.5 h-3.5 rounded-md border-2 ${color}`}></div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function Seat({ num, status, onClick }) {
  const base = "w-11 h-11 border-2 rounded-xl flex items-center justify-center text-[11px] font-black transition-all relative";
  const statusStyles = {
    booked: "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed",
    selected: "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 scale-110 z-10",
    available: "bg-white border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-500"
  };

  return (
    <button
      disabled={status === 'booked'}
      onClick={onClick}
      className={`${base} ${statusStyles[status]}`}
    >
      {num}
      {status === 'selected' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-red-600 rounded-full"></div>}
    </button>
  )
}

function PaymentTab({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[9px] transition-all
            ${active ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
    >
      <span className="text-xl opacity-80">{icon}</span>
      {label}
    </button>
  )
}

export default BookBusPage;