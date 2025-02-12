import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./UserDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function UserDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
  });
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchCategorySummary();
    fetchUserProfile();
    calculateMonthlyTrends();
  }, [timePeriod]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://localhost:7050/api/transaction", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const fetchTransactionsByDateRange = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7050/api/Transaction/date-range`, {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          },
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setTransactions([]);
        // toast.info("No transactions found in the specified date range.");
      } else {
        console.error("Error fetching transactions by date range:", error);
        // toast.error("Failed to fetch transactions. Please try again.");
      }
    }
  };

  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
    if (dateRange.startDate && dateRange.endDate) {
      fetchTransactionsByDateRange();
    }
  };

  const fetchCategorySummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7050/api/transaction/category-summary?timePeriod=${timePeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategorySummary(response.data);
    } catch (error) {
      console.error("Error fetching category summary", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://localhost:7050/api/useraccount/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data);
      setUpdatedProfile({ name: response.data.name, email: response.data.email, password: "" });
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  const calculateMonthlyTrends = () => {
    const currentDate = new Date();
    let data = [];
    let length = 0;

    if (timePeriod === "weekly") {
      length = 7;
      data = Array.from({ length }, (_, i) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        return {
          label: date.toLocaleDateString("default", { weekday: "short" }),
          date: date,
        };
      }).reverse();
    } else if (timePeriod === "monthly") {
      length = 30;
      data = Array.from({ length }, (_, i) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        return {
          label: `${date.getDate()}/${date.getMonth() + 1}`,
          date: date,
        };
      }).reverse();
    } else if (timePeriod === "yearly") {
      length = 12;
      data = Array.from({ length }, (_, i) => {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        return {
          label: date.toLocaleString("default", { month: "short" }),
          date: date,
        };
      }).reverse();
    }

    const trends = data.map((item) => {
      const dayStart = new Date(item.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(item.date);
      dayEnd.setHours(23, 59, 59, 999);

      const periodTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date);
        return txDate >= dayStart && txDate <= dayEnd;
      });

      const income = periodTransactions
        .filter((t) => parseFloat(t.amount) > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = Math.abs(
        periodTransactions
          .filter((t) => parseFloat(t.amount) < 0)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      );

      return {
        label: item.label,
        income,
        expenses,
      };
    });

    setMonthlyTrends(trends);
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://localhost:7050/api/transaction", newTransaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
      fetchCategorySummary();
      setNewTransaction({ amount: "", category: "", date: "", description: "" });
    } catch (error) {
      console.error("Error adding transaction", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("https://localhost:7050/api/useraccount/update", updatedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserProfile();
      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete("https://localhost:7050/api/useraccount/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting account", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };
  const [sortOrder, setSortOrder] = useState("asc");
  const sortTransactions = () => {
    const sortedTransactions = [...transactions];
    sortedTransactions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    setTransactions(sortedTransactions);
  };

  const categoryData = {
    labels: categorySummary.map((item) => item.category),
    datasets: [
      {
        label: "Category Summary",
        data: categorySummary.map((item) => Math.abs(item.total)),
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#F44336",
          "#FFC107",
          "#9C27B0",
          "#FF9800",
        ],
      },
    ],
  };

  const trendData = {
    labels: monthlyTrends.map((item) => item.label),
    datasets: [
      {
        label: "Income",
        data: monthlyTrends.map((item) => item.income),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        fill: true,
      },
      {
        label: "Expenses",
        data: monthlyTrends.map((item) => item.expenses),
        borderColor: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.1)",
        fill: true,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Income vs Expenses",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const incomeVsExpensesData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [
          transactions.filter((t) => parseFloat(t.amount) > 0)
            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
          Math.abs(
            transactions.filter((t) => parseFloat(t.amount) < 0)
              .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
          ),
        ],
        backgroundColor: ["#4CAF50", "#F44336"],
        borderColor: ["#45a049", "#e53935"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="container-fluid">
        {/* Header and Stats Row */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h1 className="display-4 mb-0">Financial Dashboard</h1>
            <button onClick={handleLogout} className="btn btn-outline-danger">
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>

        <div className="row stats-row">
          <div className="col-md-4">
            <div className="card stats-card">
              <h3>
                ${transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2)}
              </h3>
              <p>Total Balance</p>
              <span className="stat-trend positive">↑ 12% from last month</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stats-card income">
              <h3>
                ${transactions
                  .filter((t) => parseFloat(t.amount) > 0)
                  .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                  .toFixed(2)}
              </h3>
              <p>Total Income</p>
              <span className="stat-trend positive">↑ 8% from last month</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stats-card expense">
              <h3>
                ${Math.abs(
                  transactions
                    .filter((t) => parseFloat(t.amount) < 0)
                    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                ).toFixed(2)}
              </h3>
              <p>Total Expenses</p>
              <span className="stat-trend negative">↑ 5% from last month</span>
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="dashboard-content">
          {/* Left Sidebar - Profile */}
          <div className="left-sidebar">
            {/* Profile Section */}
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Profile</h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="avatar-circle mb-3">
                    <span className="avatar-initials">
                      {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <h5 className="mb-1">{userProfile.name}</h5>
                  <p className="text-muted mb-0">{userProfile.email}</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name"
                      value={updatedProfile.name}
                      onChange={(e) =>
                        setUpdatedProfile({ ...updatedProfile, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={updatedProfile.email}
                      onChange={(e) =>
                        setUpdatedProfile({ ...updatedProfile, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Leave blank to keep current"
                      value={updatedProfile.password}
                      onChange={(e) =>
                        setUpdatedProfile({ ...updatedProfile, password: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-2">
                    Update Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="btn btn-outline-danger w-100"
                  >
                    Delete Account
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {/* Monthly Trends Chart */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Monthly Income vs Expenses</h5>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${
                        timePeriod === "weekly" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleTimePeriodChange("weekly")}
                    >
                      Weekly
                    </button>
                    <button
                      className={`btn btn-sm ${
                        timePeriod === "monthly" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleTimePeriodChange("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      className={`btn btn-sm ${
                        timePeriod === "yearly" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleTimePeriodChange("yearly")}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="trend-chart-container">
                  <Line data={trendData} options={trendOptions} />
                </div>
              </div>
            </div>

            {/* Spending by Category */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Spending by Category</h5>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${
                        timePeriod === "weekly" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleTimePeriodChange("weekly")}
                    >
                      Weekly
                    </button>
                    <button
                      className={`btn btn-sm ${
                        timePeriod === "monthly" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleTimePeriodChange("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      className={`btn btn-sm ${
                        timePeriod === "yearly" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => handleTimePeriodChange("yearly")}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="pie-chart-container">
                      <Doughnut
                        data={categoryData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="chart-container">
                      <Bar
                        data={categoryData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: "y",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Transactions</h5>
                <form onSubmit={handleDateRangeSubmit} className="d-flex gap-2">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                    required
                  />
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    Filter
                  </button>
                </form>
              </div>
              <div className="card-body">
                <button onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  sortTransactions();
                }}>
                  Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
                </button>
                <div className="table-responsive">
                  <table className="table table-hover table-responsive">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{new Date(transaction.date).toLocaleDateString()}</td>
                          <td>{transaction.description}</td>
                          <td>
                            <span className="badge bg-light text-dark category-badge">
                              {transaction.category}
                            </span>
                          </td>
                          <td
                            className={parseFloat(transaction.amount) >= 0 ? "text-success" : "text-danger"}
                          >
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            {/* Income vs Expenses Comparison */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Income vs Expenses</h5>
              </div>
              <div className="card-body">
                <div className="pie-chart-container">
                  <Doughnut
                    data={incomeVsExpensesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                      cutout: "70%",
                    }}
                  />
                </div>
                <div className="text-center mt-3">
                  <div className="row">
                    <div className="col-6">
                      <p className="mb-1 text-success">Income</p>
                      <h5 className="text-success">
                        ${transactions
                          .filter((t) => parseFloat(t.amount) > 0)
                          .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                          .toFixed(2)}
                      </h5>
                    </div>
                    <div className="col-6">
                      <p className="mb-1 text-danger">Expenses</p>
                      <h5 className="text-danger">
                        ${Math.abs(
                          transactions
                            .filter((t) => parseFloat(t.amount) < 0)
                            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                        ).toFixed(2)}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Transaction Section */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Add Transaction</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddTransaction} className="add-transaction-form">
                  <div className="mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      value={newTransaction.amount}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Category"
                      value={newTransaction.category}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, category: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="date"
                      className="form-control"
                      value={newTransaction.date}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Description"
                      value={newTransaction.description}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    Add Transaction
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;