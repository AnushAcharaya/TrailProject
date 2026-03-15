"""
Check if Redis is running and accessible
"""

import redis
import os

print("=" * 60)
print("REDIS CONNECTION TEST")
print("=" * 60)

redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
print(f"\nTrying to connect to: {redis_url}")

try:
    # Create Redis client
    r = redis.from_url(redis_url)
    
    # Test connection
    response = r.ping()
    
    if response:
        print("✓ Redis is running and accessible!")
        
        # Get some info
        info = r.info()
        print(f"\nRedis Info:")
        print(f"  Version: {info.get('redis_version', 'unknown')}")
        print(f"  Mode: {info.get('redis_mode', 'unknown')}")
        print(f"  Connected clients: {info.get('connected_clients', 0)}")
        print(f"  Used memory: {info.get('used_memory_human', 'unknown')}")
        
        # Test set/get
        print("\nTesting set/get operations...")
        r.set('test_key', 'test_value')
        value = r.get('test_key')
        if value == b'test_value':
            print("✓ Set/Get operations working")
        r.delete('test_key')
        
        print("\n" + "=" * 60)
        print("✓ REDIS IS READY FOR CELERY")
        print("=" * 60)
        print("\nYou can now start Celery with:")
        print("celery -A backend worker --pool=solo --loglevel=info")
        
    else:
        print("✗ Redis ping failed")
        
except redis.ConnectionError as e:
    print("✗ Cannot connect to Redis")
    print(f"  Error: {str(e)}")
    print("\n" + "=" * 60)
    print("REDIS IS NOT RUNNING")
    print("=" * 60)
    print("\nOn Windows, you need to install and start Redis:")
    print("\nOption 1: Using WSL (Windows Subsystem for Linux)")
    print("  1. Install WSL: wsl --install")
    print("  2. Install Redis in WSL: sudo apt-get install redis-server")
    print("  3. Start Redis: sudo service redis-server start")
    print("\nOption 2: Using Docker")
    print("  docker run -d -p 6379:6379 redis")
    print("\nOption 3: Using Memurai (Redis for Windows)")
    print("  Download from: https://www.memurai.com/")
    print("\nOption 4: Using Redis for Windows (unofficial)")
    print("  Download from: https://github.com/microsoftarchive/redis/releases")
    
except Exception as e:
    print(f"✗ Unexpected error: {str(e)}")
    print(f"  Type: {type(e).__name__}")

print("\n" + "=" * 60)
