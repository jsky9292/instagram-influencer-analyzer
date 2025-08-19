import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import os
from datetime import datetime
import numpy as np

# 페이지 설정
st.set_page_config(
    page_title="🌙 Instagram 인플루언서 분석 대시보드",
    page_title_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 다크 테마 CSS 스타일
st.markdown("""
<style>
    /* 메인 배경 */
    .main > div {
        background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
        color: #ffffff;
    }
    
    /* 사이드바 스타일 */
    .css-1d391kg {
        background: linear-gradient(180deg, #1a1a1a 0%, #0d1117 100%);
    }
    
    /* 메트릭 카드 스타일 */
    [data-testid="metric-container"] {
        background: linear-gradient(135deg, #161b22 0%, #0d1117 100%);
        border: 1px solid #30363d;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 8px 32px rgba(0, 255, 157, 0.1);
    }
    
    /* 메트릭 값 스타일 */
    [data-testid="metric-container"] > div:first-child {
        color: #00ff9d !important;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
    }
    
    /* 타이틀 스타일 */
    h1, h2, h3 {
        color: #ffffff !important;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
    
    /* 네온 그린 강조 */
    .neon-green {
        color: #00ff9d;
        text-shadow: 0 0 10px rgba(0, 255, 157, 0.7);
    }
    
    /* 네온 블루 강조 */
    .neon-blue {
        color: #00d4ff;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.7);
    }
    
    /* 네온 핑크 강조 */
    .neon-pink {
        color: #ff006e;
        text-shadow: 0 0 10px rgba(255, 0, 110, 0.7);
    }
    
    /* 데이터프레임 스타일 */
    .dataframe {
        background-color: #161b22 !important;
        color: #ffffff !important;
        border: 1px solid #30363d;
        border-radius: 8px;
    }
</style>
""", unsafe_allow_html=True)

# 다크 테마 컬러 팔레트
COLORS = {
    'primary': '#00ff9d',      # 네온 그린
    'secondary': '#00d4ff',    # 네온 블루  
    'accent': '#ff006e',       # 네온 핑크
    'warning': '#ffbe0b',      # 네온 옐로우
    'background': '#0d1117',   # 다크 배경
    'surface': '#161b22',      # 카드 배경
    'border': '#30363d'        # 테두리
}

@st.cache_data
def load_data():
    """데이터 로드 함수"""
    try:
        # results 폴더에서 가장 최근 데이터 찾기
        results_dir = "results"
        if not os.path.exists(results_dir):
            return None, None
        
        # 가장 최근 폴더 찾기
        folders = [f for f in os.listdir(results_dir) if os.path.isdir(os.path.join(results_dir, f))]
        if not folders:
            return None, None
        
        latest_folder = max(folders)
        folder_path = os.path.join(results_dir, latest_folder)
        
        # CSV 파일 찾기
        csv_files = [f for f in os.listdir(folder_path) if f.endswith('_profiles.csv')]
        if not csv_files:
            return None, None
        
        # 데이터 로드
        csv_path = os.path.join(folder_path, csv_files[0])
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
        
        # JSON 파일 찾기
        json_files = [f for f in os.listdir(folder_path) if f.endswith('_recent_posts_full.json')]
        posts_data = None
        if json_files:
            json_path = os.path.join(folder_path, json_files[0])
            with open(json_path, 'r', encoding='utf-8') as f:
                posts_data = json.load(f)
        
        return df, posts_data
    except Exception as e:
        st.error(f"데이터 로드 오류: {e}")
        return None, None

def create_dark_plotly_layout():
    """다크 테마 Plotly 레이아웃 설정"""
    return dict(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='white', size=12),
        xaxis=dict(
            gridcolor='#30363d',
            linecolor='#30363d',
            tickcolor='white'
        ),
        yaxis=dict(
            gridcolor='#30363d', 
            linecolor='#30363d',
            tickcolor='white'
        ),
        margin=dict(l=40, r=40, t=60, b=40)
    )

def main():
    # 헤더
    st.markdown("""
    <h1 style='text-align: center; margin-bottom: 2rem;'>
        🌙 <span class='neon-green'>Instagram</span> 
        <span class='neon-blue'>인플루언서</span> 
        <span class='neon-pink'>분석 대시보드</span>
    </h1>
    """, unsafe_allow_html=True)
    
    # 데이터 로드
    df, posts_data = load_data()
    
    if df is None:
        st.error("📊 데이터를 찾을 수 없습니다. 먼저 Instagram 크롤링을 실행해주세요.")
        return
    
    # 사이드바 - 필터
    with st.sidebar:
        st.markdown("## 🎛️ 필터 설정")
        
        # 팔로워 수 범위
        min_followers = st.slider(
            "최소 팔로워 수", 
            min_value=0, 
            max_value=int(df['followers'].max()), 
            value=0,
            step=1000
        )
        
        # 계정 유형 필터
        account_types = df['category'].dropna().unique().tolist()
        selected_types = st.multiselect(
            "계정 유형", 
            account_types, 
            default=account_types
        )
        
        # 인증 계정 필터
        verified_filter = st.selectbox(
            "인증 계정", 
            ["전체", "인증됨", "미인증"]
        )
    
    # 데이터 필터링
    filtered_df = df[df['followers'] >= min_followers]
    
    if selected_types:
        filtered_df = filtered_df[filtered_df['category'].isin(selected_types)]
    
    if verified_filter == "인증됨":
        filtered_df = filtered_df[filtered_df['is_verified'] == True]
    elif verified_filter == "미인증":
        filtered_df = filtered_df[filtered_df['is_verified'] == False]
    
    # KPI 메트릭
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "🎯 총 인플루언서", 
            f"{len(filtered_df):,}",
            delta=f"{len(filtered_df) - len(df)} (필터 적용)"
        )
    
    with col2:
        avg_followers = filtered_df['followers'].mean()
        st.metric(
            "👥 평균 팔로워", 
            f"{avg_followers:,.0f}",
            delta=f"{(avg_followers/1000):.1f}K"
        )
    
    with col3:
        avg_engagement = filtered_df['engagement_rate'].mean()
        st.metric(
            "📈 평균 참여율", 
            f"{avg_engagement:.2f}%",
            delta=f"{'높음' if avg_engagement > 2 else '보통'}"
        )
    
    with col4:
        verified_count = filtered_df['is_verified'].sum()
        st.metric(
            "✅ 인증 계정", 
            f"{verified_count}",
            delta=f"{(verified_count/len(filtered_df)*100):.1f}%"
        )
    
    # 메인 차트 영역
    st.markdown("---")
    
    # 첫 번째 행 - 팔로워 분포와 참여율 산점도
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🔥 <span class='neon-green'>팔로워 수 분포</span>", unsafe_allow_html=True)
        
        # 팔로워 수 구간별 분포
        bins = [0, 1000, 10000, 100000, 1000000, float('inf')]
        labels = ['~1K', '1K-10K', '10K-100K', '100K-1M', '1M+']
        filtered_df['follower_range'] = pd.cut(filtered_df['followers'], bins=bins, labels=labels, right=False)
        
        range_counts = filtered_df['follower_range'].value_counts()
        
        fig_followers = go.Figure(data=[
            go.Bar(
                x=range_counts.index,
                y=range_counts.values,
                marker=dict(
                    color=[COLORS['primary'], COLORS['secondary'], COLORS['accent'], 
                           COLORS['warning'], COLORS['primary']],
                    line=dict(color='rgba(255,255,255,0.2)', width=1)
                ),
                text=range_counts.values,
                textposition='auto',
            )
        ])
        
        fig_followers.update_layout(
            **create_dark_plotly_layout(),
            title="팔로워 수 구간별 인플루언서 분포",
            xaxis_title="팔로워 구간",
            yaxis_title="인플루언서 수"
        )
        
        st.plotly_chart(fig_followers, use_container_width=True)
    
    with col2:
        st.markdown("### ⚡ <span class='neon-blue'>팔로워 vs 참여율</span>", unsafe_allow_html=True)
        
        # 버블 크기용 게시물 수 정규화
        sizes = np.sqrt(filtered_df['posts']) * 3
        
        fig_scatter = go.Figure(data=go.Scatter(
            x=filtered_df['followers'],
            y=filtered_df['engagement_rate'],
            mode='markers',
            marker=dict(
                size=sizes,
                color=filtered_df['engagement_rate'],
                colorscale=[[0, COLORS['accent']], [0.5, COLORS['secondary']], [1, COLORS['primary']]],
                showscale=True,
                line=dict(width=1, color='rgba(255,255,255,0.3)'),
                colorbar=dict(title="참여율 %")
            ),
            text=filtered_df['username'],
            hovertemplate='<b>%{text}</b><br>' +
                         '팔로워: %{x:,}<br>' +
                         '참여율: %{y:.2f}%<br>' +
                         '<extra></extra>'
        ))
        
        fig_scatter.update_layout(
            **create_dark_plotly_layout(),
            title="팔로워 수 대비 참여율 (버블 크기: 게시물 수)",
            xaxis_title="팔로워 수",
            yaxis_title="참여율 (%)",
            xaxis_type="log"
        )
        
        st.plotly_chart(fig_scatter, use_container_width=True)
    
    # 두 번째 행 - AI 등급 분포와 Top 인플루언서
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🏆 <span class='neon-pink'>AI 등급 분포</span>", unsafe_allow_html=True)
        
        grade_counts = filtered_df['ai_grade'].value_counts().reindex(['S', 'A', 'B', 'C'], fill_value=0)
        
        fig_grade = go.Figure(data=[
            go.Pie(
                labels=grade_counts.index,
                values=grade_counts.values,
                hole=0.4,
                marker=dict(
                    colors=[COLORS['primary'], COLORS['secondary'], COLORS['warning'], COLORS['accent']],
                    line=dict(color='rgba(255,255,255,0.2)', width=2)
                ),
                textfont=dict(size=14, color='white'),
                hovertemplate='등급: %{label}<br>개수: %{value}<br>비율: %{percent}<extra></extra>'
            )
        ])
        
        fig_grade.update_layout(
            **create_dark_plotly_layout(),
            title="AI 등급별 인플루언서 분포",
            annotations=[dict(text='AI<br>등급', x=0.5, y=0.5, font_size=16, showarrow=False, font_color='white')]
        )
        
        st.plotly_chart(fig_grade, use_container_width=True)
    
    with col2:
        st.markdown("### 🌟 <span class='neon-green'>Top 인플루언서</span>", unsafe_allow_html=True)
        
        # 상위 인플루언서 테이블
        top_influencers = filtered_df.nlargest(10, 'followers')[
            ['username', 'full_name', 'followers', 'engagement_rate', 'ai_grade', 'is_verified']
        ].copy()
        
        # 팔로워 수 포맷팅
        top_influencers['followers_formatted'] = top_influencers['followers'].apply(
            lambda x: f"{x/1000000:.1f}M" if x >= 1000000 else f"{x/1000:.1f}K"
        )
        
        # 인증 마크 추가
        top_influencers['verified_mark'] = top_influencers['is_verified'].apply(
            lambda x: "✅" if x else ""
        )
        
        # 표시용 데이터프레임 생성
        display_df = top_influencers[['username', 'verified_mark', 'followers_formatted', 'engagement_rate', 'ai_grade']].copy()
        display_df.columns = ['계정명', '✅', '팔로워', '참여율(%)', 'AI등급']
        
        st.dataframe(
            display_df,
            use_container_width=True,
            height=350
        )
    
    # 세 번째 행 - 게시물 분석 (posts_data가 있는 경우)
    if posts_data:
        st.markdown("---")
        st.markdown("### 📱 <span class='neon-blue'>게시물 분석</span>", unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            # 게시물 유형 분포
            post_types = []
            like_counts = []
            
            for username, posts in posts_data.items():
                for post in posts:
                    post_types.append(post.get('post_type', 'post'))
                    like_counts.append(post.get('like_count', 0))
            
            type_counts = pd.Series(post_types).value_counts()
            
            fig_post_types = go.Figure(data=[
                go.Bar(
                    x=type_counts.values,
                    y=type_counts.index,
                    orientation='h',
                    marker=dict(
                        color=[COLORS['primary'], COLORS['secondary']],
                        line=dict(color='rgba(255,255,255,0.2)', width=1)
                    ),
                    text=type_counts.values,
                    textposition='auto',
                )
            ])
            
            fig_post_types.update_layout(
                **create_dark_plotly_layout(),
                title="게시물 유형별 분포",
                xaxis_title="게시물 수",
                yaxis_title="유형"
            )
            
            st.plotly_chart(fig_post_types, use_container_width=True)
        
        with col2:
            # 좋아요 수 분포
            like_counts_clean = [x for x in like_counts if x > 0]
            
            fig_likes = go.Figure(data=[
                go.Histogram(
                    x=like_counts_clean,
                    nbinsx=20,
                    marker=dict(
                        color=COLORS['accent'],
                        opacity=0.7,
                        line=dict(color='rgba(255,255,255,0.2)', width=1)
                    )
                )
            ])
            
            fig_likes.update_layout(
                **create_dark_plotly_layout(),
                title="게시물 좋아요 수 분포",
                xaxis_title="좋아요 수",
                yaxis_title="게시물 수",
                xaxis_type="log"
            )
            
            st.plotly_chart(fig_likes, use_container_width=True)
    
    # 푸터
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; opacity: 0.7; margin-top: 2rem;'>
        <p>🌙 <span class='neon-green'>Instagram 인플루언서 분석 대시보드</span> | 
        Made with ❤️ by Claude</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()