import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewConversation,
  loading,
}) => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      setSearching(true);
      try {
        const token = user?.token;
        const { data } = await axios.get('/api/search/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: { query },
        });
        setSearchResults(data.users || []);
      } catch (error) {
        console.error(error);
      }
      setSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const token = user?.token;
      const { data } = await axios.get(`/api/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onNewConversation(data);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error(error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find((p) => p._id !== user._id);
  };

  const isOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading) {
    return <div className="conversations-sidebar">Loading...</div>;
  }

  return (
    <div className="conversations-sidebar">
      <div className="conversations-header">
        <h2>Messages</h2>
      </div>

      <div className="conversation-search">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users..."
        />
      </div>

      {searchQuery && (
        <div className="search-results-list">
          {searching ? (
            <div className="searching">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user._id}
                className="search-result-item"
                onClick={() => handleUserClick(user._id)}
              >
                <img
                  src={user.profilePhoto || '/default-avatar.png'}
                  alt={user.name}
                  className="conversation-avatar"
                />
                <div className="conversation-info">
                  <h4>{user.name}</h4>
                  <p className="user-role">{user.role}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">No conversations yet. Search for users to start chatting!</div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            return (
              <div
                key={conversation._id}
                className={`conversation-item ${
                  selectedConversation?._id === conversation._id ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="avatar-container">
                  <img
                    src={otherUser?.profilePhoto || '/default-avatar.png'}
                    alt={otherUser?.name}
                    className="conversation-avatar"
                  />
                  {isOnline(otherUser?._id) && <div className="online-indicator" />}
                </div>
                <div className="conversation-info">
                  <h4>{otherUser?.name}</h4>
                  <p className="last-message">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
