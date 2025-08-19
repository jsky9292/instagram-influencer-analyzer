#!/usr/bin/env python3
"""
Unified Real Data Scraper
Combines Instagram (Instaloader), TikTok (Browser Automation), and YouTube (API) scrapers
"""

import json
import sys
import asyncio
from datetime import datetime
from instagram_real_scraper import RealInstagramScraper
from tiktok_real_scraper import RealTikTokScraper
from youtube_real_scraper import RealYouTubeScraper

class UnifiedRealScraper:
    def __init__(self, youtube_api_key=None):
        self.instagram_scraper = RealInstagramScraper()
        self.youtube_scraper = RealYouTubeScraper(youtube_api_key)
        
    def search_all_platforms(self, query, platforms=['instagram', 'youtube'], limit_per_platform=10):
        """
        Search across all specified platforms for real influencer data
        """
        all_results = []
        
        try:
            if 'instagram' in platforms:
                print(f"🔍 Searching Instagram for: {query}")
                instagram_results = self.instagram_scraper.search_influencers(query, limit_per_platform)
                all_results.extend(instagram_results)
                print(f"✅ Found {len(instagram_results)} Instagram creators")
                
        except Exception as e:
            print(f"❌ Instagram search failed: {e}")
        
        try:
            if 'youtube' in platforms:
                print(f"🔍 Searching YouTube for: {query}")
                youtube_results = self.youtube_scraper.search_creators(query, limit_per_platform)
                all_results.extend(youtube_results)
                print(f"✅ Found {len(youtube_results)} YouTube creators")
                
        except Exception as e:
            print(f"❌ YouTube search failed: {e}")
        
        try:
            if 'tiktok' in platforms:
                print(f"🔍 Searching TikTok for: {query}")
                tiktok_scraper = RealTikTokScraper(headless=True)
                tiktok_results = tiktok_scraper.search_creators(query, limit_per_platform)
                all_results.extend(tiktok_results)
                print(f"✅ Found {len(tiktok_results)} TikTok creators")
                del tiktok_scraper
                
        except Exception as e:
            print(f"❌ TikTok search failed: {e}")
        
        # Sort by follower count
        all_results.sort(key=lambda x: x.get('followers', 0), reverse=True)
        
        return all_results
    
    def filter_results(self, results, filters):
        """
        Filter results based on criteria
        """
        filtered = []
        
        for result in results:
            # Platform filter
            if filters.get('platform') and result['platform'] != filters['platform']:
                continue
                
            # Follower count filter
            min_followers = filters.get('min_followers', 0)
            max_followers = filters.get('max_followers', float('inf'))
            if not (min_followers <= result['followers'] <= max_followers):
                continue
                
            # Engagement rate filter
            min_engagement = filters.get('min_engagement', 0)
            max_engagement = filters.get('max_engagement', 100)
            if not (min_engagement <= result['engagement_rate'] <= max_engagement):
                continue
                
            # Category filter
            if filters.get('category') and result['category'] != filters['category']:
                continue
                
            # Verification filter
            if filters.get('verified_only') and not result.get('is_verified', False):
                continue
                
            filtered.append(result)
        
        return filtered
    
    def search_with_filters(self, query, platforms=['instagram', 'youtube'], filters=None, limit=20):
        """
        Search with filters applied
        """
        # Get all results
        all_results = self.search_all_platforms(query, platforms, limit_per_platform=limit//len(platforms) + 5)
        
        # Apply filters if provided
        if filters:
            all_results = self.filter_results(all_results, filters)
        
        # Return limited results
        return all_results[:limit]

def main():
    if len(sys.argv) < 2:
        print("Usage: python unified_real_scraper.py <search_query> [platforms] [youtube_api_key]")
        print("Platforms: instagram,youtube,tiktok (comma-separated)")
        sys.exit(1)
    
    query = sys.argv[1]
    platforms = sys.argv[2].split(',') if len(sys.argv) > 2 else ['instagram', 'youtube']
    youtube_api_key = sys.argv[3] if len(sys.argv) > 3 else None
    
    scraper = UnifiedRealScraper(youtube_api_key)
    
    print(f"🚀 Starting unified search for: {query}")
    print(f"📱 Platforms: {', '.join(platforms)}")
    
    results = scraper.search_all_platforms(query, platforms, limit_per_platform=5)
    
    print(f"\n🎯 Total results found: {len(results)}")
    print(f"📊 Real data: {sum(1 for r in results if r.get('is_real_data', False))}")
    print(f"🧪 Demo data: {sum(1 for r in results if not r.get('is_real_data', False))}")
    
    # Output results
    output = {
        'query': query,
        'platforms': platforms,
        'total_results': len(results),
        'search_timestamp': datetime.now().isoformat(),
        'results': results
    }
    
    print(json.dumps(output, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
