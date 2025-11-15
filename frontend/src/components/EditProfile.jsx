import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EditProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    location: '',
    skills: [],
    socialLinks: {
      website: '',
      github: '',
      linkedin: '',
    },
  });

  const [roleData, setRoleData] = useState({});
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`/api/profile/${user._id}`);
      setFormData({
        name: data.name,
        bio: data.bio || '',
        location: data.location || '',
        skills: data.skills || [],
        socialLinks: data.socialLinks || { website: '', github: '', linkedin: '' },
      });
      
      if (data.role === 'student') {
        setRoleData(data.studentProfile || {});
      } else if (data.role === 'freelancer') {
        setRoleData(data.freelancerProfile || {});
      } else if (data.role === 'startup') {
        setRoleData(data.startupProfile || {});
      } else if (data.role === 'investor') {
        setRoleData(data.investorProfile || {});
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSocialChange = (e) => {
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value },
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = user?.token;
      const profileData = {
        ...formData,
      };

      if (user.role === 'student') {
        profileData.studentProfile = roleData;
      } else if (user.role === 'freelancer') {
        profileData.freelancerProfile = roleData;
      } else if (user.role === 'startup') {
        profileData.startupProfile = roleData;
      } else if (user.role === 'investor') {
        profileData.investorProfile = roleData;
      }

      await axios.put('/api/profile/update', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append(type === 'photo' ? 'profilePhoto' : 'coverBanner', file);

    try {
      const token = user?.token;
      const endpoint = type === 'photo' ? '/api/profile/upload/photo' : '/api/profile/upload/banner';
      await axios.post(endpoint, formDataImage, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(`${type === 'photo' ? 'Profile photo' : 'Cover banner'} uploaded successfully!`);
    } catch (error) {
      setError('Failed to upload image');
    }
  };

  return (
    <div className="container">
      <div className="edit-profile-container">
        <h2>Edit Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="image-uploads">
          <div className="form-group">
            <label>Profile Photo</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photo')} />
          </div>
          <div className="form-group">
            <label>Cover Banner</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={onChange}
              rows="4"
              maxLength="500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onChange}
              placeholder="City, Country"
            />
          </div>

          <div className="form-group">
            <label>Skills</label>
            <div className="skills-input">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" onClick={addSkill} className="btn-add">
                Add
              </button>
            </div>
            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <h3>Social Links</h3>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.socialLinks.website}
              onChange={onSocialChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-group">
            <label>GitHub</label>
            <input
              type="url"
              name="github"
              value={formData.socialLinks.github}
              onChange={onSocialChange}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.socialLinks.linkedin}
              onChange={onSocialChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
