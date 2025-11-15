import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    experienceLevel: '',
    locationType: '',
    search: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      const { data } = await axios.get('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setJobs(data.jobs);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>Jobs & Opportunities</h2>
        {(user?.role === 'startup' || user?.role === 'freelancer') && (
          <Link to="/jobs/post" className="btn">
            Post {user.role === 'startup' ? 'Job' : 'Service'}
          </Link>
        )}
      </div>

      <div className="jobs-filters">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search jobs..."
          className="search-input"
        />

        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
          <option value="freelance">Freelance</option>
          <option value="project">Project</option>
        </select>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          <option value="web-development">Web Development</option>
          <option value="mobile-development">Mobile Development</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
          <option value="data-science">Data Science</option>
          <option value="ai-ml">AI/ML</option>
          <option value="blockchain">Blockchain</option>
          <option value="devops">DevOps</option>
          <option value="other">Other</option>
        </select>

        <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange}>
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        <select name="locationType" value={filters.locationType} onChange={handleFilterChange}>
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="jobs-list">
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">No jobs found. Try adjusting your filters.</div>
        ) : (
          jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="job-card">
              <div className="job-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span className="job-type">{job.type}</span>
                    <span className="job-category">{job.category.replace('-', ' ')}</span>
                    <span className="job-location">{job.locationType}</span>
                  </div>
                </div>
                <div className="job-poster">
                  <img
                    src={job.postedBy?.profilePhoto || '/default-avatar.png'}
                    alt={job.postedBy?.name}
                    className="poster-avatar"
                  />
                  <div>
                    <p className="poster-name">
                      {job.postedBy?.startupProfile?.startupName || job.postedBy?.name}
                    </p>
                    <p className="poster-role">{job.postedBy?.role}</p>
                  </div>
                </div>
              </div>

              <p className="job-description">{job.description}</p>

              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="job-skills">
                  {job.skillsRequired.slice(0, 5).map((skill, index) => (
                    <span key={index} className="skill-tag-small">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="job-footer">
                {job.budget && (
                  <span className="job-budget">
                    💰 ${job.budget.min} - ${job.budget.max}
                  </span>
                )}
                {job.duration && (
                  <span className="job-duration">
                    ⏱️ {job.duration.value} {job.duration.unit}
                  </span>
                )}
                <span className="job-applications">
                  {job.applications?.length || 0} applications
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
