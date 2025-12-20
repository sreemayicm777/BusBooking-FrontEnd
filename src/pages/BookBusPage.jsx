import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function BookBusPage() {
  const { id } = useParams(); // busId
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [form, setForm] = useState({ from: "", to: "", seatsBooked: 1 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBus = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/buses/${id}`);
        setBus(res.data);
        
        // Set default from and to values if stops exist
        if (res.data.stops && res.data.stops.length > 0) {
          setForm(prev => ({
            ...prev,
            from: res.data.stops[0].name,
            to: res.data.stops[res.data.stops.length - 1].name
          }));
        }
      } catch (err) {
        setError("Failed to load bus details");
        console.error("Error fetching bus:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [id]);

  // Calculate fare based on selected stops - FIXED to prevent NaN
  const calculateFare = () => {
    if (!bus || !bus.stops || !form.from || !form.to) return 0;
    
    const fromStop = bus.stops.find(stop => stop.name === form.from);
    const toStop = bus.stops.find(stop => stop.name === form.to);
    
    if (!fromStop || !toStop) return 0;
    
    // Ensure fare values are valid numbers
    const fromFare = Number(fromStop.fareFromStart) || 0;
    const toFare = Number(toStop.fareFromStart) || 0;
    
    // Calculate absolute difference in fare
    const farePerSeat = Math.abs(toFare - fromFare);
    const totalFare = farePerSeat * (form.seatsBooked || 1);
    
    // Return 0 if calculation results in NaN
    return isNaN(totalFare) ? 0 : totalFare;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      // Validate bus availability
      if (!bus.isActive) {
        setError("This bus is not available for booking.");
        setIsSubmitting(false);
        return;
      }
      
      // Validate seat selection
      if (form.seatsBooked < 1) {
        setError("Please select at least 1 seat.");
        setIsSubmitting(false);
        return;
      }
      
      if (form.seatsBooked > bus.seatsAvailable) {
        setError(`Not enough seats available. Only ${bus.seatsAvailable} seats left.`);
        setIsSubmitting(false);
        return;
      }
      
      // Validate stop selection
      if (!form.from || !form.to) {
        setError("Please select both starting point and destination.");
        setIsSubmitting(false);
        return;
      }
      
      if (form.from === form.to) {
        setError("Starting point and destination cannot be the same.");
        setIsSubmitting(false);
        return;
      }
      
      // Check if from is before to in the route
      const fromIndex = bus.stops.findIndex(stop => stop.name === form.from);
      const toIndex = bus.stops.findIndex(stop => stop.name === form.to);
      
      if (fromIndex === -1 || toIndex === -1) {
        setError("Invalid stop selection.");
        setIsSubmitting(false);
        return;
      }
      
      if (toIndex <= fromIndex) {
        setError("Destination must be after the starting point in the route.");
        setIsSubmitting(false);
        return;
      }
      
      // Calculate fare for validation
      const fromStop = bus.stops.find(stop => stop.name === form.from);
      const toStop = bus.stops.find(stop => stop.name === form.to);
      
      if (!fromStop || !toStop) {
        setError("Invalid stop selection.");
        setIsSubmitting(false);
        return;
      }
      
      const fromFare = Number(fromStop.fareFromStart) || 0;
      const toFare = Number(toStop.fareFromStart) || 0;
      const farePerSeat = Math.abs(toFare - fromFare);
      
      if (isNaN(farePerSeat) || farePerSeat < 0) {
        setError("Invalid fare calculation. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Make booking request
      const response = await axiosInstance.post("/bookings", { 
        busId: id, 
        from: form.from,
        to: form.to,
        seatsBooked: form.seatsBooked
      });
      
      // Success - navigate to my bookings with success message
      navigate("/my-bookings", { 
        state: { 
          message: "Booking successful!",
          bookingId: response.data.booking.bookingId,
          bookingDetails: {
            busName: bus.busName,
            busNumber: bus.busNumber,
            from: form.from,
            to: form.to,
            seats: form.seatsBooked,
            totalFare: response.data.totalFare,
            bookingDate: new Date().toLocaleDateString(),
            departureDate: new Date(bus.startDateTime).toLocaleDateString(),
            departureTime: new Date(bus.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        }
      });
      
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message ||
        "Booking failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Filter "To" options to only show stops after the selected "From" stop
  const getToOptions = () => {
    if (!bus || !bus.stops || !form.from) return bus?.stops || [];
    
    const fromIndex = bus.stops.findIndex(stop => stop.name === form.from);
    if (fromIndex === -1) return bus.stops;
    
    return bus.stops.filter((stop, index) => index > fromIndex);
  };

  // Filter "From" options to only show stops before the selected "To" stop
  const getFromOptions = () => {
    if (!bus || !bus.stops || !form.to) return bus?.stops || [];
    
    const toIndex = bus.stops.findIndex(stop => stop.name === form.to);
    if (toIndex === -1) return bus.stops;
    
    return bus.stops.filter((stop, index) => index < toIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bus Not Found</h2>
          <p className="text-gray-600 mb-6">The bus you're looking for doesn't exist or is no longer available.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Available Buses
          </button>
        </div>
      </div>
    );
  }

  const toOptions = getToOptions();
  const fromOptions = getFromOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6">
            <button
              onClick={() => navigate(-1)}
              className="text-indigo-100 hover:text-white transition-colors mb-4 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h2 className="text-2xl font-bold">Book Your Journey</h2>
            <p className="text-indigo-100 mt-1">Reserve your seats on {bus.busName}</p>
          </div>

          <div className="p-6">
            {/* Bus Summary */}
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-indigo-900">{bus.busName}</h3>
                <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {bus.busNumber}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-indigo-700">
                <div>
                  <div className="font-medium">Departure</div>
                  <div>{new Date(bus.startDateTime).toLocaleDateString()}</div>
                  <div>{new Date(bus.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-1 w-16 bg-indigo-300 rounded-full my-1"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="h-1 w-16 bg-indigo-300 rounded-full my-1"></div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">Arrival</div>
                  <div>{new Date(bus.endDateTime).toLocaleDateString()}</div>
                  <div>{new Date(bus.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-indigo-100">
                <div className="text-sm">
                  <span className="text-indigo-600">Seats Available: </span>
                  <span className="font-semibold">{bus.seatsAvailable}</span>
                </div>
                <div className="text-sm">
                  <span className="text-indigo-600">Status: </span>
                  <span className={`font-semibold ${bus.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {bus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Show route stops */}
              <div className="mt-4 pt-3 border-t border-indigo-100">
                <div className="text-sm font-medium text-indigo-600 mb-1">Route Stops:</div>
                <div className="text-xs text-indigo-700 flex flex-wrap gap-2">
                  {bus.stops.map((stop, index) => (
                    <span key={stop.name} className="bg-indigo-100 px-2 py-1 rounded">
                      {index + 1}. {stop.name} (₹{stop.fareFromStart || 0})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* From and To Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From (Starting Point)
                  </label>
                  <select
                    value={form.from}
                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setForm(prev => ({ ...prev, from: newFrom }));
                      
                      // If "to" is now invalid (before or equal to "from"), reset it
                      if (newFrom && form.to) {
                        const fromIndex = bus.stops.findIndex(s => s.name === newFrom);
                        const toIndex = bus.stops.findIndex(s => s.name === form.to);
                        if (toIndex <= fromIndex) {
                          const nextStop = bus.stops[fromIndex + 1];
                          if (nextStop) {
                            setForm(prev => ({ ...prev, to: nextStop.name }));
                          }
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  >
                    <option value="">Select starting point</option>
                    {fromOptions.map((s, index) => (
                      <option key={s.name} value={s.name}>
                        {bus.stops.findIndex(stop => stop.name === s.name) + 1}. {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To (Destination)
                  </label>
                  <select
                    value={form.to}
                    onChange={(e) => {
                      const newTo = e.target.value;
                      setForm(prev => ({ ...prev, to: newTo }));
                      
                      // If "from" is now invalid (after or equal to "to"), reset it
                      if (newTo && form.from) {
                        const fromIndex = bus.stops.findIndex(s => s.name === form.from);
                        const toIndex = bus.stops.findIndex(s => s.name === newTo);
                        if (toIndex <= fromIndex) {
                          const prevStop = bus.stops[toIndex - 1];
                          if (prevStop) {
                            setForm(prev => ({ ...prev, from: prevStop.name }));
                          }
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                    disabled={!form.from}
                  >
                    <option value="">Select destination</option>
                    {toOptions.map((s, index) => (
                      <option key={s.name} value={s.name}>
                        {bus.stops.findIndex(stop => stop.name === s.name) + 1}. {s.name}
                      </option>
                    ))}
                  </select>
                  {!form.from && (
                    <p className="text-xs text-gray-500 mt-1">Select starting point first</p>
                  )}
                </div>
              </div>

              {/* Seats Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (form.seatsBooked > 1) {
                        setForm({ ...form, seatsBooked: form.seatsBooked - 1 });
                      }
                    }}
                    className="bg-gray-200 text-gray-700 h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={form.seatsBooked <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <input
                    type="number"
                    value={form.seatsBooked}
                    min={1}
                    max={bus.seatsAvailable}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(bus.seatsAvailable, Number(e.target.value) || 1));
                      setForm({ ...form, seatsBooked: value });
                    }}
                    className="h-10 w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (form.seatsBooked < bus.seatsAvailable) {
                        setForm({ ...form, seatsBooked: form.seatsBooked + 1 });
                      }
                    }}
                    className="bg-gray-200 text-gray-700 h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={form.seatsBooked >= bus.seatsAvailable}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  
                  <span className="ml-3 text-sm text-gray-500">
                    Max: {bus.seatsAvailable} seats available
                  </span>
                </div>
              </div>

              {/* Fare Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Fare Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fare per seat</span>
                    <span className="font-semibold">
                      {(() => {
                        if (!bus || !bus.stops || !form.from || !form.to) return "₹0";
                        const fromStop = bus.stops.find(stop => stop.name === form.from);
                        const toStop = bus.stops.find(stop => stop.name === form.to);
                        if (!fromStop || !toStop) return "₹0";
                        const fromFare = Number(fromStop.fareFromStart) || 0;
                        const toFare = Number(toStop.fareFromStart) || 0;
                        const farePerSeat = Math.abs(toFare - fromFare);
                        return isNaN(farePerSeat) ? "₹0" : `₹${farePerSeat}`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Number of seats</span>
                    <span className="font-semibold">{form.seatsBooked}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-800 font-medium">Total Fare</span>
                    <span className="text-2xl font-bold text-indigo-600">₹{calculateFare()}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Includes all applicable taxes and charges
                </p>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !bus.isActive || !form.from || !form.to}
                className={`w-full py-3.5 px-4 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
                  isSubmitting || !bus.isActive || !form.from || !form.to
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Booking...
                  </>
                ) : !bus.isActive ? (
                  "Bus Not Available"
                ) : !form.from || !form.to ? (
                  "Select Stops to Continue"
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </motion.button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                By confirming, you agree to our terms and conditions. Seat availability is not guaranteed until booking is confirmed.
              </p>
            </form>
            
            {/* Important Information */}
            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Information</h4>
                  <ul className="mt-1 text-xs text-yellow-700 space-y-1">
                    <li>• Booking will be confirmed immediately upon submission</li>
                    <li>• Seats are allocated on a first-come, first-served basis</li>
                    <li>• Cancellations are allowed up to 24 hours before departure</li>
                    <li>• Please arrive at the bus stop at least 30 minutes before departure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BookBusPage;