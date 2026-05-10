import { useEffect, useRef, useState, useCallback } from 'react';

export const useNotificationWebSocket = (onNotification) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (!token) {
      console.log('[WebSocket] No token found, skipping connection');
      return;
    }

    // WebSocket URL
    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected to notification system');
        setIsConnected(true);
        
        // Clear any reconnect timeout
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        ws.current.pingInterval = pingInterval;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification' && onNotification) {
            onNotification(data.notification);
          } else if (data.type === 'connection_established') {
            console.log('[WebSocket]', data.message);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      ws.current.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Clear ping interval
        if (ws.current?.pingInterval) {
          clearInterval(ws.current.pingInterval);
        }

        // Attempt to reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
    }
  }, [onNotification]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        if (ws.current.pingInterval) {
          clearInterval(ws.current.pingInterval);
        }
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage };
};
