import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Settings,
  ShieldCheck,
  Plus,
  Search,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  AlertTriangle,
  LineChart,
  Building,
  ClipboardList,
  Bell,
  Download,
  Box,
  ShoppingCart,
  Factory,
  Store,
  Truck,
  IndianRupee,
  Cog,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

// Modern StatCard Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  onClick,
}) => {
  const colorMap = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    red: "from-red-600 to-red-700",
    purple: "from-purple-600 to-purple-700",
    orange: "from-orange-600 to-orange-700",
    indigo: "from-indigo-600 to-indigo-700",
    yellow: "from-yellow-600 to-yellow-700",
    pink: "from-pink-600 to-pink-700",
  };

  const bgLight = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    red: "bg-red-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
    indigo: "bg-indigo-50",
    yellow: "bg-yellow-50",
    pink: "bg-pink-50",
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg ${
        bgLight[color] || "bg-blue-50"
      } p-6 border border-${color}-200 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-transparent opacity-40"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]} text-white`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

        {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-10"></div>
    </div>
  );
};

// Modern Tab Component
const TabsContainer = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          onClick={() => onTabChange(idx)}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
            activeTab === idx
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {tab}
          {tab === "Pending Approvals" && (
            <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              0
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Modern Card Component
const Card = ({
  children,
  className = "",
  border = true,
  shadow = true,
  hover = false,
}) => (
  <div
    className={`bg-white rounded-lg ${border ? "border border-gray-200" : ""} ${
      shadow ? "shadow-sm" : ""
    } ${hover ? "hover:shadow-md transition-shadow" : ""} ${className}`}
  >
    {children}
  </div>
);

// Main Component
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [departmentOverview, setDepartmentOverview] = useState(null);
  const [stockOverview, setStockOverview] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState({});
  const [pendingPOs, setPendingPOs] = useState([]);
  const [pendingPOStats, setPendingPOStats] = useState({
    total: 0,
    totalValue: 0,
    urgent: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          statsRes,
          deptRes,
          stockRes,
          activitiesRes,
          usersRes,
          rolesRes,
          notifRes,
          notifStatsRes,
        ] = await Promise.all([
          api.get("/admin/dashboard-stats"),
          api.get("/admin/department-overview").catch(() => ({ data: {} })),
          api.get("/admin/stock-overview"),
          api.get("/admin/recent-activities?limit=10"),
          api.get("/users?page=1&limit=20"),
          api.get("/admin/roles"),
          api.get("/notifications?limit=10&unread_only=true"),
          api.get("/notifications/stats").catch(() => ({ data: {} })),
        ]);

        setDashboardStats(statsRes.data);
        setDepartmentOverview(deptRes.data);
        setStockOverview(stockRes.data);
        setRecentActivities(activitiesRes.data.activities);
        setUsers(usersRes.data.users);
        setRoles(rolesRes.data.roles);
        setNotifications(notifRes.data.notifications);
        setNotificationStats(notifStatsRes.data);

        try {
          const pendingPOResponse = await api.get("/admin/pending-approvals");
          const pos = pendingPOResponse.data.purchaseOrders || [];
          setPendingPOs(pos);

          const totalValue = pos.reduce(
            (sum, po) => sum + (parseFloat(po.final_amount) || 0),
            0
          );
          const urgentCount = pos.filter(
            (po) => po.priority === "high" || po.priority === "urgent"
          ).length;

          setPendingPOStats({
            total: pos.length,
            totalValue,
            urgent: urgentCount,
          });
        } catch (err) {
          console.error("Error fetching pending approvals:", err);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const systemStats = dashboardStats
    ? {
        totalUsers: dashboardStats.users?.total || 0,
        activeUsers: dashboardStats.users?.active || 0,
        totalOrders:
          (dashboardStats.sales?.totalOrders || 0) +
          (dashboardStats.purchases?.totalOrders || 0),
        totalValue:
          (dashboardStats.sales?.totalValue || 0) +
          (dashboardStats.purchases?.totalValue || 0),
      }
    : {};

  const getDeptColor = (dept) => {
    const colors = {
      sales: "blue",
      inventory: "green",
      manufacturing: "orange",
      procurement: "purple",
      outsourcing: "pink",
      shipment: "indigo",
      store: "cyan",
      finance: "red",
      admin: "gray",
      samples: "yellow",
    };
    return colors[dept] || "gray";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  System Overview & Management
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/settings")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Cog className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationStats.unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                )}
              </button>
            </div>

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={systemStats.totalUsers}
            icon={Users}
            color="blue"
            subtitle={`${systemStats.activeUsers} active`}
            trend={5}
          />
          <StatCard
            title="Pending Approvals"
            value={pendingPOStats.total}
            icon={ClipboardList}
            color="red"
            subtitle={`₹${(pendingPOStats.totalValue / 100000).toFixed(1)}L`}
            trend={-2}
          />
          <StatCard
            title="Total Orders"
            value={systemStats.totalOrders}
            icon={ShoppingCart}
            color="green"
            subtitle={`₹${(systemStats.totalValue / 100000).toFixed(1)}L value`}
            trend={8}
          />
          <StatCard
            title="Notifications"
            value={notificationStats.unread || 0}
            icon={Bell}
            color="yellow"
            subtitle={`${notificationStats.total || 0} total`}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content - Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Department Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Department Overview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Key metrics across all departments
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/departments")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(departmentOverview || {}).map(
                  ([dept, stats]) => (
                    <div
                      key={dept}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {dept}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full bg-${getDeptColor(
                            dept
                          )}-500`}
                        ></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Active:</span>
                          <span className="font-bold text-sm text-gray-900">
                            {stats.activeUserCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Total:</span>
                          <span className="font-semibold text-sm text-gray-700">
                            {stats.userCount || 0}
                          </span>
                        </div>
                        {stats.totalValue && (
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-600">
                              Value:
                            </span>
                            <span className="font-bold text-sm text-green-600">
                              ₹{(stats.totalValue / 1000).toFixed(0)}K
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Activities
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Latest system activities
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {activity.type === "sales_order" && (
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      )}
                      {activity.type === "purchase_order" && (
                        <Truck className="w-5 h-5 text-purple-600" />
                      )}
                      {activity.type === "production_order" && (
                        <Factory className="w-5 h-5 text-orange-600" />
                      )}
                      {![
                        "sales_order",
                        "purchase_order",
                        "production_order",
                      ].includes(activity.type) && (
                        <Activity className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {activity.department}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {activity.amount && (
                        <p className="text-xs font-semibold text-green-600 mt-1">
                          ₹{activity.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setTabValue(0)}
                  className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200 font-medium text-sm flex items-center justify-between"
                >
                  Pending Approvals
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTabValue(1)}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 font-medium text-sm flex items-center justify-between"
                >
                  Manage Users
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTabValue(2)}
                  className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200 font-medium text-sm flex items-center justify-between"
                >
                  Manage Roles
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTabValue(4)}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200 font-medium text-sm flex items-center justify-between"
                >
                  Stock Management
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>

            {/* Stock Alerts */}
            {stockOverview && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Stock Alerts
                </h3>

                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 text-sm">
                        Low Stock Items
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        {stockOverview.inventory?.lowStockItems || 0} items
                        below minimum level
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Top Value Items
                  </p>
                  {stockOverview.topValueItems?.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.currentStock} units
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        ₹{item.totalValue?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Notifications */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Notifications
              </h3>

              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Card>
          <div className="border-b border-gray-200">
            <TabsContainer
              tabs={[
                "Pending Approvals",
                "User Management",
                "Role & Permissions",
                "Department Analytics",
                "Stock Management",
                "System Configuration",
                "Audit Logs",
                "Reports",
              ]}
              activeTab={tabValue}
              onTabChange={setTabValue}
            />
          </div>

          <div className="p-6">
            {tabValue === 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Purchase Orders - Pending Approval
                </h3>
                {pendingPOs.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">
                      All caught up! No pending approvals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">{/* PO List Items */}</div>
                )}
              </div>
            )}

            {tabValue === 1 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    User Management
                  </h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add New User
                  </button>
                </div>
                <p className="text-gray-600">
                  User management interface coming soon...
                </p>
              </div>
            )}

            {/* Other tabs follow similar pattern */}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
