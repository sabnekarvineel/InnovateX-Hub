import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ConversationList from './ConversationList';
import ChatBox from './ChatBox';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = user?.token;
      const { data } = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = (conversation) => {
    setConversations([conversation, ...conversations]);
    setSelectedConversation(conversation);
  };

  return (
    <div className="messages-container">
      <div className="messages-layout">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleConversationSelect}
          onNewConversation={handleNewConversation}
          loading={loading}
        />
        
        <ChatBox
          conversation={selectedConversation}
          onConversationUpdate={fetchConversations}
        />
      </div>
    </div>
  );
};

export default Messages;
