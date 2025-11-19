import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Admin = () => {
  const { user, logout } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    verified: '',
    banned: '',
    search: '',
  });
  const [investors, setInvestors] = useState([]);
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
      fetchUsers();
      fetchPosts();
      fetchInvestors();
      fetchStartups();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/admin/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(data.posts);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInvestors = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'investor' },
      });
      setInvestors(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStartups = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'startup' },
      });
      setStartups(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async (userId) => {
    try {
      const token = user?.token;
      await axios.put(`/api/admin/users/${userId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      fetchInvestors();
      fetchStartups();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBan = async (userId) => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      const token = user?.token;
      await axios.put(`/api/admin/users/${userId}/ban`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      fetchInvestors();
      fetchStartups();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnban = async (userId) => {
    try {
      const token = user?.token;
      await axios.put(`/api/admin/users/${userId}/unban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      fetchInvestors();
      fetchStartups();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete all user data permanently.')) return;

    try {
      const token = user?.token;
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = user?.token;
      await axios.delete(`/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="container">Access Denied. Admin only.</div>;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <h1>InnovateX Hub</h1>
          <div className="navbar-actions">
            <Link to="/admin" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Admin
            </Link>
            <Link to="/settings" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Settings
            </Link>
            <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="admin-container">
        <h1>🛡️ Admin Panel</h1>

        <div className="admin-tabs">
          <button
            className={activeTab === 'analytics' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button
            className={activeTab === 'users' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={activeTab === 'investors' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveTab('investors')}
          >
            💼 Verify Investors
          </button>
          <button
            className={activeTab === 'startups' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveTab('startups')}
          >
            🚀 Verify Startups
          </button>
          <button
            className={activeTab === 'posts' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveTab('posts')}
          >
            📰 Posts
          </button>
        </div>

        {activeTab === 'analytics' && analytics && (
          <div className="admin-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>{analytics.totalUsers}</h3>
                <p>Total Users</p>
              </div>
              <div className="analytics-card">
                <h3>{analytics.totalPosts}</h3>
                <p>Total Posts</p>
              </div>
              <div className="analytics-card">
                <h3>{analytics.totalJobs}</h3>
                <p>Total Jobs</p>
              </div>
              <div className="analytics-card">
                <h3>{analytics.totalFundingRequests}</h3>
                <p>Funding Requests</p>
              </div>
              <div className="analytics-card">
                <h3>{analytics.verifiedUsers}</h3>
                <p>Verified Users</p>
              </div>
              <div className="analytics-card">
                <h3>{analytics.bannedUsers}</h3>
                <p>Banned Users</p>
              </div>
            </div>

            <div className="admin-section">
              <h3>Users by Role</h3>
              <div className="role-distribution">
                {analytics.usersByRole?.map((role) => (
                  <div key={role._id} className="role-stat">
                    <span className="role-name">{role._id}</span>
                    <span className="role-count">{role.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <h3>Recent Users</h3>
              <div className="recent-users-list">
                {analytics.recentUsers?.map((user) => (
                  <div key={user._id} className="recent-user-item">
                    <span>{user.name}</span>
                    <span className="user-email">{user.email}</span>
                    <span className="user-role">{user.role}</span>
                    <span className="user-date">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="admin-filters">
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="student">👨‍🎓 Student</option>
                <option value="freelancer">💼 Freelancer</option>
                <option value="startup">🚀 Startup</option>
                <option value="investor">💎 Investor</option>
                <option value="admin">🛡️ Admin</option>
              </select>
              <select
                value={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <select
                value={filters.banned}
                onChange={(e) => setFilters({ ...filters, banned: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="false">Active</option>
                <option value="true">Banned</option>
              </select>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <img src={user.profilePhoto || '/default-avatar.png'} alt={user.name} />
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="role-badge">{user.role}</span>
                      </td>
                      <td>
                        {user.isVerified && <span className="badge verified">✓ Verified</span>}
                        {user.isBanned && <span className="badge banned">🚫 Banned</span>}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!user.isVerified && (
                            <button onClick={() => handleVerify(user._id)} className="btn-action verify">
                              Verify
                            </button>
                          )}
                          {!user.isBanned ? (
                            <button onClick={() => handleBan(user._id)} className="btn-action ban">
                              Ban
                            </button>
                          ) : (
                            <button onClick={() => handleUnban(user._id)} className="btn-action unban">
                              Unban
                            </button>
                          )}
                          <button onClick={() => handleDeleteUser(user._id)} className="btn-action delete">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="admin-content">
            <h3>Investor Verification ({investors.filter(i => !i.isVerified).length} pending)</h3>
            <div className="verification-list">
              {investors.map((investor) => (
                <div key={investor._id} className="verification-card">
                  <div className="verification-header">
                    <img src={investor.profilePhoto || '/default-avatar.png'} alt={investor.name} />
                    <div className="verification-info">
                      <h4>{investor.name}</h4>
                      <p>{investor.email}</p>
                      {investor.isVerified && <span className="badge verified">✓ Verified</span>}
                      {investor.isBanned && <span className="badge banned">🚫 Banned</span>}
                    </div>
                  </div>
                  <div className="verification-details">
                    <p><strong>Investment Focus:</strong> {investor.investorProfile?.investmentFocus?.join(', ') || 'Not specified'}</p>
                    <p><strong>Investment Range:</strong> ${investor.investorProfile?.investmentRange?.min?.toLocaleString()} - ${investor.investorProfile?.investmentRange?.max?.toLocaleString()}</p>
                    <p><strong>Portfolio:</strong> {investor.investorProfile?.portfolio?.length || 0} investments</p>
                    <p><strong>Bio:</strong> {investor.bio || 'No bio provided'}</p>
                  </div>
                  <div className="verification-actions">
                    {!investor.isVerified && (
                      <button onClick={() => handleVerify(investor._id)} className="btn-action verify">
                        ✓ Verify Investor
                      </button>
                    )}
                    {investor.isVerified && (
                      <button onClick={() => handleVerify(investor._id)} className="btn-action">
                        Already Verified
                      </button>
                    )}
                    {!investor.isBanned ? (
                      <button onClick={() => handleBan(investor._id)} className="btn-action ban">
                        Ban
                      </button>
                    ) : (
                      <button onClick={() => handleUnban(investor._id)} className="btn-action unban">
                        Unban
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'startups' && (
          <div className="admin-content">
            <h3>Startup Verification ({startups.filter(s => !s.isVerified).length} pending)</h3>
            <div className="verification-list">
              {startups.map((startup) => (
                <div key={startup._id} className="verification-card">
                  <div className="verification-header">
                    <img src={startup.profilePhoto || '/default-avatar.png'} alt={startup.name} />
                    <div className="verification-info">
                      <h4>{startup.startupProfile?.startupName || startup.name}</h4>
                      <p>{startup.email}</p>
                      {startup.isVerified && <span className="badge verified">✓ Verified</span>}
                      {startup.isBanned && <span className="badge banned">🚫 Banned</span>}
                    </div>
                  </div>
                  <div className="verification-details">
                    <p><strong>Startup Name:</strong> {startup.startupProfile?.startupName || 'Not specified'}</p>
                    <p><strong>Stage:</strong> {startup.startupProfile?.stage || 'Not specified'}</p>
                    <p><strong>Mission:</strong> {startup.startupProfile?.mission || 'Not specified'}</p>
                    <p><strong>Team Size:</strong> {startup.startupProfile?.teamMembers?.length || 0} members</p>
                    <p><strong>Open Positions:</strong> {startup.startupProfile?.openPositions?.length || 0}</p>
                    <p><strong>Bio:</strong> {startup.bio || 'No bio provided'}</p>
                  </div>
                  <div className="verification-actions">
                    {!startup.isVerified && (
                      <button onClick={() => handleVerify(startup._id)} className="btn-action verify">
                        ✓ Verify Startup
                      </button>
                    )}
                    {startup.isVerified && (
                      <button onClick={() => handleVerify(startup._id)} className="btn-action">
                        Already Verified
                      </button>
                    )}
                    {!startup.isBanned ? (
                      <button onClick={() => handleBan(startup._id)} className="btn-action ban">
                        Ban
                      </button>
                    ) : (
                      <button onClick={() => handleUnban(startup._id)} className="btn-action unban">
                        Unban
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="admin-content">
            <h3>Post Moderation</h3>
            <div className="posts-moderation-list">
              {posts.map((post) => (
                <div key={post._id} className="moderation-post-card">
                  <div className="post-author-info">
                    <img src={post.author?.profilePhoto || '/default-avatar.png'} alt={post.author?.name} />
                    <div>
                      <strong>{post.author?.name}</strong>
                      <span className="post-role">{post.author?.role}</span>
                    </div>
                  </div>
                  <p>{post.content}</p>
                  {post.mediaUrl && (
                    <img src={post.mediaUrl} alt="Post media" className="moderation-media" />
                  )}
                  <div className="moderation-actions">
                    <span>{post.likes?.length || 0} likes · {post.comments?.length || 0} comments</span>
                    <button onClick={() => handleDeletePost(post._id)} className="btn-action delete">
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          .admin-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .admin-container h1 {
            margin-bottom: 30px;
            color: #333;
          }

          .admin-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
          }

          .admin-tab {
            padding: 12px 24px;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            color: #666;
            transition: all 0.3s;
          }

          .admin-tab:hover {
            color: #4CAF50;
          }

          .admin-tab.active {
            color: #4CAF50;
            border-bottom-color: #4CAF50;
          }

          .admin-content {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .analytics-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
          }

          .analytics-card h3 {
            font-size: 36px;
            margin: 0 0 10px 0;
          }

          .analytics-card p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }

          .admin-section {
            margin-bottom: 30px;
          }

          .admin-section h3 {
            margin: 0 0 20px 0;
            color: #333;
          }

          .role-distribution {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }

          .role-stat {
            background: #f5f5f5;
            padding: 15px 25px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 150px;
          }

          .role-name {
            text-transform: capitalize;
            font-weight: 500;
          }

          .role-count {
            background: #4CAF50;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: bold;
          }

          .recent-users-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .recent-user-item {
            display: grid;
            grid-template-columns: 2fr 2fr 1fr 1fr;
            gap: 15px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
            align-items: center;
          }

          .user-email {
            color: #666;
            font-size: 14px;
          }

          .user-role {
            text-transform: capitalize;
            color: #4CAF50;
            font-weight: 500;
          }

          .user-date {
            color: #999;
            font-size: 13px;
          }

          .admin-filters {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }

          .admin-filters input,
          .admin-filters select {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          .users-table {
            overflow-x: auto;
          }

          .users-table table {
            width: 100%;
            border-collapse: collapse;
          }

          .users-table th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #ddd;
          }

          .users-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }

          .user-cell {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .user-cell img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }

          .badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 5px;
          }

          .badge.verified {
            background: #d4edda;
            color: #155724;
          }

          .badge.banned {
            background: #f8d7da;
            color: #721c24;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
          }

          .btn-action {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s;
          }

          .btn-action.verify {
            background: #28a745;
            color: white;
          }

          .btn-action.ban {
            background: #ffc107;
            color: #333;
          }

          .btn-action.unban {
            background: #17a2b8;
            color: white;
          }

          .btn-action.delete {
            background: #dc3545;
            color: white;
          }

          .btn-action:hover {
            opacity: 0.8;
          }

          .posts-moderation-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .moderation-post-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #4CAF50;
          }

          .post-author-info {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
          }

          .post-author-info img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }

          .post-role {
            display: block;
            font-size: 12px;
            color: #999;
            text-transform: capitalize;
          }

          .moderation-media {
            max-width: 300px;
            border-radius: 8px;
            margin: 10px 0;
          }

          .moderation-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
          }

          .verification-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 20px;
          }

          .verification-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .verification-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }

          .verification-header img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
          }

          .verification-info h4 {
            margin: 0 0 5px 0;
            font-size: 18px;
          }

          .verification-info p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }

          .verification-details {
            margin-bottom: 15px;
          }

          .verification-details p {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.6;
          }

          .verification-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .btn-action.verify {
            background: #28a745;
            color: white;
          }

          .btn-action.verify:hover {
            background: #218838;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Admin;
