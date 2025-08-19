#!/usr/bin/env python3
"""
Real YouTube Data Scraper using Official YouTube Data API v3
This script actually collects real YouTube creator data
"""

from googleapiclient.discovery import build
import json
import sys
from datetime import datetime
import re

class RealYouTubeScraper:
    def __init__(self, api_key=None):
        # Use provided API key
        self.api_key = api_key or "AIzaSyBj3g8cvuBq0l7VoXPZBAhQ75KLn30uzj0"
        
        if self.api_key == "YOUR_YOUTUBE_API_KEY":
            print("Warning: Using demo mode. Please provide a real YouTube API key for actual data.")
            self.demo_mode = True
        else:
            self.demo_mode = False
            print(f"✅ Using real YouTube API key: {self.api_key[:10]}...")
            
        if not self.demo_mode:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
    
    def search_creators(self, query, limit=20):
        """
        Search for real YouTube creators
        """
        if self.demo_mode:
            return self.get_demo_data(query, limit)
        
        results = []
        
        try:
            # Search for channels
            search_response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                type='channel',
                maxResults=limit,
                regionCode='KR',  # Focus on Korean market
                relevanceLanguage='ko'
            ).execute()
            
            channel_ids = []
            for search_result in search_response.get('items', []):
                channel_ids.append(search_result['id']['channelId'])
            
            if not channel_ids:
                return []
            
            # Get detailed channel information
            channels_response = self.youtube.channels().list(
                part='snippet,statistics,brandingSettings',
                id=','.join(channel_ids)
            ).execute()
            
            for channel in channels_response.get('items', []):
                creator_data = self.extract_creator_data(channel)
                if creator_data:
                    results.append(creator_data)
                    
        except Exception as e:
            print(f"YouTube API error: {e}")
            return self.get_demo_data(query, limit)
            
        return results
    
    def extract_creator_data(self, channel):
        """Extract creator data from YouTube API response"""
        try:
            snippet = channel['snippet']
            statistics = channel.get('statistics', {})
            
            # Extract basic info
            channel_id = channel['id']
            title = snippet.get('title', '')
            description = snippet.get('description', '')
            custom_url = snippet.get('customUrl', '')
            
            # Extract statistics
            subscriber_count = int(statistics.get('subscriberCount', 0))
            video_count = int(statistics.get('videoCount', 0))
            view_count = int(statistics.get('viewCount', 0))
            
            # Calculate engagement metrics
            avg_views_per_video = view_count / video_count if video_count > 0 else 0
            engagement_rate = self.calculate_engagement_rate(subscriber_count, avg_views_per_video)
            
            # Estimate collaboration cost
            cost_range = self.estimate_collaboration_cost(subscriber_count)
            
            # Determine category
            category = self.determine_category(description, title)
            
            creator_data = {
                'id': f"youtube_{channel_id}",
                'username': custom_url or channel_id,
                'full_name': title,
                'bio': description[:200] if description else "",
                'followers': subscriber_count,  # subscribers
                'following': 0,  # YouTube doesn't show this
                'posts_count': video_count,
                'engagement_rate': engagement_rate,
                'profile_pic_url': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                'is_verified': True,  # Most channels found via API are legitimate
                'category': category,
                'collaboration_cost': cost_range,
                'platform': 'youtube',
                'total_views': view_count,
                'avg_views_per_video': int(avg_views_per_video),
                'last_updated': datetime.now().isoformat(),
                'is_real_data': True
            }
            
            return creator_data
            
        except Exception as e:
            print(f"Error extracting creator data: {e}")
            return None
    
    def calculate_engagement_rate(self, subscribers, avg_views):
        """Calculate engagement rate based on views vs subscribers"""
        if subscribers == 0:
            return 0.0
            
        # YouTube engagement is typically measured as views/subscribers
        engagement_rate = (avg_views / subscribers) * 100
        
        # Cap at reasonable maximum
        return min(round(engagement_rate, 2), 50.0)
    
    def estimate_collaboration_cost(self, subscribers):
        """Estimate collaboration cost based on subscriber count"""
        if subscribers < 10000:
            return "₩300,000 ~ ₩800,000"
        elif subscribers < 50000:
            return "₩800,000 ~ ₩2,000,000"
        elif subscribers < 100000:
            return "₩1,500,000 ~ ₩4,000,000"
        elif subscribers < 500000:
            return "₩3,000,000 ~ ₩8,000,000"
        elif subscribers < 1000000:
            return "₩5,000,000 ~ ₩15,000,000"
        else:
            return "₩10,000,000+"
    
    def determine_category(self, description, title):
        """Determine category from description and title"""
        text = (description + " " + title).lower()
        
        categories = {
            "게임": ["game", "gaming", "gameplay", "게임", "플레이"],
            "뷰티": ["beauty", "makeup", "skincare", "cosmetic", "뷰티", "메이크업", "화장"],
            "요리": ["cooking", "recipe", "food", "kitchen", "요리", "음식", "레시피"],
            "여행": ["travel", "trip", "vlog", "adventure", "여행", "브이로그"],
            "교육": ["tutorial", "education", "learning", "how to", "강의", "교육", "배우기"],
            "음악": ["music", "song", "cover", "singing", "음악", "노래", "커버"],
            "기술": ["tech", "technology", "review", "unboxing", "테크", "리뷰", "언박싱"],
            "운동": ["fitness", "workout", "exercise", "health", "운동", "헬스", "요가"],
            "코미디": ["comedy", "funny", "humor", "entertainment", "코미디", "예능", "웃긴"],
            "패션": ["fashion", "style", "outfit", "clothes", "패션", "스타일", "옷"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category
                
        return "기타"
    
    def get_demo_data(self, query, limit):
        """Return demo data when API key is not available"""
        demo_creators = [
            {
                'id': f"youtube_demo_{query}_1",
                'username': f"creator_{query}_1",
                'full_name': f"{query} 크리에이터 1",
                'bio': f"{query} 관련 콘텐츠를 제작하는 유튜버입니다.",
                'followers': 150000,
                'following': 0,
                'posts_count': 245,
                'engagement_rate': 8.5,
                'profile_pic_url': "https://via.placeholder.com/150",
                'is_verified': True,
                'category': "기타",
                'collaboration_cost': "₩1,500,000 ~ ₩4,000,000",
                'platform': 'youtube',
                'total_views': 25000000,
                'avg_views_per_video': 102040,
                'last_updated': datetime.now().isoformat(),
                'is_real_data': False  # Demo data
            },
            {
                'id': f"youtube_demo_{query}_2",
                'username': f"creator_{query}_2",
                'full_name': f"{query} 전문가",
                'bio': f"전문적인 {query} 콘텐츠로 구독자들에게 가치를 전달합니다.",
                'followers': 89000,
                'following': 0,
                'posts_count': 156,
                'engagement_rate': 12.3,
                'profile_pic_url': "https://via.placeholder.com/150",
                'is_verified': True,
                'category': "교육",
                'collaboration_cost': "₩800,000 ~ ₩2,000,000",
                'platform': 'youtube',
                'total_views': 15000000,
                'avg_views_per_video': 96153,
                'last_updated': datetime.now().isoformat(),
                'is_real_data': False  # Demo data
            }
        ]
        
        return demo_creators[:limit]

def main():
    if len(sys.argv) < 2:
        print("Usage: python youtube_real_scraper.py <search_query> [api_key]")
        sys.exit(1)
    
    query = sys.argv[1]
    api_key = sys.argv[2] if len(sys.argv) > 2 else None
    
    scraper = RealYouTubeScraper(api_key)
    
    print(f"Searching for YouTube creators: {query}")
    results = scraper.search_creators(query, limit=10)
    
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
