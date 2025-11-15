import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleLike = async () => {
    try {
      const token = user?.token;
      const endpoint = isLiked ? 'unlike' : 'like';
      
      const { data } = await axios.post(
        `/api/posts/${post._id}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsLiked(!isLiked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    try {
      const token = user?.token;
      const { data } = await axios.post(
        `/api/posts/${post._id}/comment`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments(data);
      setCommentText('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = user?.token;
      await axios.delete(`/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(post._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.put(
        `/api/posts/${post._id}`,
        { content: editContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      const token = user?.token;
      await axios.post(
        `/api/posts/${post._id}/share`,
        { content: `Check this out!` },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Post shared!');
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?._id}`} className="post-author">
          <img
            src={post.author?.profilePhoto || '/default-avatar.png'}
            alt={post.author?.name}
            className="post-author-photo"
          />
          <div>
            <h4>{post.author?.name}</h4>
            <span className="post-role">{post.author?.role}</span>
            <span className="post-date"> · {formatDate(post.createdAt)}</span>
          </div>
        </Link>
        
        {user?._id === post.author?._id && (
          <div className="post-actions-menu">
            <button onClick={() => setIsEditing(!isEditing)} className="action-btn">
              ✏️
            </button>
            <button onClick={handleDelete} className="action-btn">
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="4"
            />
            <button onClick={handleUpdate} className="btn btn-sm">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
          </div>
        ) : (
          <p>{post.content}</p>
        )}

        {post.mediaUrl && post.mediaType === 'image' && (
          <img src={post.mediaUrl} alt="Post media" className="post-media" />
        )}

        {post.mediaUrl && post.mediaType === 'video' && (
          <video src={post.mediaUrl} controls className="post-media" />
        )}

        {post.sharedPost && (
          <div className="shared-post">
            <p>Shared post from {post.sharedPost.author?.name}</p>
            <p>{post.sharedPost.content}</p>
          </div>
        )}
      </div>

      <div className="post-stats">
        <span>{likesCount} likes</span>
        <span>{comments.length} comments</span>
        <span>{post.shares?.length || 0} shares</span>
      </div>

      <div className="post-interactions">
        <button
          onClick={handleLike}
          className={isLiked ? 'interaction-btn active' : 'interaction-btn'}
        >
          {isLiked ? '❤️' : '🤍'} Like
        </button>
        <button onClick={() => setShowComments(!showComments)} className="interaction-btn">
          💬 Comment
        </button>
        <button onClick={handleShare} className="interaction-btn">
          🔄 Share
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength="500"
            />
            <button type="submit" className="btn btn-sm">
              Post
            </button>
          </form>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <img
                  src={comment.user?.profilePhoto || '/default-avatar.png'}
                  alt={comment.user?.name}
                  className="comment-author-photo"
                />
                <div className="comment-content">
                  <strong>{comment.user?.name}</strong>
                  <p>{comment.text}</p>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
