import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationsEnabled(data.notificationsEnabled);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = user?.token;
      await axios.put(
        '/api/settings/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.put(
        '/api/settings/toggle-notifications',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotificationsEnabled(data.notificationsEnabled);
      setSuccess(data.message);
    } catch (err) {
      setError('Failed to update notification settings');
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) {
      setError('Please enter your password to deactivate account');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = user?.token;
      await axios.put(
        '/api/settings/deactivate',
        { password: deactivatePassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Account deactivated successfully. You will be logged out.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate account');
      setLoading(false);
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
            <Link to={`/profile/${user?._id}`} style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Profile
            </Link>
            <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="settings-container">
          <h2>⚙️ Settings & Privacy</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="settings-section">
            <h3>📝 Edit Profile</h3>
            <p>Update your profile information, skills, and role-specific details.</p>
            <Link to="/edit-profile" className="btn">
              Go to Edit Profile
            </Link>
          </div>

          <div className="settings-section">
            <h3>🔒 Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  minLength="6"
                />
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="settings-section">
            <h3>🔔 Notifications</h3>
            <div className="notification-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                />
                <span style={{ marginLeft: '10px' }}>
                  Enable notifications
                </span>
              </label>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                {notificationsEnabled
                  ? 'You will receive notifications for follows, likes, comments, and messages.'
                  : 'Notifications are currently disabled.'}
              </p>
            </div>
          </div>

          <div className="settings-section danger-zone">
            <h3>⚠️ Deactivate Account</h3>
            <p>
              Deactivating your account will hide your profile and prevent others from seeing your
              content. You can reactivate your account by logging in again.
            </p>

            {!showDeactivateConfirm ? (
              <button
                className="btn btn-danger"
                onClick={() => setShowDeactivateConfirm(true)}
              >
                Deactivate Account
              </button>
            ) : (
              <div className="deactivate-confirm">
                <div className="form-group">
                  <label>Enter your password to confirm</label>
                  <input
                    type="password"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
                <div className="deactivate-actions">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeactivateAccount}
                    disabled={loading}
                  >
                    {loading ? 'Deactivating...' : 'Confirm Deactivation'}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setShowDeactivateConfirm(false);
                      setDeactivatePassword('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }

        .settings-section {
          background: white;
          padding: 30px;
          margin-bottom: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .settings-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 20px;
        }

        .settings-section p {
          color: #666;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .notification-toggle {
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .danger-zone {
          border: 2px solid #ff4444;
        }

        .danger-zone h3 {
          color: #ff4444;
        }

        .btn {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
        }

        .btn:hover {
          background: #0056b3;
        }

        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-danger {
          background: #ff4444;
        }

        .btn-danger:hover {
          background: #cc0000;
        }

        .deactivate-confirm {
          margin-top: 20px;
        }

        .deactivate-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .success-message {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default Settings;
