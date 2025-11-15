import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`/api/profile/${id}`);
      setProfile(data);
      if (currentUser) {
        setIsFollowing(data.followers.some((f) => f._id === currentUser._id));
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const token = currentUser?.token;
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await axios.post(
        `/api/profile/${endpoint}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!profile) return <div className="container">Profile not found</div>;

  return (
    <div className="profile-page">
      <div
        className="cover-banner"
        style={{
          backgroundImage: profile.coverBanner
            ? `url(${profile.coverBanner})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />
      
      <div className="container">
        <div className="profile-header">
          <div className="profile-photo-container">
            <img
              src={profile.profilePhoto || '/default-avatar.png'}
              alt={profile.name}
              className="profile-photo-large"
            />
          </div>
          
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <p className="role-badge">{profile.role}</p>
            {profile.location && <p className="location">📍 {profile.location}</p>}
            
            {currentUser && currentUser._id !== profile._id && (
              <button className="btn btn-follow" onClick={handleFollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          
          <div className="follow-stats">
            <div className="stat">
              <strong>{profile.followers?.length || 0}</strong>
              <span>Followers</span>
            </div>
            <div className="stat">
              <strong>{profile.following?.length || 0}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {profile.bio && (
            <div className="profile-section">
              <h3>About</h3>
              <p>{profile.bio}</p>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div className="profile-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.socialLinks && (
            <div className="profile-section">
              <h3>Links</h3>
              <div className="social-links">
                {profile.socialLinks.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                    🌐 Website
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                    💻 GitHub
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    💼 LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          {profile.role === 'student' && profile.studentProfile && (
            <>
              {profile.studentProfile.education && profile.studentProfile.education.length > 0 && (
                <div className="profile-section">
                  <h3>Education</h3>
                  {profile.studentProfile.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <h4>{edu.institution}</h4>
                      <p>
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="date-range">
                        {edu.startYear} - {edu.endYear}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {profile.studentProfile.projects && profile.studentProfile.projects.length > 0 && (
                <div className="profile-section">
                  <h3>Projects</h3>
                  {profile.studentProfile.projects.map((project, index) => (
                    <div key={index} className="project-item">
                      <h4>{project.title}</h4>
                      <p>{project.description}</p>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          View Project
                        </a>
                      )}
                      {project.technologies && (
                        <div className="tech-tags">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {profile.role === 'freelancer' && profile.freelancerProfile && (
            <>
              {profile.freelancerProfile.services && profile.freelancerProfile.services.length > 0 && (
                <div className="profile-section">
                  <h3>Services</h3>
                  <ul>
                    {profile.freelancerProfile.services.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.freelancerProfile.hourlyRate > 0 && (
                <div className="profile-section">
                  <h3>Hourly Rate</h3>
                  <p className="hourly-rate">${profile.freelancerProfile.hourlyRate}/hour</p>
                </div>
              )}

              {profile.freelancerProfile.portfolio && profile.freelancerProfile.portfolio.length > 0 && (
                <div className="profile-section">
                  <h3>Portfolio</h3>
                  {profile.freelancerProfile.portfolio.map((item, index) => (
                    <div key={index} className="portfolio-item">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          View Portfolio
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {profile.role === 'startup' && profile.startupProfile && (
            <>
              {profile.startupProfile.startupName && (
                <div className="profile-section">
                  <h3>Startup</h3>
                  <h2>{profile.startupProfile.startupName}</h2>
                  <p className="startup-stage">Stage: {profile.startupProfile.stage}</p>
                  {profile.startupProfile.mission && <p>{profile.startupProfile.mission}</p>}
                </div>
              )}

              {profile.startupProfile.fundingRequirements && (
                <div className="profile-section">
                  <h3>Funding Requirements</h3>
                  <p className="funding-amount">
                    ${profile.startupProfile.fundingRequirements.amount?.toLocaleString()}{' '}
                    {profile.startupProfile.fundingRequirements.currency}
                  </p>
                </div>
              )}

              {profile.startupProfile.teamMembers && profile.startupProfile.teamMembers.length > 0 && (
                <div className="profile-section">
                  <h3>Team</h3>
                  {profile.startupProfile.teamMembers.map((member, index) => (
                    <div key={index} className="team-member">
                      <p>
                        <strong>{member.name}</strong> - {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {profile.startupProfile.openPositions && profile.startupProfile.openPositions.length > 0 && (
                <div className="profile-section">
                  <h3>Open Positions</h3>
                  {profile.startupProfile.openPositions.map((position, index) => (
                    <div key={index} className="position-item">
                      <h4>{position.title}</h4>
                      <p className="position-type">{position.type}</p>
                      <p>{position.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {profile.role === 'investor' && profile.investorProfile && (
            <>
              {profile.investorProfile.investmentFocus && profile.investorProfile.investmentFocus.length > 0 && (
                <div className="profile-section">
                  <h3>Investment Focus</h3>
                  <div className="focus-list">
                    {profile.investorProfile.investmentFocus.map((focus, index) => (
                      <span key={index} className="focus-tag">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.investorProfile.investmentRange && (
                <div className="profile-section">
                  <h3>Investment Range</h3>
                  <p>
                    ${profile.investorProfile.investmentRange.min?.toLocaleString()} - $
                    {profile.investorProfile.investmentRange.max?.toLocaleString()}{' '}
                    {profile.investorProfile.investmentRange.currency}
                  </p>
                </div>
              )}

              {profile.investorProfile.portfolio && profile.investorProfile.portfolio.length > 0 && (
                <div className="profile-section">
                  <h3>Portfolio</h3>
                  {profile.investorProfile.portfolio.map((item, index) => (
                    <div key={index} className="portfolio-startup">
                      <h4>{item.startupName}</h4>
                      <p>Investment: ${item.investmentAmount?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
