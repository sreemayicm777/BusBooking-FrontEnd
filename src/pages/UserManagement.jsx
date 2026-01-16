import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user: authUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authUser || authUser.role !== "admin") {
            navigate("/");
            return;
        }
        fetchUsers();
    }, [authUser, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        try {
            const res = await axiosInstance.get(`/admin/user-bookings/${user._id}`);
            setUserBookings(res.data);
        } catch (err) {
            console.error("Failed to fetch user bookings", err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FEF9F2] p-4 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            Passenger Records
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">User <span className="text-red-600">Management</span></h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Manage and review all registered passengers and administrators.</p>
                    </div>
                </div>

                {/* Filter/Search */}
                <div className="bg-white border border-red-100 p-8 rounded-3xl shadow-lg">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Find Users</label>
                    <div className="relative group max-w-2xl">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-400 font-bold"
                        />
                    </div>
                </div>

                {/* User Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-48 bg-white border border-red-50 rounded-3xl animate-pulse"></div>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                No records found matching your search.
                            </div>
                        ) : (
                            filteredUsers.map((u) => (
                                <motion.div
                                    key={u._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => handleUserClick(u)}
                                    className="bg-white border border-red-100 p-6 rounded-3xl shadow-md cursor-pointer hover:shadow-xl hover:border-red-200 transition-all group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white ${u.role === 'admin' ? 'bg-red-600' : 'bg-slate-800'}`}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-slate-900 font-black truncate tracking-tight">{u.name}</h3>
                                            <p className="text-xs text-slate-500 truncate mb-2">{u.email}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-4">
                                        <span>Customer Record</span>
                                        <span className="text-red-600">History →</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl bg-white border border-red-100 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 md:p-10 border-b border-red-50 bg-red-50/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
                                            <p className="text-slate-500 font-medium">{selectedUser.email}</p>
                                            <span className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest bg-white text-red-600 border border-red-100 px-3 py-1 rounded-full">{selectedUser.role} Account</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 md:p-10">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                    Booking Performance
                                </h3>

                                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                                    {userBookings.length === 0 ? (
                                        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-slate-100 font-bold text-slate-400 uppercase tracking-widest text-[10px]">No travel history discovered.</div>
                                    ) : (
                                        userBookings.map((b) => (
                                            <div key={b._id} className="bg-white border border-slate-100 p-6 rounded-2xl flex justify-between items-center hover:border-red-200 transition-all shadow-sm">
                                                <div>
                                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString()}</span>
                                                    <p className="text-slate-900 font-bold text-lg">{b.bus?.from} → {b.bus?.to}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{b.bus?.busName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-slate-900 leading-none">₹{b.totalFare}</p>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-2 inline-block ${b.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-500'}`}>
                                                        {b.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UserManagement;
