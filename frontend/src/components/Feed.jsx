import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

const Feed = () => {
  const { user, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTrending, setShowTrending] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filter, page, showTrending]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      
      let url = showTrending 
        ? `/api/posts/trending?limit=20`
        : `/api/posts/feed?role=${filter}&page=${page}&limit=10`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (showTrending) {
        setPosts(data);
      } else {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      }
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
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
            <Link to="/search" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Search
            </Link>
            <Link to="/messages" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Messages
            </Link>
            <Link to="/jobs" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Jobs
            </Link>
            {(user?.role === 'startup' || user?.role === 'investor') && (
              <Link to="/funding" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                Funding
              </Link>
            )}
            <Link to={`/profile/${user?._id}`} style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
              Profile
            </Link>
            <NotificationDropdown />
            <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <div className="feed-container">
          <CreatePost onPostCreated={handlePostCreated} />

      <div className="feed-filters">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => { setFilter('all'); setPage(1); setShowTrending(false); }}
          >
            All Posts
          </button>
          <button
            className={filter === 'student' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => { setFilter('student'); setPage(1); setShowTrending(false); }}
          >
            Students
          </button>
          <button
            className={filter === 'freelancer' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => { setFilter('freelancer'); setPage(1); setShowTrending(false); }}
          >
            Freelancers
          </button>
          <button
            className={filter === 'startup' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => { setFilter('startup'); setPage(1); setShowTrending(false); }}
          >
            Startups
          </button>
          <button
            className={filter === 'investor' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => { setFilter('investor'); setPage(1); setShowTrending(false); }}
          >
            Investors
          </button>
          <button
            className={showTrending ? 'filter-btn trending active' : 'filter-btn trending'}
            onClick={() => { setShowTrending(!showTrending); setPage(1); }}
          >
            🔥 Trending
          </button>
        </div>
      </div>

      <div className="posts-list">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">No posts to show</div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={handlePostUpdated}
            />
          ))
        )}
      </div>

      {!showTrending && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
