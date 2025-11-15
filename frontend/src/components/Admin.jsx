import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Admin = () => {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
      fetchUsers();
      fetchPosts();
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

  const handleVerify = async (userId) => {
    try {
      const token = user?.token;
      await axios.put(`/api/admin/users/${userId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
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
              <option value="student">Student</option>
              <option value="freelancer">Freelancer</option>
              <option value="startup">Startup</option>
              <option value="investor">Investor</option>
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
    </div>
  );
};

export default Admin;
