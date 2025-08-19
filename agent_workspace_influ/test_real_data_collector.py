#!/usr/bin/env python3
"""
Test script for the real data collector Edge Function
"""

import requests
import json
import sys

def test_real_data_collector(query="음식", realtime=False):
    """Test the real data collector Edge Function"""
    
    url = "https://rdxsrpvngdnhvlfbjszv.supabase.co/functions/v1/real-data-collector"
    
    payload = {
        "query": query,
        "platforms": ["instagram", "youtube", "tiktok"],
        "realtime": realtime,
        "limit": 10,
        "filters": {
            "min_followers": 10000,
            "category": "음식" if query == "음식" else None
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHNycHZuZ2RuaHZsZmJqc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDg2OTUsImV4cCI6MjA2ODI4NDY5NX0.ICVD3OdYMs34QICl9sS4-fdvSctxTLHtrAm1ENUYz9A"
    }
    
    try:
        print(f"🚀 Testing real data collector with query: '{query}' (realtime: {realtime})")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                results = data['data']['results']
                total = data['data']['total_results']
                
                print(f"✅ Success! Found {total} influencers")
                print(f"🔍 Search query: {data['data']['query']}")
                print(f"📱 Platforms: {', '.join(data['data']['platforms'])}")
                print(f"⚡ Realtime: {data['data']['realtime']}")
                print(f"🕒 Search time: {data['data']['search_timestamp']}")
                
                print("\n📋 Results preview:")
                for i, result in enumerate(results[:3]):
                    print(f"\n{i+1}. {result['full_name']} (@{result['username']})")
                    print(f"   Platform: {result['platform']}")
                    print(f"   Followers: {result['followers']:,}")
                    print(f"   Engagement: {result['engagement_rate']}%")
                    print(f"   Category: {result['category']}")
                    print(f"   Cost: {result['collaboration_cost']}")
                    print(f"   Real data: {result.get('is_real_data', False)}")
                    print(f"   Source: {result.get('data_source', 'unknown')}")
                
                # Check for real data
                real_data_count = sum(1 for r in results if r.get('is_real_data', False))
                sample_data_count = total - real_data_count
                
                print(f"\n📈 Data breakdown:")
                print(f"   🔥 Real data: {real_data_count}")
                print(f"   🧪 Sample data: {sample_data_count}")
                
                if real_data_count > 0:
                    print("✅ Real data collection is working!")
                else:
                    print("⚠️  Only sample data returned - real data collection needs setup")
                
                return True
            else:
                print(f"❌ API returned error: {data}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def main():
    query = sys.argv[1] if len(sys.argv) > 1 else "음식"
    realtime = len(sys.argv) > 2 and sys.argv[2].lower() == "true"
    
    print("=" * 60)
    print("🧪 REAL DATA COLLECTOR TEST")
    print("=" * 60)
    
    # Test cached data first
    print("\n1️⃣ Testing cached data mode:")
    test_real_data_collector(query, realtime=False)
    
    print("\n" + "="*60)
    
    # Test realtime data
    print("\n2️⃣ Testing realtime data mode:")
    test_real_data_collector(query, realtime=True)
    
    print("\n" + "="*60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    main()
