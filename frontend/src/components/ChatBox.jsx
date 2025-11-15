import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';

const ChatBox = ({ conversation, onConversationUpdate }) => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markAsSeen();
    }
  }, [conversation]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        if (message.conversation === conversation?._id) {
          setMessages((prev) => [...prev, message]);
          markAsSeen();
          scrollToBottom();
        }
      });

      socket.on('userTyping', ({ conversationId }) => {
        if (conversationId === conversation?._id) {
          setTyping(true);
        }
      });

      socket.on('userStoppedTyping', ({ conversationId }) => {
        if (conversationId === conversation?._id) {
          setTyping(false);
        }
      });

      socket.on('messageMarkedAsSeen', (messageId) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, seen: true } : msg
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
        socket.off('userTyping');
        socket.off('userStoppedTyping');
        socket.off('messageMarkedAsSeen');
      }
    };
  }, [socket, conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      const { data } = await axios.get(
        `/api/messages/conversation/${conversation._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(data.messages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const markAsSeen = async () => {
    try {
      const token = user?.token;
      await axios.put(
        `/api/messages/conversation/${conversation._id}/seen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !imageFile) return;

    try {
      const token = user?.token;
      let imageUrl = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await axios.post('/api/messages/upload/image', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        imageUrl = uploadRes.data.imageUrl;
      }

      const { data } = await axios.post(
        '/api/messages/send',
        {
          conversationId: conversation._id,
          content: newMessage || 'Image',
          messageType: imageUrl ? 'image' : 'text',
          imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages([...messages, data]);
      setNewMessage('');
      setImageFile(null);

      if (socket) {
        socket.emit('sendMessage', data);
        socket.emit('stopTyping', {
          conversationId: conversation._id,
          receiverId: getOtherParticipant()?._id,
        });
      }

      onConversationUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTyping = () => {
    if (socket && conversation) {
      socket.emit('typing', {
        conversationId: conversation._id,
        receiverId: getOtherParticipant()?._id,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', {
          conversationId: conversation._id,
          receiverId: getOtherParticipant()?._id,
        });
      }, 1000);
    }
  };

  const getOtherParticipant = () => {
    return conversation?.participants?.find((p) => p._id !== user._id);
  };

  const isOnline = () => {
    const otherUser = getOtherParticipant();
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!conversation) {
    return (
      <div className="chat-box empty">
        <div className="empty-state">
          <h3>Select a conversation to start messaging</h3>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="chat-box">
      <div className="chat-header">
        <div className="chat-user-info">
          <img
            src={otherUser?.profilePhoto || '/default-avatar.png'}
            alt={otherUser?.name}
            className="chat-avatar"
          />
          <div>
            <h3>{otherUser?.name}</h3>
            <p className="chat-status">
              {isOnline() ? '🟢 Online' : '⚫ Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.sender._id === user._id ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">
                {message.messageType === 'image' && (
                  <img src={message.imageUrl} alt="Message" className="message-image" />
                )}
                <p>{message.content}</p>
                <div className="message-meta">
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                  {message.sender._id === user._id && (
                    <span className="message-status">
                      {message.seen ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {typing && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        {imageFile && (
          <div className="image-preview">
            <span>{imageFile.name}</span>
            <button type="button" onClick={() => setImageFile(null)}>
              ×
            </button>
          </div>
        )}
        <div className="chat-input-group">
          <label htmlFor="image-upload" className="attach-btn">
            📎
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button type="submit" className="send-btn">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
