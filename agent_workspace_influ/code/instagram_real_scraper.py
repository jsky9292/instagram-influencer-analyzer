#!/usr/bin/env python3
"""
Real Instagram Data Scraper using Instaloader
This script actually collects real Instagram influencer data
"""

import instaloader
import json
import sys
from datetime import datetime
import time
import random

class RealInstagramScraper:
    def __init__(self, username=None, password=None):
        self.loader = instaloader.Instaloader()
        # Add some delay to avoid rate limiting
        self.loader.sleep = True
        
        # Login if credentials provided
        if username and password:
            try:
                self.loader.login(username, password)
                print(f"✅ Instagram 로그인 성공: {username}")
                self.logged_in = True
            except Exception as e:
                print(f"❌ Instagram 로그인 실패: {e}")
                self.logged_in = False
        else:
            print("ℹ️ Instagram 로그인 없이 공개 데이터만 수집합니다")
            self.logged_in = False
        
    def search_influencers(self, query, limit=20):
        """
        Search for real Instagram influencers based on query
        """
        results = []
        try:
            # Search for profiles containing the query
            profiles = []
            
            # Method 1: Search by hashtag to find active users
            if query.startswith('#'):
                hashtag = instaloader.Hashtag.from_name(self.loader.context, query[1:])
                posts = hashtag.get_posts()
                
                # Get profiles from recent posts
                profile_names = set()
                for post in posts:
                    if len(profile_names) >= limit * 2:  # Get more to filter later
                        break
                    profile_names.add(post.owner_username)
                
                # Load full profiles
                for username in list(profile_names)[:limit]:
                    try:
                        profile = instaloader.Profile.from_username(self.loader.context, username)
                        profiles.append(profile)
                    except Exception as e:
                        print(f"Failed to load profile {username}: {e}")
                        continue
            
            # Method 2: Direct username search
            else:
                try:
                    # Try exact username match first
                    profile = instaloader.Profile.from_username(self.loader.context, query)
                    profiles.append(profile)
                except:
                    # If not found, we'll need to implement a different search method
                    # For now, we'll use some popular influencer categories
                    sample_accounts = [
                        'food', 'travel', 'fashion', 'beauty', 'fitness', 
                        'lifestyle', 'photography', 'art', 'music', 'tech'
                    ]
                    
                    for keyword in sample_accounts:
                        if keyword.lower() in query.lower():
                            # Search hashtag related to query
                            try:
                                hashtag = instaloader.Hashtag.from_name(self.loader.context, keyword)
                                posts = hashtag.get_posts()
                                
                                profile_names = set()
                                for post in posts:
                                    if len(profile_names) >= 10:
                                        break
                                    profile_names.add(post.owner_username)
                                
                                for username in list(profile_names)[:5]:
                                    try:
                                        profile = instaloader.Profile.from_username(self.loader.context, username)
                                        profiles.append(profile)
                                    except:
                                        continue
                                break
                            except:
                                continue
            
            # Process profiles and extract data
            for profile in profiles[:limit]:
                try:
                    # Calculate engagement rate from recent posts
                    engagement_rate = self.calculate_engagement_rate(profile)
                    
                    # Estimate collaboration cost based on followers
                    cost_range = self.estimate_collaboration_cost(profile.followers)
                    
                    influencer_data = {
                        'id': f"real_{profile.username}",
                        'username': profile.username,
                        'full_name': profile.full_name or profile.username,
                        'bio': profile.biography[:200] if profile.biography else "",
                        'followers': profile.followers,
                        'following': profile.followees,
                        'posts_count': profile.mediacount,
                        'engagement_rate': engagement_rate,
                        'profile_pic_url': profile.profile_pic_url,
                        'is_verified': profile.is_verified,
                        'is_business': profile.is_business_account,
                        'category': self.determine_category(profile.biography),
                        'collaboration_cost': cost_range,
                        'platform': 'instagram',
                        'last_updated': datetime.now().isoformat(),
                        'is_real_data': True
                    }
                    
                    results.append(influencer_data)
                    
                    # Add delay to avoid rate limiting
                    time.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    print(f"Error processing profile {profile.username}: {e}")
                    continue
                    
        except Exception as e:
            print(f"Search error: {e}")
            return []
            
        return results
    
    def calculate_engagement_rate(self, profile):
        """Calculate engagement rate from recent posts"""
        try:
            posts = list(profile.get_posts())[:12]  # Last 12 posts
            if not posts:
                return 0.0
                
            total_engagement = 0
            for post in posts:
                engagement = post.likes + post.comments
                total_engagement += engagement
                
            avg_engagement = total_engagement / len(posts)
            engagement_rate = (avg_engagement / profile.followers) * 100 if profile.followers > 0 else 0
            
            return round(engagement_rate, 2)
        except:
            return 0.0
    
    def estimate_collaboration_cost(self, followers):
        """Estimate collaboration cost based on follower count"""
        if followers < 10000:
            return "₩100,000 ~ ₩300,000"
        elif followers < 50000:
            return "₩300,000 ~ ₩800,000"
        elif followers < 100000:
            return "₩500,000 ~ ₩1,500,000"
        elif followers < 500000:
            return "₩1,000,000 ~ ₩3,000,000"
        else:
            return "₩2,000,000+"
    
    def determine_category(self, bio):
        """Determine category from bio"""
        if not bio:
            return "기타"
            
        bio_lower = bio.lower()
        
        categories = {
            "음식": ["food", "recipe", "cooking", "chef", "restaurant", "맛집", "요리", "음식", "푸드"],
            "여행": ["travel", "trip", "adventure", "world", "여행", "트래블"],
            "패션": ["fashion", "style", "outfit", "fashion", "스타일", "패션"],
            "뷰티": ["beauty", "makeup", "skincare", "cosmetic", "뷰티", "메이크업"],
            "피트니스": ["fitness", "workout", "gym", "health", "운동", "헬스", "요가"],
            "라이프스타일": ["lifestyle", "daily", "life", "라이프스타일", "일상"],
            "기술": ["tech", "technology", "gadget", "review", "테크", "기술"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in bio_lower for keyword in keywords):
                return category
                
        return "기타"

def main():
    if len(sys.argv) < 2:
        print("Usage: python instagram_real_scraper.py <search_query>")
        sys.exit(1)
    
    query = sys.argv[1]
    scraper = RealInstagramScraper()
    
    print(f"Searching for Instagram influencers: {query}")
    results = scraper.search_influencers(query, limit=10)
    
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()