import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import CustomerLogin from "@/pages/CustomerLogin";
import CustomerDashboard from "@/pages/CustomerDashboard";
import RedeemStore from "@/pages/RedeemStore";
import Perfect10Game from "@/pages/Perfect10Game";
import Leaderboard from "@/pages/Leaderboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <>
      <div className="grain-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerLogin />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/redeem" element={<RedeemStore />} />
          <Route path="/game" element={<Perfect10Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
