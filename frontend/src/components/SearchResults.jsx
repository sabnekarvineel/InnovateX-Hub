import { Link } from 'react-router-dom';

const SearchResults = ({ results, searchType, loading }) => {
  if (loading) {
    return <div className="search-loading">Searching...</div>;
  }

  if (!results || results.length === 0) {
    return <div className="no-results">No results found. Try adjusting your filters.</div>;
  }

  const renderUserCard = (user) => (
    <Link to={`/profile/${user._id}`} key={user._id} className="result-card user-card">
      <img
        src={user.profilePhoto || '/default-avatar.png'}
        alt={user.name}
        className="result-photo"
      />
      <div className="result-info">
        <h3>{user.name}</h3>
        <p className="result-role">{user.role}</p>
        {user.bio && <p className="result-bio">{user.bio}</p>}
        {user.location && <p className="result-location">📍 {user.location}</p>}
        {user.skills && user.skills.length > 0 && (
          <div className="result-skills">
            {user.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-tag-small">
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && <span>+{user.skills.length - 3} more</span>}
          </div>
        )}
      </div>
    </Link>
  );

  const renderStartupCard = (startup) => (
    <Link to={`/profile/${startup._id}`} key={startup._id} className="result-card startup-card">
      <img
        src={startup.profilePhoto || '/default-avatar.png'}
        alt={startup.name}
        className="result-photo"
      />
      <div className="result-info">
        <h3>{startup.startupProfile?.startupName || startup.name}</h3>
        <p className="startup-stage">
          {startup.startupProfile?.stage && `Stage: ${startup.startupProfile.stage}`}
        </p>
        {startup.startupProfile?.mission && (
          <p className="result-bio">{startup.startupProfile.mission}</p>
        )}
        {startup.location && <p className="result-location">📍 {startup.location}</p>}
        {startup.startupProfile?.fundingRequirements?.amount && (
          <p className="funding-info">
            💰 Seeking: ${startup.startupProfile.fundingRequirements.amount.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );

  const renderFreelancerCard = (freelancer) => (
    <Link to={`/profile/${freelancer._id}`} key={freelancer._id} className="result-card freelancer-card">
      <img
        src={freelancer.profilePhoto || '/default-avatar.png'}
        alt={freelancer.name}
        className="result-photo"
      />
      <div className="result-info">
        <h3>{freelancer.name}</h3>
        {freelancer.bio && <p className="result-bio">{freelancer.bio}</p>}
        {freelancer.location && <p className="result-location">📍 {freelancer.location}</p>}
        {freelancer.freelancerProfile?.hourlyRate > 0 && (
          <p className="rate-info">💵 ${freelancer.freelancerProfile.hourlyRate}/hour</p>
        )}
        {freelancer.freelancerProfile?.services && freelancer.freelancerProfile.services.length > 0 && (
          <div className="result-skills">
            {freelancer.freelancerProfile.services.slice(0, 3).map((service, index) => (
              <span key={index} className="skill-tag-small">
                {service}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );

  const renderProjectCard = (project) => (
    <div key={project._id} className="result-card project-card">
      <div className="result-info">
        <h3>{project.title}</h3>
        {project.student && (
          <Link to={`/profile/${project.student._id}`} className="project-student">
            by {project.student.name}
          </Link>
        )}
        <p className="result-bio">{project.description}</p>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
            🔗 View Project
          </a>
        )}
        {project.technologies && project.technologies.length > 0 && (
          <div className="result-skills">
            {project.technologies.map((tech, index) => (
              <span key={index} className="skill-tag-small">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="search-results">
      <h3>
        {results.length} {searchType} found
      </h3>
      <div className="results-grid">
        {searchType === 'users' && results.map(renderUserCard)}
        {searchType === 'startups' && results.map(renderStartupCard)}
        {searchType === 'freelancers' && results.map(renderFreelancerCard)}
        {searchType === 'projects' && results.map(renderProjectCard)}
        {searchType === 'skills' && results.map(renderUserCard)}
      </div>
    </div>
  );
};

export default SearchResults;
