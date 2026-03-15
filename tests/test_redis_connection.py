import redis
import sys

def test_redis_connection():
    """Test Redis connection"""
    try:
        # Try to connect to Redis
        r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        
        # Test connection with ping
        response = r.ping()
        
        if response:
            print("✅ Redis connection successful!")
            print(f"   Host: localhost")
            print(f"   Port: 6379")
            
            # Test set and get
            r.set('test_key', 'Hello Redis!')
            value = r.get('test_key')
            print(f"   Test write/read: {value}")
            
            # Clean up
            r.delete('test_key')
            
            return True
        else:
            print("❌ Redis ping failed")
            return False
            
    except redis.ConnectionError as e:
        print("❌ Redis connection failed!")
        print(f"   Error: {e}")
        print("\n💡 Solutions:")
        print("   1. Make sure Redis is installed")
        print("   2. Start Redis server:")
        print("      - Windows: redis-server.exe")
        print("      - Docker: docker run -d -p 6379:6379 redis")
        print("   3. Check if Redis is running on port 6379")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_redis_connection()
    sys.exit(0 if success else 1)
