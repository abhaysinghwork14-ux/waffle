import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Star, Lock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RedeemStore() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }
    const userData = JSON.parse(storedUser);
    fetchUserData(userData.id);
    fetchRewards();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      navigate("/");
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API}/rewards`);
      setRewards(response.data);
    } catch (error) {
      toast.error("Failed to load rewards");
    }
  };

  const tierColors = {
    1: "from-amber-100 to-amber-50",
    2: "from-orange-100 to-orange-50",
    3: "from-rose-100 to-rose-50",
    4: "from-pink-100 to-pink-50",
    5: "from-purple-100 to-amber-50",
  };

  return (
    <div className="app-container min-h-screen pb-safe bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-100">
        <div className="p-4 flex items-center justify-between">
          <Button
            data-testid="back-btn"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5 text-amber-700" />
          </Button>
          <h1 className="font-heading text-xl font-bold text-amber-800">
            Redeem Store
          </h1>
          <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span data-testid="points-balance" className="font-bold text-amber-800">
              {user?.current_points || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="px-4 pt-4">
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Redemption Coming Soon!</p>
              <p className="text-sm text-amber-600">Collect points now, redeem later</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Grid - Display Only */}
      <div className="p-4 space-y-4">
        {rewards.map((reward) => {
          const progress = user
            ? Math.min((user.current_points / reward.points_required) * 100, 100)
            : 0;

          return (
            <Card
              key={reward.id}
              data-testid={`reward-card-${reward.id}`}
              className={`border-0 shadow-lg overflow-hidden reward-card bg-gradient-to-br ${tierColors[reward.tier]}`}
            >
              <CardContent className="p-0">
                <div className="flex gap-4">
                  {/* Food Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-3 pr-4">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-amber-600 bg-white/50 px-2 py-0.5 rounded-full">
                        Tier {reward.tier}
                      </span>
                      <span className="font-heading font-bold text-amber-800">
                        {reward.points_required} pts
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-amber-900 text-lg leading-tight">
                      {reward.name}
                    </h3>
                    <p className="text-amber-700 text-sm mt-1 line-clamp-2">
                      {reward.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        {user?.current_points >= reward.points_required 
                          ? "✓ You have enough points!" 
                          : `${reward.points_required - (user?.current_points || 0)} more pts needed`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BottomNav active="redeem" />
    </div>
  );
}
