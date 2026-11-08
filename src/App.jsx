import { useState, useEffect } from "react";
import "./App.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

function App() {
  // Store our job applications

  const [applications, setApplications] = useState(() => {
    const savedApplications = localStorage.getItem("applications");
    return savedApplications ? JSON.parse(savedApplications) : [];
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("userName") || "";
  });
  const [editName, setEditName] = useState(userName);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(
    () => localStorage.getItem("hasCompletedSetup") === "true",
  );
  const [activePage, setActivePage] = useState("dashboard");

  // Control whether the form is visible
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Search applications
  const [searchTerm, setSearchTerm] = useState("");

  // Filter applications by status
  const [statusFilter, setStatusFilter] = useState("All");

  // Sort applications by date
  const [sortOrder, setSortOrder] = useState("newest");

  // Store information entered into the form
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    date: "",
    status: "Pending",
  });
  useEffect(() => {
    localStorage.setItem("applications", JSON.stringify(applications));
  }, [applications]);
  useEffect(() => {
    localStorage.setItem("userName", userName);
  }, [userName]);

  // Update form information
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  // Add a new application

  function handleSubmit(event) {
    event.preventDefault();

    // Prevent empty spaces from being submitted
    if (!formData.company.trim() || !formData.position.trim()) {
      alert("Please enter a valid company name and job position.");
      return;
    }

    const cleanedFormData = {
      ...formData,
      company: formData.company.trim(),
      position: formData.position.trim(),
    };

    if (editingId !== null) {
      // Update an existing application
      setApplications(
        applications.map((app) =>
          app.id === editingId ? { ...app, ...cleanedFormData } : app,
        ),
      );
    } else {
      // Add a new application
      const newApplication = {
        id: Date.now(),
        ...cleanedFormData,
      };

      setApplications([...applications, newApplication]);
    }

    setFormData({
      company: "",
      position: "",
      date: "",
      status: "Pending",
    });

    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(application) {
    setFormData({
      company: application.company,
      position: application.position,
      date: application.date,
      status: application.status,
    });

    setEditingId(application.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?",
    );

    if (confirmed) {
      setApplications(applications.filter((app) => app.id !== id));
    }
  }

  // Calculate dashboard statistics
  const totalApplications = applications.length;

  const filteredApplications = applications
    .filter((app) => {
      const search = searchTerm.toLowerCase();

      return (
        app.company.toLowerCase().includes(search) ||
        app.position.toLowerCase().includes(search)
      );
    })
    .filter((app) => {
      return statusFilter === "All" || app.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date) - new Date(a.date);
      }

      return new Date(a.date) - new Date(b.date);
    });
  const chartData = [
    {
      name: "Pending",
      value: applications.filter((app) => app.status === "Pending").length,
    },
    {
      name: "Interview",
      value: applications.filter((app) => app.status === "Interview").length,
    },
    {
      name: "Offer",
      value: applications.filter((app) => app.status === "Offer").length,
    },
    {
      name: "Rejected",
      value: applications.filter((app) => app.status === "Rejected").length,
    },
  ];
  const monthlyData = applications
    .reduce((acc, app) => {
      const date = new Date(app.date + "T00:00:00");

      const month = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      const existingMonth = acc.find((item) => item.month === month);

      if (existingMonth) {
        existingMonth.applications += 1;
      } else {
        acc.push({
          month,
          applications: 1,
          date: date.getTime(),
        });
      }

      return acc;
    }, [])
    .sort((a, b) => a.date - b.date);
  const interviewRate =
    applications.length === 0
      ? 0
      : Math.round(
          (applications.filter((app) => app.status === "Interview").length /
            applications.length) *
            100,
        );

  const offerRate =
    applications.length === 0
      ? 0
      : Math.round(
          (applications.filter((app) => app.status === "Offer").length /
            applications.length) *
            100,
        );
  const COLORS = ["#7055A5", "#8B72BD", "#A995D4", "#C7B9E5"];

  const interviewCount = applications.filter(
    (app) => app.status === "Interview",
  ).length;

  const offerCount = applications.filter(
    (app) => app.status === "Offer",
  ).length;

  const pendingCount = applications.filter(
    (app) => app.status === "Pending",
  ).length;
  const handleNameSubmit = (e) => {
    e.preventDefault();

    if (userName.trim()) {
      setUserName(userName.trim());
      localStorage.setItem("userName", userName.trim());
      localStorage.setItem("hasCompletedSetup", "true");
      setHasCompletedSetup(true);
    }
  };
  const handleSaveSettings = () => {
    if (editName.trim()) {
      setUserName(editName.trim());
      localStorage.setItem("userName", editName.trim());
      alert("Settings saved successfully!");
    }
  };
  const handleClearApplications = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to delete all your applications?",
    );

    if (confirmClear) {
      setApplications([]);
      localStorage.setItem("applications", JSON.stringify([]));
    }
  };
  if (!hasCompletedSetup) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <h1>Welcome to ApplyFlow 💜</h1>

          <p>
            Let's get your job search organised. First, what should we call you?
          </p>

          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />

            <button type="submit">Get Started</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">
          ApplyFlow<span></span>
        </h2>

        <p className="menu-title">MENU</p>
        <nav className="sidebar-nav">
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              setActivePage("dashboard");
            }}
          >
            🏠 Dashboard
          </a>

          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              setActivePage("applications");
            }}
          >
            📄 Applications
          </a>

          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              setActivePage("settings");
            }}
          >
            ⚙ Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar">
            {userName.trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{userName}</strong>
            <p>My workspace</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <p>
            My Workspace /{" "}
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </p>
          <span className="date">Your career journey starts here.</span>
        </header>

        {activePage !== "dashboard" && (
          <button
            className="back-button"
            onClick={() => setActivePage("dashboard")}
          >
            ← Back to Dashboard
          </button>
        )}
        {activePage === "dashboard" && (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">YOUR CAREER OVERVIEW</p>
                <h1>Welcome, {userName} </h1>
                <p className="welcome-text">
                  Keep track of your applications and stay organised.
                </p>
              </div>
            </section>

            {/* Statistics */}
            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Applications</p>
                <h2>{totalApplications}</h2>
                <span>All your applications</span>
              </div>

              <div className="stat-card">
                <p>Interviews</p>
                <h2>{interviewCount}</h2>
                <span>Opportunities to shine</span>
              </div>

              <div className="stat-card">
                <p>Offers</p>
                <h2>{offerCount}</h2>
                <span>Great progress!</span>
              </div>

              <div className="stat-card">
                <p>Pending</p>
                <h2>{pendingCount}</h2>
                <span>Awaiting a response</span>
              </div>
            </section>
            <section className="analytics-section">
              <div className="section-heading">
                <div>
                  <h2>Application Analytics</h2>
                  <p>Here's a breakdown of your applications.</p>
                </div>
              </div>
              <div className="performance-metrics">
                <div className="metric-card">
                  <p>Interview Rate</p>
                  <h2>{interviewRate}%</h2>
                  <span>Applications that reached interview</span>
                </div>

                <div className="metric-card">
                  <p>Offer Rate</p>
                  <h2>{offerRate}%</h2>
                  <span>Applications that resulted in offers</span>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Applications by Status</h3>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index]} />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="analytics-card monthly-chart-card">
                <h3>Monthly Application Trend</h3>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="applications"
                        fill="#7055A5"
                        radius={[8, 8, 0, 0]}
                      />
                      <LabelList dataKey="applications" position="top" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        )}
        {/* Applications Table */}
        {activePage === "applications" && (
          <>
            {/* Applications Table */}
            <section className="applications-section" id="applications">
              <div className="section-heading">
                <div>
                  <h2>Recent Applications</h2>
                  <p>Keep an eye on your job opportunities.</p>
                </div>

                {applications.length > 0 && (
                  <div className="applications-heading-actions">
                    <span>
                      {totalApplications}{" "}
                      {totalApplications === 1
                        ? "application"
                        : "applications"}{" "}
                    </span>
                    <button
                      className="add-button"
                      onClick={() => setShowForm(true)}
                    >
                      + Add Application
                    </button>
                  </div>
                )}
              </div>

              <div className="table-controls">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search company or position..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="search-input"
                />

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Date sorting */}
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Position</th>
                      <th>Date Applied</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.id}>
                        <td>{application.company}</td>
                        <td>{application.position}</td>
                        <td>
                          {new Date(
                            application.date + "T00:00:00",
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <span
                            className={`status ${application.status.toLowerCase()}`}
                          >
                            {application.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(application)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(application.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredApplications.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          {applications.length === 0 ? (
                            <div className="empty-state">
                              <div className="empty-state-icon">📂</div>
                              <h3>No applications yet</h3>
                              <p>
                                Your job search journey starts here. Add your
                                first application to keep everything organised.
                              </p>
                              <button
                                className="add-button"
                                onClick={() => setShowForm(true)}
                              >
                                + Add Your First Application
                              </button>
                            </div>
                          ) : (
                            "No matching applications found."
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activePage === "settings" && (
          <section className="settings-section" id="settings">
            <div className="section-heading">
              <div>
                <h2>Settings</h2>
                <p>Manage your ApplyFlow account and preferences.</p>
              </div>
            </div>

            <div className="settings-card">
              <h3>Profile Information</h3>
              <p>Update the name displayed on your dashboard.</p>

              <label htmlFor="editName">Your Name</label>

              <input
                id="editName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
              />

              <button onClick={handleSaveSettings}>Save Changes</button>
            </div>

            <div className="settings-card danger-card">
              <h3>Application Data</h3>
              <p>Delete all saved job applications from your dashboard.</p>

              <button
                className="delete-all-button"
                onClick={handleClearApplications}
              >
                Clear All Applications
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Add Application Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-heading">
              <div>
                <h2>
                  {editingId !== null ? "Edit Application" : "Add Application"}
                </h2>
                <p>Enter the details of your job application.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Company Name</label>
              <input
                type="text"
                name="company"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={handleChange}
                required
              />

              <label>Job Position</label>
              <input
                type="text"
                name="position"
                placeholder="e.g. Frontend Developer"
                value={formData.position}
                onChange={handleChange}
                required
              />

              <label>Date Applied</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <label>Application Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-button">
                  {editingId !== null
                    ? "Update Application"
                    : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
