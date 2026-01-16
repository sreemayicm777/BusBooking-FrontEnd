import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BusCard from "../components/BusCard";

function Home() {
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const { user, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchLocations = async () => {
    try {
      const res = await axiosInstance.get("/buses/locations");
      setLocations(res.data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

  const fetchBuses = async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.from?.trim()) params.from = filters.from.trim().toLowerCase();
      if (filters.to?.trim()) params.to = filters.to.trim().toLowerCase();
      if (filters.date) params.date = filters.date;

      const response = await axiosInstance.get("/buses", { params });
      setBuses(response.data);
      if (locations.length === 0) fetchLocations();
    } catch (err) {
      console.error("❌ Failed to fetch buses:", err);
      setError("Failed to load buses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (id) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      try {
        await axiosInstance.delete(`/buses/${id}`);
        fetchBuses();
      } catch (err) {
        console.error("❌ Failed to delete bus:", err);
        alert("Failed to delete bus.");
      }
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchLocations();

    if (location.state?.from || location.state?.to) {
      setFrom(location.state.from || "");
      setTo(location.state.to || "");
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleSearch = () => {
    fetchBuses({ from, to, date });
    setHasSearched(true);
  };

  const resetFilters = () => {
    setFrom("");
    setTo("");
    setDate("");
    setHasSearched(false);
    fetchBuses();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-red-600 pt-16 pb-32 md:pb-40 relative px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-4xl md:text-6xl font-black tracking-tighter mb-4"
          >
            Search, Book & <span className="text-red-100 italic">Travel</span>
          </motion.h1>
          <p className="text-red-50 text-base md:text-lg font-medium opacity-90">India's most reliable and comfortable bus booking platform</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 md:-mt-24 relative z-10">
        {/* Search Bar Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-red-200 border border-red-50 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <SearchField
                label="From"
                value={from}
                onChange={setFrom}
                placeholder="Departure City"
                list="loc-from"
              />
              <datalist id="loc-from">
                {locations.filter(l => l !== to).map((l, i) => <option key={i} value={l} />)}
              </datalist>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center pb-4">
              <button
                onClick={() => { const t = from; setFrom(to); setTo(t); }}
                className="w-10 h-10 rounded-full border-2 border-red-100 flex items-center justify-center text-red-600 hover:bg-red-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </button>
            </div>

            <div className="md:col-span-4">
              <SearchField
                label="To"
                value={to}
                onChange={setTo}
                placeholder="Destination City"
                list="loc-to"
              />
              <datalist id="loc-to">
                {locations.filter(l => l !== from).map((l, i) => <option key={i} value={l} />)}
              </datalist>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Journey Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-12 mt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleSearch}
                  className="flex-grow bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Search Buses
                </button>
                {hasSearched && (
                  <button
                    onClick={resetFilters}
                    className="px-10 py-4 bg-slate-50 border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Reset
                  </button>
                )}
                {role === "admin" && (
                  <button
                    onClick={() => navigate("/create-bus")}
                    className="px-10 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    Add Bus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="mt-12 flex items-center justify-between px-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {loading ? "Finding your bus..." : hasSearched ? (
              <>
                Buses for <span className="text-red-600">{date ? new Date(date).toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' }) : "All Dates"}</span>
                <span className="hidden md:inline ml-3 text-sm text-slate-400 font-bold uppercase tracking-widest">({buses.length} results)</span>
              </>
            ) : "Popular Routes & Today's Pricing"}
          </h2>
          {!loading && buses.length > 0 && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">All Fares Incl. Tax</span>
          )}
        </div>

        {/* Status Indicators */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Updating Schedules...</p>
            </div>
          ) : error ? (
            <div className="mt-8 bg-red-50 border border-red-100 p-10 rounded-3xl text-center">
              <p className="text-red-700 font-bold mb-4">{error}</p>
              <button onClick={resetFilters} className="text-red-600 text-xs font-black uppercase tracking-widest underline">Retry Now</button>
            </div>
          ) : buses.length === 0 ? (
            <div className="mt-8 bg-slate-50 border border-slate-100 p-20 rounded-3xl text-center">
              <div className="text-5xl mb-6 opacity-30">🔍</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Buses on this Route</h3>
              <p className="text-slate-500 mb-8 font-medium">Try checking a different date or nearby cities.</p>
              <button onClick={resetFilters} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Show All Buses</button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6">
              {buses.map((bus) => (
                <BusCard
                  key={bus._id}
                  bus={bus}
                  role={role}
                  navigate={navigate}
                  deleteBus={deleteBus}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SearchField({ label, value, onChange, placeholder, list }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
        </div>
        <input
          type="text"
          value={value}
          list={list}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-5 text-slate-900 font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

export default Home;