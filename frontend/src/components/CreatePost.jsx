import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const token = user?.token;
      let mediaUrl = '';
      let mediaType = 'none';

      if (mediaFile) {
        const formData = new FormData();
        formData.append('media', mediaFile);

        const uploadRes = await axios.post('/api/posts/upload/media', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        mediaUrl = uploadRes.data.mediaUrl;
        mediaType = uploadRes.data.mediaType;
      }

      const { data } = await axios.post(
        '/api/posts',
        {
          content,
          mediaUrl,
          mediaType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onPostCreated(data);
      setContent('');
      setMediaFile(null);
      setUploading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  return (
    <div className="create-post-card">
      <h3>Create a Post</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows="4"
          maxLength="2000"
        />
        
        <div className="post-actions">
          <div className="file-input-wrapper">
            <label htmlFor="media-upload" className="file-label">
              📎 Add Image/Video
            </label>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {mediaFile && <span className="file-name">{mediaFile.name}</span>}
          </div>
          
          <button type="submit" className="btn" disabled={uploading}>
            {uploading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
