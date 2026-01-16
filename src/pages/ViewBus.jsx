import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

function ViewBus() {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBus = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/buses/${id}`);
        setBus(response.data);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch bus:", err);
        setError("Failed to load unit parameters. Please re-initiate uplink.");
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FEF9F2]">
      <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Fleet Records...</p>
    </div>
  );

  if (error || !bus) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FEF9F2]">
      <div className="bg-white border border-red-100 p-10 rounded-[2.5rem] text-center max-w-md shadow-xl">
        <h2 className="text-2xl font-black text-red-600 mb-2">Unit Not Found</h2>
        <p className="text-slate-500 mb-6 font-medium">{error || "The requested carrier identifier is invalid or offline."}</p>
        <button onClick={() => navigate(-1)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Return to Fleet</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Technical Specification
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{bus.busName}</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest text-[10px] font-black">Identifier: <span className="text-red-600">{bus.busNumber}</span></p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest transition-all hover:bg-red-50 shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Search
          </button>
        </div>

        {/* Essential Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SpecCard icon="📍" label="Departure Hub" value={bus.from} />
          <SpecCard icon="🏁" label="Destination" value={bus.to} />
          <SpecCard icon="📅" label="Travel Date" value={new Date(bus.startDateTime).toLocaleDateString([], { day: '2-digit', month: 'long' })} />
          <SpecCard icon="⏰" label="Schedule" value={`${new Date(bus.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Route Logistics */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-red-100 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-4">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                Journey Timeline
              </h3>

              <div className="relative pl-8">
                {/* Timeline bar */}
                <div className="absolute left-[39px] top-4 bottom-4 w-[2px] bg-red-50"></div>

                <div className="space-y-12">
                  {bus.stops?.map((stop, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className="relative flex items-center gap-8 group"
                    >
                      {/* Circle indicator */}
                      <div className={`relative z-10 w-4 h-4 rounded-full border-4 border-white shadow-sm ${i === 0 ? 'bg-red-600 ring-4 ring-red-50' :
                        i === bus.stops.length - 1 ? 'bg-emerald-500 ring-4 ring-emerald-50' :
                          'bg-slate-300'
                        }`}></div>

                      <div className="flex-grow bg-slate-50/50 border border-slate-100 p-6 rounded-2xl group-hover:bg-red-50/30 transition-all group-hover:border-red-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-slate-900 font-bold tracking-tight">{stop.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Route Waypoint</p>
                          </div>
                          <div className="text-right">
                            {stop.fareFromStart !== undefined && (
                              <p className="text-xs font-black text-red-600">₹{stop.fareFromStart}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Operational Metrics */}
          <div className="lg:col-span-4 space-y-8">
            {/* Fare & Capacity */}
            <div className="bg-white border border-red-100 p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Quick Metrics</h3>

              <div className="space-y-6">
                <div className="flex justify-between items-end pb-6 border-b border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Ticket Fare</p>
                    <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">₹{bus.fare || 450}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Single Seat</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Available Space</span>
                    <span className={bus.seatsAvailable > 5 ? "text-emerald-600" : "text-red-600"}>
                      {bus.seatsAvailable} / {bus.totalSeats || 40} Seats
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${bus.seatsAvailable > 10 ? 'bg-red-600' : 'bg-red-500'}`}
                      style={{ width: `${(bus.seatsAvailable / (bus.totalSeats || 40)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white border border-red-100 p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Included Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                <AmenityBadge icon="❄️" label="A/C" active={bus.hasAC} />
                <AmenityBadge icon="📶" label="Wi-Fi" active={bus.hasWifi} />
                <AmenityBadge icon="🔌" label="Power" active={true} />
                <AmenityBadge icon="📖" label="Reading" active={true} />
              </div>
            </div>

            {/* Action */}
            <button
              onClick={() => navigate(`/book/${id}`)}
              disabled={bus.seatsAvailable === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-[2rem] shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {bus.seatsAvailable === 0 ? "Fleet Full" : "Reserve Your Seat"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        {/* Safety Footer */}
        <div className="bg-white border border-red-50 p-10 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-2xl border border-red-100">🛡️</div>
            <div>
              <h4 className="text-slate-900 font-bold tracking-tight">Verified Fleet Partner</h4>
              <p className="text-xs text-slate-500 font-medium">Standard safety checks performed before every departure.</p>
            </div>
          </div>
          <div className="flex gap-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Rating</p>
              <p className="text-slate-900 font-black text-xl">4.8 / 5.0</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status</p>
              <p className="text-slate-900 font-black text-xl">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-red-100 p-6 rounded-[2rem] shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg opacity-80">{icon}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-slate-900 truncate tracking-tight">{value}</p>
    </div>
  );
}

function AmenityBadge({ icon, label, active }) {
  return (
    <div className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${active ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50 grayscale'
      }`}>
      <span className="text-xl">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default ViewBus;