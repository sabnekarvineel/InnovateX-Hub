import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Feed from './Feed';
import NotificationDropdown from './NotificationDropdown';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Admin users don't need dashboard overview data
        // They have their own AdminDashboard component that fetches analytics
        if (user && user.role !== 'admin') {
            fetchDashboardData();
        } else if (user && user.role === 'admin') {
            // Skip fetching for admin, just stop loading
            setLoading(false);
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const token = user?.token;
            const { data } = await axios.get('/api/dashboard/overview', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboardData(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const renderRoleDashboard = () => {
        if (loading) return <div className="loading">Loading dashboard...</div>;
        if (!dashboardData) return null;

        switch (user?.role) {
            case 'student':
                return <StudentDashboard data={dashboardData} />;
            case 'freelancer':
                return <FreelancerDashboard data={dashboardData} />;
            case 'startup':
                return <StartupDashboard data={dashboardData} />;
            case 'investor':
                return <InvestorDashboard data={dashboardData} />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <Feed />;
        }
    };

    return (
        <div>
            <nav className="navbar">
                <div className="container">
                    <h1>InnovateX Hub</h1>
                    <div className="navbar-actions">
                        {user?.role !== 'admin' ? (
                            <>
                                <Link to="/feed" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Home
                                </Link>
                                <Link to="/dashboard" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Dashboard
                                </Link>
                                <Link to="/search" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Search
                                </Link>
                                <Link to="/messages" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Messages
                                </Link>
                                <Link to="/jobs" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Jobs
                                </Link>
                                {(user?.role === 'startup' || user?.role === 'investor') && (
                                    <Link to="/funding" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                        Funding
                                    </Link>
                                )}
                                <Link to={`/profile/${user?._id}`} style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Profile
                                </Link>
                                <Link to="/edit-profile" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                    Edit Profile
                                </Link>
                            </>
                        ) : (
                            <Link to="/admin" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                                Admin
                            </Link>
                        )}
                        <Link to="/settings" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                            Settings
                        </Link>
                        {user?.role !== 'admin' && <NotificationDropdown />}
                        <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
                    </div>
                </div>
            </nav>
            <div className="container">
                {renderRoleDashboard()}
            </div>
        </div>
    );
};

const StudentDashboard = ({ data }) => (
    <div className="role-dashboard">
        <h2>👨‍🎓 Student Dashboard</h2>

        <div className="dashboard-stats">
            <div className="stat-card">
                <h3>{data.stats.totalApplications}</h3>
                <p>Total Applications</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.pendingApplications}</h3>
                <p>Pending</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.acceptedApplications}</h3>
                <p>Accepted</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.followers}</h3>
                <p>Followers</p>
            </div>
        </div>

        <div className="dashboard-section">
            <h3>🎯 Suggested Internships</h3>
            <div className="dashboard-grid">
                {data.suggestedJobs?.slice(0, 3).map((job) => (
                    <Link key={job._id} to={`/jobs/${job._id}`} className="dashboard-card">
                        <h4>{job.title}</h4>
                        <p>{job.postedBy?.startupProfile?.startupName || job.postedBy?.name}</p>
                        <span className="card-tag">{job.type}</span>
                    </Link>
                ))}
            </div>
            <Link to="/jobs" className="view-all-link">View all opportunities →</Link>
        </div>

        <div className="dashboard-section">
            <h3>📝 Recent Applications</h3>
            {data.applications?.length > 0 ? (
                <div className="applications-list">
                    {data.applications.map((app) => (
                        <div key={app._id} className="application-item">
                            <span>{app.job?.title}</span>
                            <span className={`status-badge ${app.status}`}>{app.status}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No applications yet</p>
            )}
        </div>
    </div>
);

const FreelancerDashboard = ({ data }) => (
    <div className="role-dashboard">
        <h2>💼 Freelancer Dashboard</h2>

        <div className="dashboard-stats">
            <div className="stat-card">
                <h3>{data.stats.activeProjects}</h3>
                <p>Active Projects</p>
            </div>
            <div className="stat-card">
                <h3>${data.hourlyRate}/hr</h3>
                <p>Hourly Rate</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.servicesPosted}</h3>
                <p>Services Posted</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.averageRating.toFixed(1)}⭐</h3>
                <p>Average Rating</p>
            </div>
        </div>

        <div className="dashboard-section">
            <h3>🎯 Suggested Projects</h3>
            <div className="dashboard-grid">
                {data.suggestedProjects?.slice(0, 3).map((job) => (
                    <Link key={job._id} to={`/jobs/${job._id}`} className="dashboard-card">
                        <h4>{job.title}</h4>
                        <p>{job.postedBy?.name}</p>
                        <span className="card-tag">{job.budget?.min && `$${job.budget.min}-${job.budget.max}`}</span>
                    </Link>
                ))}
            </div>
            <Link to="/jobs" className="view-all-link">View all projects →</Link>
        </div>

        <div className="dashboard-section">
            <h3>📋 My Services</h3>
            {data.myJobs?.length > 0 ? (
                <div className="jobs-list">
                    {data.myJobs.map((job) => (
                        <div key={job._id} className="job-item">
                            <span>{job.title}</span>
                            <span>{job.applications?.length || 0} applications</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No services posted yet. <Link to="/jobs/post">Post a service</Link></p>
            )}
        </div>
    </div>
);

const StartupDashboard = ({ data }) => (
    <div className="role-dashboard">
        <h2>🚀 Startup Dashboard</h2>

        <div className="dashboard-stats">
            <div className="stat-card">
                <h3>{data.stats.activeJobs}</h3>
                <p>Active Jobs</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.totalApplications}</h3>
                <p>Applications Received</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.fundingRequests}</h3>
                <p>Funding Requests</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.investorInterests}</h3>
                <p>Investor Interests</p>
            </div>
        </div>

        <div className="dashboard-section">
            <h3>💼 Job Postings</h3>
            {data.myJobs?.length > 0 ? (
                <div className="jobs-list">
                    {data.myJobs.map((job) => (
                        <Link key={job._id} to={`/jobs/${job._id}`} className="job-item">
                            <div>
                                <strong>{job.title}</strong>
                                <span className="job-meta">{job.type} • {job.status}</span>
                            </div>
                            <span className="applications-count">{job.applications?.length || 0} applicants</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <p>No jobs posted yet. <Link to="/jobs/post">Post a job</Link></p>
            )}
        </div>

        <div className="dashboard-section">
            <h3>💰 Funding Requests</h3>
            {data.myFundingRequests?.length > 0 ? (
                <div className="funding-list">
                    {data.myFundingRequests.map((request) => (
                        <Link key={request._id} to={`/funding/${request._id}`} className="funding-item">
                            <div>
                                <strong>{request.title}</strong>
                                <span className="funding-meta">${request.fundingAmount.toLocaleString()}</span>
                            </div>
                            <span className="interests-count">{request.interests?.length || 0} interests</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <p>No funding requests yet. <Link to="/funding/post">Request funding</Link></p>
            )}
        </div>
    </div>
);

const InvestorDashboard = ({ data }) => (
    <div className="role-dashboard">
        <h2>💎 Investor Dashboard</h2>

        <div className="dashboard-stats">
            <div className="stat-card">
                <h3>{data.stats.totalInterests}</h3>
                <p>Total Interests</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.activeDeals}</h3>
                <p>Active Deals</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.completedDeals}</h3>
                <p>Completed</p>
            </div>
            <div className="stat-card">
                <h3>{data.stats.portfolioSize}</h3>
                <p>Portfolio Size</p>
            </div>
        </div>

        <div className="dashboard-section">
            <h3>🎯 Recommended Startups</h3>
            <div className="dashboard-grid">
                {data.recommendedStartups?.slice(0, 3).map((request) => (
                    <Link key={request._id} to={`/funding/${request._id}`} className="dashboard-card">
                        <h4>{request.title}</h4>
                        <p>{request.startup?.startupProfile?.startupName}</p>
                        <span className="card-tag">${request.fundingAmount.toLocaleString()}</span>
                    </Link>
                ))}
            </div>
            <Link to="/funding" className="view-all-link">View all opportunities →</Link>
        </div>

        <div className="dashboard-section">
            <h3>📊 My Interests</h3>
            {data.myInterests?.length > 0 ? (
                <div className="interests-list">
                    {data.myInterests.map((interest) => (
                        <div key={interest._id} className="interest-item">
                            <div>
                                <strong>{interest.fundingRequest?.title}</strong>
                                <span className="interest-meta">
                                    {interest.fundingRequest?.startup?.startupProfile?.startupName}
                                </span>
                            </div>
                            <span className={`status-badge ${interest.status}`}>{interest.status}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No interests yet. <Link to="/funding">Explore startups</Link></p>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = user?.token;
                if (!token) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }

                const { data } = await axios.get('/api/admin/analytics', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Admin Analytics Data:', data);
                setAnalytics(data);
                setError('');
                setLoading(false);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError(err.response?.data?.message || 'Failed to load analytics');
                setLoading(false);
            }
        };

        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="role-dashboard">
                <h2>🛡️ Admin Dashboard</h2>
                <div className="loading">Loading admin dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="role-dashboard">
                <h2>🛡️ Admin Dashboard</h2>
                <div className="error-message" style={{ padding: '20px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginTop: '20px' }}>
                    {error}
                </div>
                <p style={{ marginTop: '20px' }}>Please make sure you are logged in as an admin.</p>
                <Link to="/admin" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>
                    Go to Admin Panel
                </Link>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="role-dashboard">
                <h2>🛡️ Admin Dashboard</h2>
                <div style={{ padding: '20px' }}>No analytics data available</div>
                <Link to="/admin" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>
                    Go to Admin Panel
                </Link>
            </div>
        );
    }

    return (
        <div className="role-dashboard">
            <h2>🛡️ Admin Dashboard</h2>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>{analytics?.totalUsers || 0}</h3>
                    <p>Total Users</p>
                </div>
                <div className="stat-card">
                    <h3>{analytics?.totalPosts || 0}</h3>
                    <p>Total Posts</p>
                </div>
                <div className="stat-card">
                    <h3>{analytics?.totalJobs || 0}</h3>
                    <p>Total Jobs</p>
                </div>
                <div className="stat-card">
                    <h3>{analytics?.totalFundingRequests || 0}</h3>
                    <p>Funding Requests</p>
                </div>
                <div className="stat-card">
                    <h3>{analytics?.verifiedUsers || 0}</h3>
                    <p>Verified Users</p>
                </div>
                <div className="stat-card">
                    <h3>{analytics?.bannedUsers || 0}</h3>
                    <p>Banned Users</p>
                </div>
            </div>

            <div className="dashboard-section">
                <h3>📊 Platform Overview</h3>
                <div className="admin-overview">
                    <div className="overview-item">
                        <span className="label">Total Applications:</span>
                        <span className="value">{analytics?.totalApplications || 0}</span>
                    </div>
                    <div className="overview-item">
                        <span className="label">Investor Interests:</span>
                        <span className="value">{analytics?.totalInvestorInterests || 0}</span>
                    </div>
                    <div className="overview-item">
                        <span className="label">Verification Pending:</span>
                        <span className="value">{(analytics?.totalUsers || 0) - (analytics?.verifiedUsers || 0)}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <h3>👥 Users by Role</h3>
                <div className="role-distribution">
                    {analytics?.usersByRole?.map((role) => (
                        <div key={role._id} className="role-stat-card">
                            <div className="role-icon">
                                {role._id === 'student' && '👨‍🎓'}
                                {role._id === 'freelancer' && '💼'}
                                {role._id === 'startup' && '🚀'}
                                {role._id === 'investor' && '💎'}
                                {role._id === 'admin' && '🛡️'}
                            </div>
                            <div className="role-info">
                                <h4>{role.count}</h4>
                                <p>{role._id}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-section">
                <h3>🆕 Recent Users</h3>
                {analytics?.recentUsers?.length > 0 ? (
                    <div className="recent-users-list">
                        {analytics.recentUsers.slice(0, 5).map((user) => (
                            <div key={user._id} className="recent-user-item">
                                <div>
                                    <strong>{user.name}</strong>
                                    <span className="user-email">{user.email}</span>
                                </div>
                                <div>
                                    <span className="user-role">{user.role}</span>
                                    <span className="user-date">{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No recent users</p>
                )}
            </div>

            <div className="dashboard-section">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions">
                    <Link to="/admin" className="action-card">
                        <span className="action-icon">🛡️</span>
                        <span className="action-title">Admin Panel</span>
                        <span className="action-desc">Manage platform</span>
                    </Link>
                    <Link to="/settings" className="action-card">
                        <span className="action-icon">⚙️</span>
                        <span className="action-title">Settings</span>
                        <span className="action-desc">Account settings</span>
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .admin-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .overview-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .overview-item .label {
          font-size: 14px;
          color: #666;
        }

        .overview-item .value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .role-distribution {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .role-stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .role-icon {
          font-size: 36px;
        }

        .role-info h4 {
          margin: 0;
          font-size: 28px;
          color: #333;
        }

        .role-info p {
          margin: 5px 0 0 0;
          color: #666;
          text-transform: capitalize;
        }

        .recent-users-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 15px;
        }

        .recent-user-item {
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recent-user-item strong {
          display: block;
          margin-bottom: 5px;
        }

        .user-email {
          color: #666;
          font-size: 14px;
        }

        .user-role {
          background: #e3f2fd;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          margin-right: 10px;
          text-transform: capitalize;
        }

        .user-date {
          color: #999;
          font-size: 13px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }

        .action-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          font-size: 48px;
        }

        .action-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .action-desc {
          font-size: 13px;
          color: #666;
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
