import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { Gift, Trophy, Gamepad2, History } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }
    const userData = JSON.parse(storedUser);
    
    const loadUserData = async (userId) => {
      try {
        const response = await axios.get(`${API}/users/${userId}`);
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        toast.error("Failed to load user data");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadRedemptions = async (userId) => {
      try {
        const response = await axios.get(`${API}/redemptions/user/${userId}`);
        setRedemptions(response.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load redemptions");
      }
    };
    
    loadUserData(userData.id);
    loadRedemptions(userData.id);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("See you soon!");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="app-container min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen pb-safe">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm font-medium">Welcome back,</p>
              <h1 data-testid="user-name" className="font-heading text-2xl font-bold text-white">
                {user?.name}
              </h1>
            </div>
            <Button
              data-testid="logout-btn"
              variant="ghost"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10 text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Points Card */}
      <div className="px-6 -mt-12 relative z-20">
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-amber-600 font-medium mb-1">Your Pop Points</p>
              <h2 data-testid="current-points" className="font-heading text-5xl font-bold text-amber-800">
                {user?.current_points || 0}
              </h2>
              <p className="text-amber-500 text-sm mt-2">
                Lifetime: {user?.lifetime_points || 0} points
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button
                data-testid="go-redeem-btn"
                onClick={() => navigate("/redeem")}
                className="flex flex-col items-center py-4 h-auto bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl"
              >
                <Gift className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Redeem</span>
              </Button>
              <Button
                data-testid="go-game-btn"
                onClick={() => navigate("/game")}
                className="flex flex-col items-center py-4 h-auto bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl"
              >
                <Gamepad2 className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Game</span>
              </Button>
              <Button
                data-testid="go-leaderboard-btn"
                onClick={() => navigate("/leaderboard")}
                className="flex flex-col items-center py-4 h-auto bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl"
              >
                <Trophy className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Ranks</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Redemptions */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-amber-800 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Rewards
          </h3>
        </div>

        {redemptions.length > 0 ? (
          <div className="space-y-3">
            {redemptions.map((r) => (
              <Card key={r.id} className="border border-amber-100 bg-white/80">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-amber-800">{r.reward_name}</p>
                    <p className="text-sm text-amber-600">Code: {r.reward_code}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    r.claimed 
                      ? "bg-green-100 text-green-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.claimed ? "Claimed" : "Pending"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-amber-100 bg-white/50">
            <CardContent className="p-8 text-center">
              <Gift className="w-12 h-12 mx-auto text-amber-300 mb-3" />
              <p className="text-amber-600">No rewards redeemed yet</p>
              <Button
                onClick={() => navigate("/redeem")}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full"
              >
                Browse Rewards
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Promo Banner */}
      <div className="px-6 mt-6 mb-24">
        <Card className="border-0 bg-gradient-to-r from-rose-500 to-orange-500 text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
            <h3 className="font-heading text-xl font-bold mb-1">Perfect 5 Game</h3>
            <p className="text-white/90 text-sm mb-3">Stop the oven at exactly 5 seconds!</p>
            <Button
              data-testid="play-game-btn"
              onClick={() => navigate("/game")}
              className="bg-white text-rose-600 hover:bg-white/90 rounded-full font-semibold"
            >
              Play Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
