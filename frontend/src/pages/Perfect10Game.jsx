import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Flame, Trophy, RotateCcw } from "lucide-react";

export default function Perfect10Game() {
  const [gameState, setGameState] = useState("idle"); // idle, running, stopped
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [result, setResult] = useState(null);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }
    // Load best time from localStorage
    const stored = localStorage.getItem("perfect10_best");
    if (stored) setBestTime(parseFloat(stored));
  }, [navigate]);

  const updateTimer = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setTime(elapsed);
      if (elapsed < 15) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      } else {
        // Auto stop at 15 seconds
        handleStop();
      }
    }
  }, []);

  const handleStart = () => {
    setGameState("running");
    setTime(0);
    setResult(null);
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setGameState("stopped");

    const finalTime = startTimeRef.current
      ? (performance.now() - startTimeRef.current) / 1000
      : time;
    setTime(finalTime);

    // Calculate result
    const diff = Math.abs(finalTime - 10);
    let resultData = { time: finalTime, diff };

    if (diff <= 0.01) {
      resultData.rating = "PERFECT BAKE!";
      resultData.emoji = "🎉";
      resultData.color = "text-green-600";
      resultData.bgColor = "bg-green-100";
    } else if (diff <= 0.1) {
      resultData.rating = "Almost Perfect!";
      resultData.emoji = "🔥";
      resultData.color = "text-amber-600";
      resultData.bgColor = "bg-amber-100";
    } else if (diff <= 0.5) {
      resultData.rating = "Great Timing!";
      resultData.emoji = "👍";
      resultData.color = "text-orange-600";
      resultData.bgColor = "bg-orange-100";
    } else if (diff <= 1) {
      resultData.rating = "Good Try!";
      resultData.emoji = "😊";
      resultData.color = "text-blue-600";
      resultData.bgColor = "bg-blue-100";
    } else {
      resultData.rating = finalTime < 10 ? "Too Early!" : "Overbaked!";
      resultData.emoji = finalTime < 10 ? "⏰" : "🔥";
      resultData.color = "text-rose-600";
      resultData.bgColor = "bg-rose-100";
    }

    setResult(resultData);

    // Update best time
    if (!bestTime || diff < Math.abs(bestTime - 10)) {
      setBestTime(finalTime);
      localStorage.setItem("perfect10_best", finalTime.toString());
    }
  };

  const handleReset = () => {
    setGameState("idle");
    setTime(0);
    setResult(null);
    startTimeRef.current = null;
  };

  const formatTime = (t) => {
    return t.toFixed(2);
  };

  const getOvenGlow = () => {
    if (gameState !== "running") return "";
    if (time >= 9.5 && time <= 10.5) return "animate-pulse-glow";
    return "";
  };

  return (
    <div className="app-container min-h-screen pb-safe bg-gradient-to-b from-amber-900 to-orange-900">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button
          data-testid="back-btn"
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="p-2 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-heading text-xl font-bold text-white">
          Perfect 10 Challenge
        </h1>
        <div className="w-10" />
      </div>

      {/* Game Area */}
      <div className="px-6 py-4">
        {/* Instructions */}
        <Card className="border-0 bg-white/10 backdrop-blur-sm mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-amber-100 text-sm">
              <Flame className="w-4 h-4 inline mr-1" />
              Stop the oven at exactly <span className="font-bold text-white">10.00 seconds</span> for the perfect bake!
            </p>
          </CardContent>
        </Card>

        {/* Oven Display */}
        <div className={`relative mx-auto w-64 h-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl ${getOvenGlow()} oven-glow`}>
          {/* Oven window */}
          <div className="absolute inset-4 bg-gradient-to-b from-amber-600/20 to-orange-600/40 rounded-2xl border-4 border-gray-700 flex items-center justify-center">
            {/* Timer Display */}
            <div className="text-center">
              <p
                data-testid="timer-display"
                className={`timer-display ${
                  gameState === "running"
                    ? time >= 9.5 && time <= 10.5
                      ? "text-green-400"
                      : "text-amber-400"
                    : result
                    ? result.color.replace("text-", "text-")
                    : "text-gray-400"
                }`}
              >
                {formatTime(time)}
              </p>
              <p className="text-gray-400 text-sm mt-2">seconds</p>
            </div>
          </div>

          {/* Oven handle */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-gray-600 rounded-full" />
        </div>

        {/* Control Button */}
        <div className="flex justify-center mt-8">
          {gameState === "idle" && (
            <Button
              data-testid="start-btn"
              onClick={handleStart}
              className="game-btn bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white shadow-lg shadow-green-500/50"
            >
              START
            </Button>
          )}

          {gameState === "running" && (
            <Button
              data-testid="stop-btn"
              onClick={handleStop}
              className="game-btn bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white shadow-lg shadow-rose-500/50 animate-pulse"
            >
              STOP!
            </Button>
          )}

          {gameState === "stopped" && (
            <Button
              data-testid="retry-btn"
              onClick={handleReset}
              className="game-btn bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white shadow-lg shadow-amber-500/50"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              RETRY
            </Button>
          )}
        </div>

        {/* Result Card */}
        {result && (
          <Card
            data-testid="result-card"
            className={`border-0 mt-8 ${result.bgColor} success-animation`}
          >
            <CardContent className="p-6 text-center">
              <p className="text-4xl mb-2">{result.emoji}</p>
              <h3 className={`font-heading text-2xl font-bold ${result.color}`}>
                {result.rating}
              </h3>
              <p className="text-gray-600 mt-2">
                You stopped at <span className="font-bold">{formatTime(result.time)}s</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {result.diff <= 0.01
                  ? "Absolutely perfect!"
                  : `Off by ${result.diff.toFixed(2)} seconds`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Best Time */}
        {bestTime && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-100 text-sm">
                Personal Best: <span className="font-bold text-white">{formatTime(bestTime)}s</span>
              </span>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-center text-amber-200/60 text-xs mt-8 px-6">
          This game is just for fun! Points are earned through purchases at the store.
        </p>
      </div>

      <BottomNav active="game" />
    </div>
  );
}
