// src/router/index.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App"; // This should contain <Outlet /> and a shared layout like Navbar
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CreateBus from "../pages/CreateBus";
import ViewBus from "../pages/ViewBus";
import UpdateBus from "../pages/UpdateBus";
import BookBusPage from "../pages/BookBusPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import BookingHistoryPage from "../pages/BookingHistoryPage";
import AllBookingsPage from "../pages/AllBookingsPage";
import AdminDashboard from "../pages/AdminDashboard";
import UserManagement from "../pages/UserManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Contains <Outlet /> and maybe <Navbar />
    children: [
      { index: true, element: <Login /> },
      { path: "search", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "/create-bus", element: <CreateBus /> },
      { path: "/view-bus/:id", element: <ViewBus /> },
      { path: "update-bus/:id", element: <UpdateBus /> },
      { path: "/book/:id", element: <BookBusPage /> },
      { path: "/my-bookings", element: <MyBookingsPage /> },
      { path: "/booking-history", element: <BookingHistoryPage /> },
      { path: "/admin/dashboard", element: <AdminDashboard /> },
      { path: "/admin/bookings", element: <AllBookingsPage /> },
      { path: "/admin/users", element: <UserManagement /> },
    ],
  },
]);

export default router;
