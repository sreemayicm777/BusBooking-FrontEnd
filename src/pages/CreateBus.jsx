import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

function CreateBus() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Combined Form State
  const [basicInfo, setBasicInfo] = useState({
    busName: "",
    busNumber: "",
    seatsAvailable: 40,
    totalSeats: 40,
    fare: 300,
    isActive: true,
  });

  const [schedule, setSchedule] = useState({
    startDateTime: "",
    endDateTime: "",
  });

  const [route, setRoute] = useState({
    origin: "",
    destination: "",
  });

  const [intermediateStops, setIntermediateStops] = useState([]);
  const [newStop, setNewStop] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handlers
  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
    });
  };

  const handleScheduleChange = (e) => {
    setSchedule({ ...schedule, [e.target.name]: e.target.value });
  };

  const handleRouteChange = (e) => {
    setRoute({ ...route, [e.target.name]: e.target.value });
  };

  const addIntermediateStop = () => {
    if (newStop.trim()) {
      setIntermediateStops([...intermediateStops, newStop.trim()]);
      setNewStop("");
    }
  };

  const removeIntermediateStop = (index) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!route.origin.trim() || !route.destination.trim()) {
      setError("Origin and Destination are required.");
      setLoading(false);
      return;
    }

    if (!schedule.startDateTime || !schedule.endDateTime) {
      setError("Both departure and arrival times are required.");
      setLoading(false);
      return;
    }

    // Construct payload
    const payload = {
      ...basicInfo,
      ...schedule,
      stopNames: [route.origin.trim(), ...intermediateStops, route.destination.trim()],
    };

    try {
      await axiosInstance.post("/buses", payload);
      alert("Bus Service Deployed Successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Deployment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20 pt-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-black uppercase tracking-widest text-[10px] mx-auto md:mx-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Management Protocol
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Deploy <span className="text-red-600">Bus Unit</span></h1>
          <p className="text-slate-500 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">Operational Fleet Expansion v2.0</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 p-6 rounded-[2rem] text-red-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-red-100/50"
              >
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="3" /></svg>
                </div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Basic Identity */}
          <FormSection title="Unit Specifications" icon="🚐">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Registry Name (Bus Name)"
                name="busName"
                value={basicInfo.busName}
                onChange={handleBasicChange}
                placeholder="e.g. Skyline Express"
                required
              />
              <InputField
                label="Serial Code (Bus Number)"
                name="busNumber"
                value={basicInfo.busNumber}
                onChange={handleBasicChange}
                placeholder="e.g. AC-X-999"
                required
              />
              <InputField
                label="Base Tariff (₹ Fare)"
                name="fare"
                value={basicInfo.fare}
                onChange={handleBasicChange}
                type="number"
                placeholder="Enter Fare Amount"
                required
              />
              <InputField
                label="Total Capacity"
                name="totalSeats"
                value={basicInfo.totalSeats}
                onChange={handleBasicChange}
                type="number"
                placeholder="Standard 40"
                required
              />
              <InputField
                label="Initial Availability"
                name="seatsAvailable"
                value={basicInfo.seatsAvailable}
                onChange={handleBasicChange}
                type="number"
                placeholder="Remaining Seats"
                required
              />
              <div className="flex items-center pt-8 px-2">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={basicInfo.isActive}
                      onChange={handleBasicChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 border-2 ${basicInfo.isActive ? 'bg-red-600 border-red-700' : 'bg-slate-100 border-slate-200'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${basicInfo.isActive ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-4 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-red-600 transition-colors">Operational Status</span>
                </label>
              </div>
            </div>
          </FormSection>

          {/* Section 2: Route Configuration */}
          <FormSection title="Flight Path (Route)" icon="📍">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <InputField
                label="Departure Point (Origin)"
                name="origin"
                value={route.origin}
                onChange={handleRouteChange}
                placeholder="City A"
                required
              />
              <InputField
                label="Destination Hub (To)"
                name="destination"
                value={route.destination}
                onChange={handleRouteChange}
                placeholder="City B"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Intermediate Waypoints</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newStop}
                  onChange={(e) => setNewStop(e.target.value)}
                  placeholder="Add a stopover city"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIntermediateStop())}
                  className="flex-grow bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-400 font-bold"
                />
                <button
                  type="button"
                  onClick={addIntermediateStop}
                  className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-red-600 transition-all shadow-lg active:scale-95"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {intermediateStops.map((stop, index) => (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={index}
                    className="bg-white border-2 border-slate-100 text-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm group hover:border-red-200 transition-colors"
                  >
                    <span className="text-[10px] font-black text-red-600">0{index + 1}</span>
                    <span className="text-xs font-bold">{stop}</span>
                    <button
                      type="button"
                      onClick={() => removeIntermediateStop(index)}
                      className="text-slate-300 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Visualization */}
              <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  <StopBadge label={route.origin || "START"} highlight />
                  {intermediateStops.map((s, i) => (
                    <React.Fragment key={i}>
                      <div className="h-[2px] w-4 bg-slate-200 flex-shrink-0"></div>
                      <StopBadge label={s} />
                    </React.Fragment>
                  ))}
                  <div className="h-[2px] w-4 bg-slate-200 flex-shrink-0"></div>
                  <StopBadge label={route.destination || "END"} highlight />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 3: Schedule */}
          <FormSection title="Logistics (Schedule)" icon="⏰">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Launch (Departure)"
                name="startDateTime"
                value={schedule.startDateTime}
                onChange={handleScheduleChange}
                type="datetime-local"
                required
              />
              <InputField
                label="Landing (Arrival)"
                name="endDateTime"
                value={schedule.endDateTime}
                onChange={handleScheduleChange}
                type="datetime-local"
                required
              />
            </div>
          </FormSection>

          {/* Submit */}
          <div className="pt-10">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-[2rem] shadow-2xl shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Initialize Service Deployment</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-red-50 p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-red-900/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-5">
        <span className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-slate-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">{icon}</span>
        {title}
      </h3>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

function InputField({ label, name, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <div className="group relative">
      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2 group-focus-within:text-red-600 transition-colors">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#FCFAF7] border-2 border-slate-50 text-slate-900 rounded-[2rem] py-5 px-8 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-50/50 outline-none transition-all placeholder:text-slate-300 font-bold text-sm shadow-sm"
      />
    </div>
  );
}

function StopBadge({ label, highlight = false }) {
  return (
    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-2 
            ${highlight ? 'bg-red-600 border-red-700 text-white shadow-lg shadow-red-100' : 'bg-white border-slate-100 text-slate-500'}`}>
      {label}
    </div>
  );
}

export default CreateBus;