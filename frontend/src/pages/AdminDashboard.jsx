import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LogOut, Users, Gift, PlusCircle, CheckCircle, Clock,
  Star, UserPlus, History, X, TrendingUp, TrendingDown, AlertTriangle,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ExpiryBadge({ points_expiry, points_expired, current_points }) {
  if (!points_expiry || current_points === 0) {
    return <span className="text-gray-300 text-xs">—</span>;
  }
  const expiry = new Date(points_expiry);
  const now = new Date();
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  const dateStr = expiry.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (points_expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        <AlertTriangle className="w-3 h-3" /> Expired
      </span>
    );
  }
  if (daysLeft <= 14) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
        <AlertTriangle className="w-3 h-3" /> {dateStr}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
      <Clock className="w-3 h-3" /> {dateStr}
    </span>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [reason, setReason] = useState("Purchase");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPoints, setNewUserPoints] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // History modal
  const [historyUser, setHistoryUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) { navigate("/admin"); return; }
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
    } catch {
      toast.error("Failed to load data");
    }
  };

  const openHistory = async (user) => {
    setHistoryUser(user);
    setIsHistoryLoading(true);
    try {
      const res = await axios.get(`${API}/admin/transactions`);
      setUserTransactions(res.data.filter((t) => t.user_id === user.id));
    } catch {
      toast.error("Failed to load transaction history");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const closeHistory = () => { setHistoryUser(null); setUserTransactions([]); };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) { toast.error("Please enter a name"); return; }
    const points = parseInt(newUserPoints) || 0;
    if (points < 0) { toast.error("Points cannot be negative"); return; }
    setIsCreatingUser(true);
    try {
      await axios.post(`${API}/admin/create-user`, { name: newUserName.trim(), points });
      toast.success(`User "${newUserName}" created!`);
      setNewUserName(""); setNewUserPoints("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    } finally { setIsCreatingUser(false); }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !pointsToAdd) { toast.error("Please select a user and enter points"); return; }
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) { toast.error("Enter a valid positive number"); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API}/admin/add-points`, { user_id: selectedUserId, points, reason });
      toast.success(`Added ${points} Pop Points!`);
      setPointsToAdd(""); setSelectedUserId("");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add points");
    } finally { setIsLoading(false); }
  };

  const handleMarkClaimed = async (redemptionId) => {
    try {
      await axios.post(`${API}/redemptions/mark-claimed`, { redemption_id: redemptionId });
      toast.success("Marked as claimed!");
      fetchData();
    } catch { toast.error("Failed to mark as claimed"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logged out");
    navigate("/admin");
  };

  const formatDate = (isoString) => new Date(isoString).toLocaleString();

  const expiredCount = users.filter((u) => u.points_expired).length;

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
              <h1 className="font-heading text-lg font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">The Waffle Pop Co</p>
            </div>
          </div>
          <Button data-testid="admin-logout-btn" variant="outline" onClick={handleLogout} className="text-gray-600">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <p className="text-2xl font-bold text-green-800">{redemptions.filter((r) => r.claimed).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-red-500">Expired Points</p>
                <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="add-user" className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="add-user" className="data-[state=active]:bg-amber-100">
              <UserPlus className="w-4 h-4 mr-2" /> Add User
            </TabsTrigger>
            <TabsTrigger value="add-points" className="data-[state=active]:bg-amber-100">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Points
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="data-[state=active]:bg-amber-100">
              <Gift className="w-4 h-4 mr-2" /> Redemptions
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-100">
              <Users className="w-4 h-4 mr-2" /> All Members
            </TabsTrigger>
          </TabsList>

          {/* Add User */}
          <TabsContent value="add-user">
            <Card>
              <CardHeader><CardTitle className="font-heading text-amber-800">Add New User</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Name *</label>
                    <Input data-testid="new-user-name-input" type="text" placeholder="Enter customer name"
                      value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Pop Points (optional)</label>
                    <Input data-testid="new-user-points-input" type="number" placeholder="e.g., 100"
                      value={newUserPoints} onChange={(e) => setNewUserPoints(e.target.value)} min="0" />
                  </div>
                  <Button data-testid="create-user-btn" type="submit" disabled={isCreatingUser || !newUserName.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white">
                    {isCreatingUser ? "Creating..." : "Create User"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Points */}
          <TabsContent value="add-points">
            <Card>
              <CardHeader><CardTitle className="font-heading text-amber-800">Add Pop Points</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddPoints} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger data-testid="select-user-dropdown" className="w-full">
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.current_points} pts)
                            {user.points_expired && " ⚠️ expired"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points to Add</label>
                    <Input data-testid="points-input" type="number" placeholder="e.g., 100"
                      value={pointsToAdd} onChange={(e) => setPointsToAdd(e.target.value)} min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <Input data-testid="reason-input" type="text" placeholder="e.g., Purchase, Bonus"
                      value={reason} onChange={(e) => setReason(e.target.value)} />
                  </div>
                  <p className="text-xs text-gray-400">
                    ℹ️ Adding points resets the expiry to 90 days from today.
                  </p>
                  <Button data-testid="add-points-btn" type="submit"
                    disabled={isLoading || !selectedUserId || !pointsToAdd}
                    className="bg-amber-600 hover:bg-amber-700 text-white">
                    {isLoading ? "Adding..." : "Add Points"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redemptions */}
          <TabsContent value="redemptions">
            <Card>
              <CardHeader><CardTitle className="font-heading text-amber-800">Redemption Tracker</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="admin-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead><TableHead>Reward</TableHead>
                        <TableHead>Code</TableHead><TableHead>Points</TableHead>
                        <TableHead>Date</TableHead><TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redemptions.length > 0 ? redemptions.map((r) => (
                        <TableRow key={r.id} data-testid={`redemption-row-${r.id}`}>
                          <TableCell className="font-medium">{r.user_name}</TableCell>
                          <TableCell>{r.reward_name}</TableCell>
                          <TableCell className="font-mono text-sm">{r.reward_code}</TableCell>
                          <TableCell><span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{r.points_spent}</span></TableCell>
                          <TableCell className="text-sm text-gray-500">{formatDate(r.created_at)}</TableCell>
                          <TableCell>
                            {r.claimed
                              ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" />Claimed</span>
                              : <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"><Clock className="w-3 h-3" />Pending</span>}
                          </TableCell>
                          <TableCell>
                            {!r.claimed && (
                              <Button data-testid={`mark-claimed-btn-${r.id}`} size="sm"
                                onClick={() => handleMarkClaimed(r.id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                Mark Claimed
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No redemptions yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Members */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="font-heading text-amber-800">All Members</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="admin-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Points</TableHead>
                        <TableHead>Lifetime Points</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Points Expiry</TableHead>
                        <TableHead>History</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? users.map((user) => (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1 font-semibold ${user.points_expired ? "text-red-400 line-through" : "text-amber-700"}`}>
                              <Star className={`w-4 h-4 fill-current ${user.points_expired ? "text-red-300" : "text-amber-500"}`} />
                              {user.current_points}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">{user.lifetime_points}</TableCell>
                          <TableCell className="text-sm text-gray-500">{formatDate(user.created_at)}</TableCell>
                          <TableCell>
                            <ExpiryBadge
                              points_expiry={user.points_expiry}
                              points_expired={user.points_expired}
                              current_points={user.current_points}
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => openHistory(user)}
                              className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs">
                              <History className="w-3 h-3 mr-1" /> History
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No members yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* History Modal */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closeHistory}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                  <History className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg leading-tight">{historyUser.name}</h2>
                  <p className="text-xs text-gray-400">Point Transaction History</p>
                </div>
              </div>
              <button onClick={closeHistory} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expiry info inside modal */}
            {historyUser.points_expiry && (
              <div className={`mx-6 mt-4 rounded-xl px-4 py-2 flex items-center gap-2 text-sm ${
                historyUser.points_expired ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"}`}>
                <Clock className="w-4 h-4 flex-shrink-0" />
                {historyUser.points_expired
                  ? "Points have expired — add new points to reset expiry"
                  : `Points expire on ${new Date(historyUser.points_expiry).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}
              </div>
            )}

            <div className="overflow-y-auto flex-1 px-6 py-4">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Clock className="w-5 h-5 mr-2 animate-spin" /> Loading history...
                </div>
              ) : userTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No transactions found for this member.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTransactions.map((t) => {
                    const isEarned = t.transaction_type === "earned";
                    return (
                      <div key={t.id} className={`flex items-center gap-4 p-3 rounded-xl border ${
                        isEarned ? "bg-green-50 border-green-100" : "bg-rose-50 border-rose-100"}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isEarned ? "bg-green-100" : "bg-rose-100"}`}>
                          {isEarned
                            ? <TrendingUp className="w-4 h-4 text-green-600" />
                            : <TrendingDown className="w-4 h-4 text-rose-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{t.reason}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.created_at)}</p>
                        </div>
                        <div className={`font-bold text-base flex-shrink-0 ${isEarned ? "text-green-600" : "text-rose-600"}`}>
                          {isEarned ? "+" : "-"}{t.points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400">{userTransactions.length} transaction{userTransactions.length !== 1 ? "s" : ""} total</p>
              <Button size="sm" variant="outline" onClick={closeHistory} className="text-gray-500">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
