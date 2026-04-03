import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VetLayout from "../../components/vetDashboard/VetLayout";
import { getFriends } from "../../services/friendsApi";
import { getMessages, sendMessage, markAllMessagesRead } from "../../services/messagesApi";
import { FaSearch, FaPaperPlane, FaSmile, FaCalendarAlt } from "react-icons/fa";

const VetMessagesPage = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConversationExpanded, setIsConversationExpanded] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadFriends();
    // Get current user ID from token
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user_id);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (friendId && friends.length > 0) {
      const friend = friends.find(f => f.id === parseInt(friendId));
      if (friend) {
        setSelectedFriend(friend.friend);
        loadMessages(friendId);
      }
    }
  }, [friendId, friends]);

  const loadFriends = async () => {
    setIsLoading(true);
    const result = await getFriends();
    
    if (result.success) {
      const friendsList = Array.isArray(result.data) 
        ? result.data 
        : result.data.results || [];
      setFriends(friendsList);
      
      if (friendsList.length > 0 && !friendId) {
        setSelectedFriend(friendsList[0].friend);
        navigate(`/vet/messages/${friendsList[0].id}`);
      }
    }
    
    setIsLoading(false);
  };

  const loadMessages = async (friendshipId) => {
    const result = await getMessages(friendshipId);
    
    if (result.success) {
      const messagesList = Array.isArray(result.data) 
        ? result.data 
        : result.data.results || [];
      setMessages(messagesList);
      
      // Mark all messages in this conversation as read
      const markResult = await markAllMessagesRead(friendshipId);
      
      // If messages were marked as read, dispatch event to update unread count
      if (markResult.success && markResult.data.marked_read > 0) {
        window.dispatchEvent(new Event('messagesRead'));
      }
    } else {
      console.error('Failed to load messages:', result.error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !friendId) return;
    
    const result = await sendMessage(friendId, messageText, 'text');
    
    if (result.success) {
      // Add the new message to the list
      setMessages(prev => [...prev, result.data]);
      setMessageText("");
    } else {
      console.error('Failed to send message:', result.error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleSendAppointmentCard = async () => {
    if (!friendId) return;
    
    const appointmentText = "Book an Appointment";
    const result = await sendMessage(friendId, appointmentText, 'appointment_card');
    
    if (result.success) {
      // Add the new appointment card message to the list
      setMessages(prev => [...prev, result.data]);
    } else {
      console.error('Failed to send appointment card:', result.error);
      alert('Failed to send appointment card. Please try again.');
    }
  };

  const handleFriendClick = (friendship) => {
    setSelectedFriend(friendship.friend);
    setIsConversationExpanded(true);
    navigate(`/vet/messages/${friendship.id}`);
  };

  const getLastMessage = () => {
    if (messages.length === 0) return "No messages yet";
    const lastMsg = messages[messages.length - 1];
    return lastMsg.text;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <VetLayout pageTitle="Messages">
      <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50">
        {/* Friends List - Horizontal Scroll */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {isLoading ? (
              <div className="text-gray-500">Loading friends...</div>
            ) : friends.length === 0 ? (
              <div className="text-gray-500">No friends to message</div>
            ) : (
              friends.map((friendship) => {
                const friend = friendship.friend;
                const profileImageUrl = friend.profile_image_url || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name || friend.username)}&background=059669&color=fff&size=128`;
                const isSelected = selectedFriend?.username === friend.username;
                
                return (
                  <div
                    key={friendship.id}
                    onClick={() => handleFriendClick(friendship)}
                    className={`flex flex-col items-center cursor-pointer min-w-[80px] p-2 rounded-lg transition ${
                      isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`relative ${isSelected ? 'ring-2 ring-emerald-600 rounded-full' : ''}`}>
                      <img 
                        src={profileImageUrl}
                        alt={friend.full_name || friend.username}
                        className="w-14 h-14 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name || friend.username)}&background=059669&color=fff&size=128`;
                        }}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-xs mt-1 text-gray-700 font-medium truncate w-full text-center">
                      {friend.full_name?.split(' ')[0] || friend.username}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Area */}
        {selectedFriend ? (
          <div className="flex-1 flex flex-col">
            {isConversationExpanded ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedFriend.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFriend.full_name || selectedFriend.username)}&background=059669&color=fff&size=128`}
                      alt={selectedFriend.full_name || selectedFriend.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedFriend.full_name || selectedFriend.username}</h3>
                      <p className="text-xs text-green-600">Active now</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsConversationExpanded(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {messages.map((message) => {
                    // Ensure both values are numbers for comparison
                    const isMyMessage = Number(message.sender) === Number(currentUserId);
                    console.log('Message:', message.id, 'Sender:', message.sender, 'CurrentUser:', currentUserId, 'IsMyMessage:', isMyMessage);
                    
                    // Render appointment card
                    if (message.message_type === 'appointment_card') {
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-[70%]">
                            <div className="bg-white border-2 border-emerald-500 rounded-lg p-4 shadow-md">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-emerald-100 p-2 rounded-full">
                                  <FaCalendarAlt className="text-emerald-600 text-xl" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">Book an Appointment</h4>
                                  <p className="text-xs text-gray-500">Schedule a visit with the vet</p>
                                </div>
                              </div>
                              {!isMyMessage && (
                                <button
                                  onClick={() => navigate('/appointments')}
                                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition font-medium"
                                >
                                  Book Now
                                </button>
                              )}
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    // Render regular text message
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%]`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isMyMessage
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                          >
                            <p>{message.text}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={handleSendAppointmentCard}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition border border-emerald-200"
                    >
                      <FaCalendarAlt />
                      <span className="text-sm font-medium">Send Appointment</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-emerald-600 transition">
                      <FaSmile className="text-2xl" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Minimized Conversation Preview */
              <div 
                onClick={() => setIsConversationExpanded(true)}
                className="bg-white border border-gray-200 rounded-lg shadow-lg m-4 p-4 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedFriend.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFriend.full_name || selectedFriend.username)}&background=059669&color=fff&size=128`}
                    alt={selectedFriend.full_name || selectedFriend.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{selectedFriend.full_name || selectedFriend.username}</h4>
                    <p className="text-sm text-gray-600 truncate">{getLastMessage()}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaSearch className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a friend to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </VetLayout>
  );
};

export default VetMessagesPage;
