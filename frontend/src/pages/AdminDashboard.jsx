import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LogOut,
  Users,
  Gift,
  PlusCircle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [reason, setReason] = useState("Purchase");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, redemptionsRes] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/redemptions`),
      ]);
      setUsers(usersRes.data);
      setRedemptions(redemptionsRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !pointsToAdd) {
      toast.error("Please select a user and enter points");
      return;
    }
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API}/admin/add-points`, {
        user_id: selectedUserId,
        points,
        reason,
      });
      toast.success(`Added ${points} Pop Points successfully!`);
      setPointsToAdd("");
      setSelectedUserId("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add points");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkClaimed = async (redemptionId) => {
    try {
      await axios.post(`${API}/redemptions/mark-claimed`, {
        redemption_id: redemptionId,
      });
      toast.success("Marked as claimed!");
      fetchData();
    } catch (error) {
      toast.error("Failed to mark as claimed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logged out");
    navigate("/admin");
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500">The Waffle Pop Co</p>
            </div>
          </div>
          <Button
            data-testid="admin-logout-btn"
            variant="outline"
            onClick={handleLogout}
            className="text-gray-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600">Total Members</p>
                <p className="text-2xl font-bold text-amber-800">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Gift className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-rose-600">Total Redemptions</p>
                <p className="text-2xl font-bold text-rose-800">{redemptions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Claimed</p>
                <p className="text-2xl font-bold text-green-800">
                  {redemptions.filter((r) => r.claimed).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="add-points" className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="add-points" className="data-[state=active]:bg-amber-100">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Points
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="data-[state=active]:bg-amber-100">
              <Gift className="w-4 h-4 mr-2" />
              Redemptions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-100">
              <Users className="w-4 h-4 mr-2" />
              All Members
            </TabsTrigger>
          </TabsList>

          {/* Add Points Tab */}
          <TabsContent value="add-points">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-amber-800">
                  Add Pop Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPoints} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Member
                    </label>
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger data-testid="select-user-dropdown" className="w-full">
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.current_points} pts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points to Add
                    </label>
                    <Input
                      data-testid="points-input"
                      type="number"
                      placeholder="e.g., 100"
                      value={pointsToAdd}
                      onChange={(e) => setPointsToAdd(e.target.value)}
                      min="1"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <Input
                      data-testid="reason-input"
                      type="text"
                      placeholder="e.g., Purchase, Bonus"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    data-testid="add-points-btn"
                    type="submit"
                    disabled={isLoading || !selectedUserId || !pointsToAdd}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isLoading ? "Adding..." : "Add Points"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redemptions Tab */}
          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-amber-800">
                  Redemption Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="admin-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redemptions.length > 0 ? (
                        redemptions.map((r) => (
                          <TableRow key={r.id} data-testid={`redemption-row-${r.id}`}>
                            <TableCell className="font-medium">{r.user_name}</TableCell>
                            <TableCell>{r.reward_name}</TableCell>
                            <TableCell className="font-mono text-sm">{r.reward_code}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500" />
                                {r.points_spent}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(r.created_at)}
                            </TableCell>
                            <TableCell>
                              {r.claimed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Claimed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {!r.claimed && (
                                <Button
                                  data-testid={`mark-claimed-btn-${r.id}`}
                                  size="sm"
                                  onClick={() => handleMarkClaimed(r.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                >
                                  Mark Claimed
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No redemptions yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-amber-800">
                  All Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="admin-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Points</TableHead>
                        <TableHead>Lifetime Points</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1 font-semibold text-amber-700">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                {user.current_points}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {user.lifetime_points}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(user.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No members yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
