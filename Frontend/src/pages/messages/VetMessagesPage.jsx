import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import VetLayout from "../../components/vetDashboard/VetLayout";
import { getFriends } from "../../services/friendsApi";
import { getMessages, sendMessage, markAllMessagesRead } from "../../services/messagesApi";
import { FaSearch, FaPaperPlane, FaSmile, FaCalendarAlt } from "react-icons/fa";

const WS_BASE = "ws://localhost:8000";

const VetMessagesPage = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const { t } = useTranslation('messages');
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConversationExpanded, setIsConversationExpanded] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const tokenRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    tokenRef.current = token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user_id);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    loadFriends();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectWebSocket = useCallback((friendshipId) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = tokenRef.current;
    if (!token || !friendshipId) return;

    const ws = new WebSocket(`${WS_BASE}/ws/chat/${friendshipId}/?token=${token}`);

    ws.onopen = () => {
      console.log('[WS] Chat connected for friendship', friendshipId);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      } catch (e) {
        console.error('[WS] Failed to parse message', e);
      }
    };

    ws.onclose = (event) => {
      console.log('[WS] Chat disconnected', event.code);
    };

    ws.onerror = (error) => {
      console.error('[WS] Chat error', error);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (friendId && friends.length > 0) {
      const friendship = friends.find(f => f.id === parseInt(friendId));
      if (friendship) {
        setSelectedFriend(friendship.friend);
        loadMessages(friendId);
        connectWebSocket(friendId);
      }
    }
  }, [friendId, friends, connectWebSocket]);

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

      const markResult = await markAllMessagesRead(friendshipId);
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

    const text = messageText.trim();
    setMessageText("");

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ text, message_type: 'text' }));
    } else {
      const result = await sendMessage(friendId, text, 'text');
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
      } else {
        console.error('Failed to send message:', result.error);
        alert(t('errors.sendFailed'));
        setMessageText(text);
      }
    }
  };

  const handleSendAppointmentCard = async () => {
    if (!friendId) return;

    const appointmentText = t('appointmentCard.title');
    const result = await sendMessage(friendId, appointmentText, 'appointment_card');

    if (result.success) {
      setMessages(prev => [...prev, result.data]);
    } else {
      console.error('Failed to send appointment card:', result.error);
      alert(t('errors.appointmentFailed'));
    }
  };

  const handleFriendClick = (friendship) => {
    setSelectedFriend(friendship.friend);
    setIsConversationExpanded(true);
    navigate(`/vet/messages/${friendship.id}`);
  };

  const getLastMessage = () => {
    if (messages.length === 0) return t('noMessagesYet');
    return messages[messages.length - 1].text;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <VetLayout pageTitle={t('pageTitle')}>
      <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50">
        {/* Friends List - Horizontal Scroll */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {isLoading ? (
              <div className="text-gray-500">{t('loading')}</div>
            ) : friends.length === 0 ? (
              <div className="text-gray-500">{t('noFriends')}</div>
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
          <div className="flex-1 flex flex-col min-h-0">
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
                      <p className="text-xs text-green-600">{t('activeNow')}</p>
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
                    const isMyMessage = Number(message.sender) === Number(currentUserId);

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
                                  <h4 className="font-semibold text-gray-800">{t('appointmentCard.title')}</h4>
                                  <p className="text-xs text-gray-500">{t('appointmentCard.subtitle')}</p>
                                </div>
                              </div>
                              {!isMyMessage && (
                                <button
                                  onClick={() => navigate('/appointments')}
                                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition font-medium"
                                >
                                  {t('appointmentCard.bookNow')}
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

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[70%]">
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={handleSendAppointmentCard}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition border border-emerald-200"
                    >
                      <FaCalendarAlt />
                      <span className="text-sm font-medium">{t('sendAppointment')}</span>
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
                      placeholder={t('typePlaceholder')}
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
              <p className="text-lg">{t('selectFriend')}</p>
            </div>
          </div>
        )}
      </div>
    </VetLayout>
  );
};

export default VetMessagesPage;
