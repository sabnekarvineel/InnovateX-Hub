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
    if (user) {
      fetchDashboardData();
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
      default:
        return <Feed />;
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <h1>TechConHub</h1>
          <div className="navbar-actions">
            <Link to="/feed" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Feed
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
            <Link to="/settings" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Settings
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                Admin
              </Link>
            )}
            <NotificationDropdown />
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

export default Dashboard;
