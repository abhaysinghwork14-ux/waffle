import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Trophy, Medal, Crown, Star } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
    fetchLeaderboard();
  }, [navigate]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-6 text-center font-bold text-amber-600">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-orange-100 to-amber-50 border-orange-300";
      default:
        return "bg-white border-amber-100";
    }
  };

  if (isLoading) {
    return (
      <div className="app-container min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen pb-safe bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            data-testid="back-btn"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="p-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Hall of Fame
          </h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-amber-100 text-sm">
          Top Pop Point Earners
        </p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="px-6 -mt-2">
          <div className="flex justify-center items-end gap-2">
            {/* 2nd Place */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto bg-gradient-to-b from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="font-heading text-2xl font-bold text-white">2</span>
              </div>
              <p className="font-semibold text-amber-800 text-sm truncate">
                {leaderboard[1]?.name}
              </p>
              <p className="text-amber-600 text-xs font-bold">
                {leaderboard[1]?.lifetime_points} pts
              </p>
            </div>

            {/* 1st Place */}
            <div className="text-center flex-1 -mt-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-b from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-2 shadow-xl ring-4 ring-amber-200">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <p className="font-heading font-bold text-amber-800 truncate">
                {leaderboard[0]?.name}
              </p>
              <p className="text-amber-600 text-sm font-bold">
                {leaderboard[0]?.lifetime_points} pts
              </p>
            </div>

            {/* 3rd Place */}
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto bg-gradient-to-b from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="font-heading text-2xl font-bold text-white">3</span>
              </div>
              <p className="font-semibold text-amber-800 text-sm truncate">
                {leaderboard[2]?.name}
              </p>
              <p className="text-amber-600 text-xs font-bold">
                {leaderboard[2]?.lifetime_points} pts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="px-4 mt-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {leaderboard.length > 0 ? (
              <div className="divide-y divide-amber-100">
                {leaderboard.map((entry) => {
                  const isCurrentUser = currentUser?.id === entry.user_id;
                  return (
                    <div
                      key={entry.user_id}
                      data-testid={`leaderboard-row-${entry.rank}`}
                      className={`flex items-center gap-4 p-4 leaderboard-row ${getRankBg(entry.rank)} ${
                        isCurrentUser ? "ring-2 ring-amber-500 ring-inset" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex justify-center">
                        {getMedalIcon(entry.rank)}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${
                          entry.rank <= 3 ? "text-amber-900" : "text-amber-800"
                        }`}>
                          {entry.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="flex items-center gap-1 text-right">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-heading font-bold text-amber-800">
                          {entry.lifetime_points}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto text-amber-300 mb-3" />
                <p className="text-amber-600">No entries yet</p>
                <p className="text-amber-500 text-sm">Be the first to earn points!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Rank Card */}
      {currentUser && leaderboard.length > 0 && (
        <div className="px-4 mt-4 mb-24">
          {(() => {
            const userRank = leaderboard.find((e) => e.user_id === currentUser.id);
            if (!userRank) return null;
            return (
              <Card className="border-2 border-amber-400 bg-amber-50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm">Your Rank</p>
                    <p className="font-heading text-2xl font-bold text-amber-800">
                      #{userRank.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-600 text-sm">Lifetime Points</p>
                    <p className="font-heading text-2xl font-bold text-amber-800">
                      {userRank.lifetime_points}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}

      <BottomNav active="leaderboard" />
    </div>
  );
}
