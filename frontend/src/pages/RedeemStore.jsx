import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, CheckCircle, Star } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RedeemStore() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleRedeemClick = (reward) => {
    if (user.current_points < reward.points_required) {
      toast.error("Insufficient Pop Points");
      return;
    }
    setSelectedReward(reward);
    setShowConfirm(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !user) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/rewards/redeem`, {
        user_id: user.id,
        reward_id: selectedReward.id,
      });
      setRedeemResult(response.data);
      setShowConfirm(false);
      setShowSuccess(true);
      // Update user points
      setUser((prev) => ({
        ...prev,
        current_points: response.data.remaining_points,
      }));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          current_points: response.data.remaining_points,
        })
      );
      toast.success("Reward redeemed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Redemption failed");
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
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

      {/* Rewards Grid */}
      <div className="p-4 space-y-4">
        {rewards.map((reward) => {
          const canAfford = user && user.current_points >= reward.points_required;
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
                    {!canAfford && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                          {reward.points_required - (user?.current_points || 0)} more pts needed
                        </p>
                      </div>
                    )}

                    {/* Redeem Button */}
                    <Button
                      data-testid={`redeem-btn-${reward.id}`}
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!canAfford}
                      className={`mt-2 rounded-full text-sm font-semibold px-6 btn-press ${
                        canAfford
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed btn-disabled"
                      }`}
                    >
                      {canAfford ? "Redeem" : "Not Enough Points"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-sm mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl text-amber-800">
              Confirm Redemption?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-amber-700">
              You're about to redeem{" "}
              <span className="font-semibold">{selectedReward?.name}</span> for{" "}
              <span className="font-bold text-amber-800">
                {selectedReward?.points_required} Pop Points
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-testid="cancel-redeem-btn"
              className="rounded-full border-amber-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-redeem-btn"
              onClick={handleConfirmRedeem}
              disabled={isLoading}
              className="rounded-full bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="max-w-sm mx-4 rounded-2xl text-center">
          <div className="success-animation">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <AlertDialogTitle className="font-heading text-2xl text-amber-800 mb-2">
              Reward Unlocked!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-amber-700">
                You've successfully redeemed <strong>{redeemResult?.reward_name}</strong>
              </p>
              <div className="bg-amber-50 p-4 rounded-xl border-2 border-dashed border-amber-300">
                <p className="text-sm text-amber-600 mb-1">Your Reward Code</p>
                <p
                  data-testid="reward-code"
                  className="font-mono text-2xl font-bold text-amber-800 tracking-wider"
                >
                  {redeemResult?.reward_code}
                </p>
              </div>
              <p className="text-sm text-amber-600">
                Show this code at the counter to claim your reward!
              </p>
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction
              data-testid="close-success-btn"
              onClick={() => setShowSuccess(false)}
              className="w-full rounded-full bg-amber-600 hover:bg-amber-700"
            >
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav active="redeem" />
    </div>
  );
}
