import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomerLogin() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/users/login`, { name: name.trim() });
      localStorage.setItem("user", JSON.stringify(response.data));
      toast.success(`Welcome back, ${response.data.name}!`);
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 404) {
        setIsNewUser(true);
        toast.info("Name not found. Would you like to register?");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/users/register`, { name: name.trim() });
      localStorage.setItem("user", JSON.stringify(response.data));
      toast.success(`Welcome to The Waffle Pop Co, ${response.data.name}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container min-h-screen flex flex-col items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg animate-float">
            <span className="text-white text-4xl font-heading font-bold">W</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-amber-800">
            The Waffle Pop Co
          </h1>
          <p className="text-amber-700 mt-2 font-medium">Earn Pop Points. Get Rewards!</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Enter Your Registered Name
                </label>
                <Input
                  data-testid="customer-name-input"
                  type="text"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsNewUser(false);
                  }}
                  className="h-12 text-lg border-2 border-amber-200 focus:border-amber-500 bg-white rounded-xl"
                />
              </div>

              {!isNewUser ? (
                <Button
                  data-testid="login-btn"
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="w-full h-12 text-lg font-semibold rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30 btn-press"
                >
                  {isLoading ? "Checking..." : "Enter"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-amber-700 text-sm">
                    Name not found. Register as a new member?
                  </p>
                  <Button
                    data-testid="register-btn"
                    type="button"
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full h-12 text-lg font-semibold rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 btn-press"
                  >
                    {isLoading ? "Registering..." : "Register Now"}
                  </Button>
                  <Button
                    data-testid="try-again-btn"
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewUser(false)}
                    className="w-full h-10 rounded-full border-2 border-amber-300"
                  >
                    Try Different Name
                  </Button>
                </div>
              )}
            </form>

            <div className="mt-6 pt-4 border-t border-amber-100">
              <Button
                data-testid="admin-link"
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="w-full text-amber-600 hover:text-amber-800 hover:bg-amber-50"
              >
                Admin Login →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer tagline */}
        <p className="text-center text-amber-600/70 mt-6 text-sm">
          Waffles & Pancakes • Made with Love
        </p>
      </div>
    </div>
  );
}
