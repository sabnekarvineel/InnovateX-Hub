import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applications, setApplications] = useState([]);

  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: '',
    portfolio: '',
    proposedRate: '',
  });

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get(`/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load job details');
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const applied = data.some(app => app.job._id === id);
      setHasApplied(applied);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get(`/api/applications/job/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = user?.token;
      await axios.post(
        '/api/applications/apply',
        {
          jobId: id,
          ...applicationData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Application submitted successfully!');
      setHasApplied(true);
      setShowApplicationForm(false);
      setApplicationData({
        coverLetter: '',
        resume: '',
        portfolio: '',
        proposedRate: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      const token = user?.token;
      await axios.put(
        `/api/applications/${applicationId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchApplications();
      setSuccess(`Application status updated to ${status}`);
    } catch (error) {
      setError('Failed to update application status');
    }
  };

  useEffect(() => {
    if (job && job.postedBy._id === user._id) {
      fetchApplications();
    }
  }, [job]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!job) return <div className="error">Job not found</div>;

  const isOwner = job.postedBy._id === user._id;
  const canApply = (user.role === 'student' || user.role === 'freelancer') && !isOwner;

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <h1>InnovateX Hub</h1>
          <div className="navbar-actions">
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                  Admin
                </Link>
                <Link to="/settings" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link to="/feed" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                  Home
                </Link>
                <Link to="/jobs" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                  Jobs
                </Link>
                <Link to={`/profile/${user?._id}`} style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                  Profile
                </Link>
              </>
            )}
            <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="job-detail-container">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="job-detail-header">
            <div className="job-detail-title-section">
              <h1>{job.title}</h1>
              <div className="job-detail-meta">
                <span className="badge">{job.type}</span>
                <span className="badge">{job.category.replace('-', ' ')}</span>
                <span className="badge">{job.locationType}</span>
                <span className="badge">{job.experienceLevel}</span>
                <span className={`status-badge ${job.status}`}>{job.status}</span>
              </div>
            </div>

            <div className="job-poster-card">
              <img
                src={job.postedBy?.profilePhoto || '/default-avatar.png'}
                alt={job.postedBy?.name}
                className="poster-avatar-large"
              />
              <div>
                <Link to={`/profile/${job.postedBy._id}`} className="poster-name-link">
                  {job.postedBy?.startupProfile?.startupName || job.postedBy?.name}
                </Link>
                <p className="poster-role">{job.postedBy?.role}</p>
              </div>
            </div>
          </div>

          <div className="job-detail-content">
            <section className="job-section">
              <h3>Job Description</h3>
              <p>{job.description}</p>
            </section>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="job-section">
                <h3>Responsibilities</h3>
                <ul>
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <section className="job-section">
                <h3>Required Skills</h3>
                <div className="skills-list">
                  {job.skillsRequired.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="job-section">
              <h3>Job Details</h3>
              <div className="job-details-grid">
                {job.budget && (
                  <div className="detail-item">
                    <strong>Budget:</strong>
                    <span>${job.budget.min} - ${job.budget.max}</span>
                  </div>
                )}
                {job.duration && (
                  <div className="detail-item">
                    <strong>Duration:</strong>
                    <span>{job.duration.value} {job.duration.unit}</span>
                  </div>
                )}
                {job.location && (
                  <div className="detail-item">
                    <strong>Location:</strong>
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="detail-item">
                  <strong>Applications:</strong>
                  <span>{job.applications?.length || 0}</span>
                </div>
              </div>
            </section>

            {canApply && (
              <section className="job-section">
                {hasApplied ? (
                  <div className="already-applied">
                    <p>✓ You have already applied for this job</p>
                  </div>
                ) : job.status === 'open' ? (
                  <>
                    {!showApplicationForm ? (
                      <button
                        className="btn btn-primary btn-large"
                        onClick={() => setShowApplicationForm(true)}
                      >
                        Apply for this Job
                      </button>
                    ) : (
                      <div className="application-form">
                        <h3>Submit Your Application</h3>
                        <form onSubmit={handleApply}>
                          <div className="form-group">
                            <label>Cover Letter *</label>
                            <textarea
                              value={applicationData.coverLetter}
                              onChange={(e) =>
                                setApplicationData({
                                  ...applicationData,
                                  coverLetter: e.target.value,
                                })
                              }
                              rows="6"
                              required
                              placeholder="Why are you a great fit for this position?"
                            />
                          </div>

                          <div className="form-group">
                            <label>Resume Link</label>
                            <input
                              type="url"
                              value={applicationData.resume}
                              onChange={(e) =>
                                setApplicationData({
                                  ...applicationData,
                                  resume: e.target.value,
                                })
                              }
                              placeholder="https://your-resume-link.com"
                            />
                          </div>

                          <div className="form-group">
                            <label>Portfolio Link</label>
                            <input
                              type="url"
                              value={applicationData.portfolio}
                              onChange={(e) =>
                                setApplicationData({
                                  ...applicationData,
                                  portfolio: e.target.value,
                                })
                              }
                              placeholder="https://your-portfolio.com"
                            />
                          </div>

                          {job.type === 'freelance' && (
                            <div className="form-group">
                              <label>Proposed Rate ($/hr)</label>
                              <input
                                type="number"
                                value={applicationData.proposedRate}
                                onChange={(e) =>
                                  setApplicationData({
                                    ...applicationData,
                                    proposedRate: e.target.value,
                                  })
                                }
                                placeholder="Your hourly rate"
                              />
                            </div>
                          )}

                          <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                              Submit Application
                            </button>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => setShowApplicationForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="job-closed">
                    <p>This job is no longer accepting applications</p>
                  </div>
                )}
              </section>
            )}

            {isOwner && applications.length > 0 && (
              <section className="job-section">
                <h3>Applications ({applications.length})</h3>
                <div className="applications-list">
                  {applications.map((application) => (
                    <div key={application._id} className="application-card">
                      <div className="application-header">
                        <div className="applicant-info">
                          <img
                            src={application.applicant?.profilePhoto || '/default-avatar.png'}
                            alt={application.applicant?.name}
                            className="applicant-avatar"
                          />
                          <div>
                            <Link
                              to={`/profile/${application.applicant._id}`}
                              className="applicant-name"
                            >
                              {application.applicant?.name}
                            </Link>
                            <p className="applicant-role">{application.applicant?.role}</p>
                          </div>
                        </div>
                        <span className={`status-badge ${application.status}`}>
                          {application.status}
                        </span>
                      </div>

                      <div className="application-content">
                        <p><strong>Cover Letter:</strong></p>
                        <p>{application.coverLetter}</p>
                        {application.resume && (
                          <p>
                            <strong>Resume:</strong>{' '}
                            <a href={application.resume} target="_blank" rel="noopener noreferrer">
                              View Resume
                            </a>
                          </p>
                        )}
                        {application.portfolio && (
                          <p>
                            <strong>Portfolio:</strong>{' '}
                            <a href={application.portfolio} target="_blank" rel="noopener noreferrer">
                              View Portfolio
                            </a>
                          </p>
                        )}
                        {application.proposedRate && (
                          <p><strong>Proposed Rate:</strong> ${application.proposedRate}/hr</p>
                        )}
                      </div>

                      {application.status === 'pending' && (
                        <div className="application-actions">
                          <button
                            className="btn btn-success"
                            onClick={() => handleUpdateStatus(application._id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleUpdateStatus(application._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
