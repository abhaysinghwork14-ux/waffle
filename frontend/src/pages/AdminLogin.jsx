import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter the admin password");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API}/admin/login`, { password });
      localStorage.setItem("isAdmin", "true");
      toast.success("Admin access granted");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
      {/* Back button */}
      <Button
        data-testid="back-to-customer-btn"
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-gray-400 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Customer Login
      </Button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Admin Access
          </h1>
          <p className="text-gray-400 mt-2">The Waffle Pop Co</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    data-testid="admin-password-input"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 text-lg border-2 border-gray-600 focus:border-amber-500 bg-gray-700 text-white rounded-xl"
                  />
                </div>
              </div>

              <Button
                data-testid="admin-login-btn"
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full h-12 text-lg font-semibold rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30 btn-press"
              >
                {isLoading ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
