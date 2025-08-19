import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import os
from datetime import datetime, timedelta
import numpy as np

# 페이지 설정 - CROVEX 스타일
st.set_page_config(
    page_title="CROVEX - Instagram 인플루언서 분석",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CROVEX 스타일 CSS
st.markdown("""
<style>
    /* 전체 배경 */
    .main > div {
        background-color: #F8F9FA;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* 사이드바 스타일 */
    .css-1d391kg {
        background-color: #FFFFFF;
        border-right: 1px solid #E5E7EB;
    }
    
    /* 메트릭 카드 스타일 */
    [data-testid="metric-container"] {
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 1.5rem 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
    }
    
    /* 메트릭 값 스타일 */
    [data-testid="metric-container"] > div:first-child {
        color: #1F2937 !important;
        font-weight: 700 !important;
        font-size: 1.5rem !important;
    }
    
    /* 메트릭 라벨 스타일 */
    [data-testid="metric-container"] > div:last-child {
        color: #6B7280 !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
    }
    
    /* 타이틀 스타일 */
    h1 {
        color: #1F2937 !important;
        font-weight: 700 !important;
        margin-bottom: 2rem !important;
    }
    
    h2, h3 {
        color: #374151 !important;
        font-weight: 600 !important;
        margin-bottom: 1rem !important;
    }
    
    /* 카드 컨테이너 */
    .chart-card {
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
    }
    
    /* 데이터프레임 스타일 */
    .dataframe {
        background-color: #FFFFFF !important;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
    }
    
    /* 상태 뱃지 */
    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .badge-success {
        background-color: #D1FAE5;
        color: #065F46;
    }
    
    .badge-warning {
        background-color: #FEF3C7;
        color: #92400E;
    }
    
    .badge-info {
        background-color: #DBEAFE;
        color: #1E40AF;
    }
    
    /* 업데이트 시간 표시 */
    .update-time {
        color: #9CA3AF;
        font-size: 0.75rem;
        text-align: right;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# CROVEX 컬러 팔레트 (2.jpg 기준)
COLORS = {
    'primary': '#4F46E5',      # 보라/파랑
    'secondary': '#EC4899',    # 핑크
    'accent': '#F59E0B',       # 오렌지/노랑
    'success': '#10B981',      # 민트/그린
    'info': '#3B82F6',         # 파랑
    'warning': '#F59E0B',      # 노랑
    'danger': '#EF4444',       # 빨강
    'neutral': '#6B7280',      # 회색
    'background': '#F8F9FA',   # 연한 회색
    'surface': '#FFFFFF',      # 흰색
    'border': '#E5E7EB'        # 테두리 회색
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

def create_crovex_plotly_layout():
    """CROVEX 스타일 Plotly 레이아웃 설정"""
    return dict(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#374151', size=12, family="Segoe UI"),
        xaxis=dict(
            gridcolor='#F3F4F6',
            linecolor='#E5E7EB',
            tickcolor='#9CA3AF',
            titlefont=dict(color='#6B7280')
        ),
        yaxis=dict(
            gridcolor='#F3F4F6', 
            linecolor='#E5E7EB',
            tickcolor='#9CA3AF',
            titlefont=dict(color='#6B7280')
        ),
        margin=dict(l=40, r=40, t=60, b=40),
        title=dict(font=dict(color='#1F2937', size=16, family="Segoe UI"))
    )

def main():
    # 헤더 - CROVEX 스타일
    col1, col2 = st.columns([1, 5])
    with col1:
        st.markdown("### 📊 CROVEX")
    with col2:
        st.markdown("### Instagram 인플루언서 분석 대시보드")
    
    # 네비게이션 탭
    tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "📈 Analytics", "👥 CRM", "⚙️ Settings"])
    
    with tab1:
        # 데이터 로드
        df, posts_data = load_data()
        
        if df is None:
            st.error("📊 데이터를 찾을 수 없습니다. 먼저 Instagram 크롤링을 실행해주세요.")
            return
        
        # 사이드바 - 필터
        with st.sidebar:
            st.markdown("### 🎛️ Analytics")
            st.markdown("---")
            
            # 메뉴 아이템들
            menu_items = [
                ("📊", "Dashboard", True),
                ("📈", "Helpdesk", False),
                ("👥", "Sales", False),
                ("⚙️", "Pages", False),
                ("🔐", "Authentication", False)
            ]
            
            for icon, name, active in menu_items:
                if active:
                    st.markdown(f"**{icon} {name}**")
                else:
                    st.markdown(f"{icon} {name}")
            
            st.markdown("---")
            
            # 필터 설정
            st.markdown("#### 📋 SEM")
            st.markdown("#### 🔍 Pages")
            
            # 팔로워 수 범위
            min_followers = st.slider(
                "최소 팔로워 수", 
                min_value=0, 
                max_value=int(df['followers'].max()), 
                value=0,
                step=1000
            )
        
        # 데이터 필터링
        filtered_df = df[df['followers'] >= min_followers]
        
        # 업데이트 시간 표시
        current_time = datetime.now().strftime("%Y.%m.%d %H:%M")
        st.markdown(f"<div class='update-time'>마지막 업데이트: {current_time}</div>", unsafe_allow_html=True)
        
        # KPI 메트릭 카드 - 2.jpg 스타일
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            # Sessions 스타일
            st.markdown("""
            <div style='background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;'>
                <div style='display: flex; align-items: center; margin-bottom: 0.5rem;'>
                    <span style='color: #6B7280; font-size: 0.875rem;'>인플루언서</span>
                </div>
                <div style='font-size: 1.75rem; font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;'>{}</div>
                <div style='color: #10B981; font-size: 0.75rem; font-weight: 600;'>+{} from Yesterday</div>
            </div>
            """.format(f"{len(filtered_df)}", f"{len(filtered_df)}"), unsafe_allow_html=True)
        
        with col2:
            avg_engagement = filtered_df['engagement_rate'].mean()
            st.markdown("""
            <div style='background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;'>
                <div style='display: flex; align-items: center; margin-bottom: 0.5rem;'>
                    <span style='color: #6B7280; font-size: 0.875rem;'>평균 참여율</span>
                </div>
                <div style='font-size: 1.75rem; font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;'>{:.2f}%</div>
                <div style='color: #EF4444; font-size: 0.75rem; font-weight: 600;'>-12% from Weekly Sessions</div>
            </div>
            """.format(avg_engagement), unsafe_allow_html=True)
        
        with col3:
            total_followers = filtered_df['followers'].sum()
            st.markdown("""
            <div style='background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;'>
                <div style='display: flex; align-items: center; margin-bottom: 0.5rem;'>
                    <span style='color: #6B7280; font-size: 0.875rem;'>총 팔로워</span>
                </div>
                <div style='font-size: 1.75rem; font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;'>{}</div>
                <div style='color: #10B981; font-size: 0.75rem; font-weight: 600;'>This Week Bounce Rate</div>
            </div>
            """.format(f"{total_followers/1000000:.1f}M" if total_followers >= 1000000 else f"{total_followers/1000:.0f}K"), unsafe_allow_html=True)
        
        with col4:
            verified_count = filtered_df['is_verified'].sum()
            st.markdown("""
            <div style='background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem;'>
                <div style='display: flex; align-items: center; margin-bottom: 0.5rem;'>
                    <span style='color: #6B7280; font-size: 0.875rem;'>인증 계정</span>
                </div>
                <div style='font-size: 1.75rem; font-weight: 700; color: #1F2937; margin-bottom: 0.25rem;'>{}</div>
                <div style='color: #F59E0B; font-size: 0.75rem; font-weight: 600;'>This Week Goal Completions</div>
            </div>
            """.format(verified_count), unsafe_allow_html=True)
        
        # 메인 차트 영역 - 2.jpg 레이아웃
        col1, col2 = st.columns([3, 2])
        
        with col1:
            # Sessions by Channel - 컬러풀한 바 차트
            st.markdown("### Sessions by Channel")
            
            # 팔로워 수 구간별 분포
            bins = [0, 1000, 10000, 100000, 1000000, float('inf')]
            labels = ['Micro\n(~1K)', 'Small\n(1K-10K)', 'Medium\n(10K-100K)', 'Large\n(100K-1M)', 'Mega\n(1M+)']
            filtered_df['follower_range'] = pd.cut(filtered_df['followers'], bins=bins, labels=labels, right=False)
            
            range_counts = filtered_df['follower_range'].value_counts().reindex(labels, fill_value=0)
            
            fig_sessions = go.Figure(data=[
                go.Bar(
                    x=range_counts.index,
                    y=range_counts.values,
                    marker=dict(
                        color=[COLORS['success'], COLORS['secondary'], COLORS['primary'], 
                               COLORS['accent'], COLORS['info']],
                        line=dict(color='rgba(255,255,255,0.8)', width=1)
                    ),
                    text=range_counts.values,
                    textposition='auto',
                    textfont=dict(color='white', size=12, family="Segoe UI")
                )
            ])
            
            layout_config = create_crovex_plotly_layout()
            layout_config.update({
                'height': 300,
                'showlegend': False,
                'xaxis': dict(title="", tickangle=0, gridcolor='#F3F4F6', linecolor='#E5E7EB', tickcolor='#9CA3AF'),
                'yaxis': dict(title="", gridcolor='#F3F4F6', linecolor='#E5E7EB', tickcolor='#9CA3AF'),
                'margin': dict(l=20, r=20, t=40, b=60)
            })
            fig_sessions.update_layout(layout_config)
            
            st.plotly_chart(fig_sessions, use_container_width=True)
        
        with col2:
            # Traffic Sources - 도넛 차트
            st.markdown("### Traffic Sources")
            st.markdown("**80**")
            st.markdown("Right Now")
            
            # 계정 유형별 분포
            category_counts = filtered_df['category'].fillna('기타').value_counts().head(5)
            
            fig_traffic = go.Figure(data=[
                go.Pie(
                    labels=category_counts.index,
                    values=category_counts.values,
                    hole=0.6,
                    marker=dict(
                        colors=[COLORS['success'], COLORS['info'], COLORS['warning'], 
                               COLORS['secondary'], COLORS['neutral']],
                        line=dict(color='#FFFFFF', width=2)
                    ),
                    textfont=dict(size=10, color='white', family="Segoe UI"),
                    showlegend=True
                )
            ])
            
            layout_config = create_crovex_plotly_layout()
            layout_config.update({
                'height': 300,
                'margin': dict(l=20, r=20, t=40, b=20),
                'legend': dict(
                    orientation="v",
                    yanchor="middle",
                    y=0.5,
                    xanchor="left",
                    x=1.05,
                    font=dict(size=10)
                )
            })
            fig_traffic.update_layout(layout_config)
            
            st.plotly_chart(fig_traffic, use_container_width=True)
        
        # 두 번째 행
        col1, col2 = st.columns([3, 2])
        
        with col1:
            # Audience Overview - 라인 차트
            st.markdown("### Audience Overview")
            
            # 샘플 시계열 데이터 생성
            dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='W')
            np.random.seed(42)
            
            desktop_data = np.cumsum(np.random.randn(len(dates)) * 10) + 1000
            mobile_data = np.cumsum(np.random.randn(len(dates)) * 15) + 1200
            
            fig_audience = go.Figure()
            
            fig_audience.add_trace(go.Scatter(
                x=dates,
                y=desktop_data,
                mode='lines',
                name='Desktop',
                line=dict(color=COLORS['primary'], width=2),
                fill='tonexty'
            ))
            
            fig_audience.add_trace(go.Scatter(
                x=dates,
                y=mobile_data,
                mode='lines',
                name='Mobile',
                line=dict(color=COLORS['info'], width=2, dash='dot'),
                fill='tozeroy'
            ))
            
            layout_config = create_crovex_plotly_layout()
            layout_config.update({
                'height': 300,
                'hovermode': 'x unified',
                'legend': dict(
                    orientation="h",
                    yanchor="bottom",
                    y=1.02,
                    xanchor="right",
                    x=1
                )
            })
            fig_audience.update_layout(layout_config)
            
            st.plotly_chart(fig_audience, use_container_width=True)
            
            # 하단 통계
            col_a, col_b, col_c = st.columns(3)
            with col_a:
                st.markdown("👥 **140k** +5.3%<br><small>Users</small>", unsafe_allow_html=True)
            with col_b:
                st.markdown("📄 **2154** +8.1%<br><small>Page views</small>", unsafe_allow_html=True)
            with col_c:
                st.markdown("👁️ **183k** +3.8%<br><small>Impressions</small>", unsafe_allow_html=True)
        
        with col2:
            # Sessions Device - 도넛 차트와 테이블
            st.markdown("### Sessions Device")
            
            # 디바이스별 데이터 (샘플)
            device_data = {
                'Device': ['Desktop', 'Tablets', 'Mobiles'],
                'Sessions': ['39.2', '20.2', '40.6'],
                'Day': ['-3', '-5', '-8'],
                'Week': ['-12', '-10', '-15']
            }
            
            device_df = pd.DataFrame(device_data)
            
            # 간단한 도넛 차트
            fig_device = go.Figure(data=[
                go.Pie(
                    labels=device_df['Device'],
                    values=[39.2, 20.2, 40.6],
                    hole=0.7,
                    marker=dict(
                        colors=[COLORS['secondary'], COLORS['primary'], COLORS['success']],
                        line=dict(color='#FFFFFF', width=2)
                    ),
                    showlegend=False,
                    textinfo='none'
                )
            ])
            
            layout_config = create_crovex_plotly_layout()
            layout_config.update({
                'height': 200,
                'margin': dict(l=20, r=20, t=20, b=20)
            })
            fig_device.update_layout(layout_config)
            
            st.plotly_chart(fig_device, use_container_width=True)
            
            # 디바이스 테이블
            st.dataframe(device_df, use_container_width=True, hide_index=True)
        
        # 하단 영역 - 테이블들
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### Browser Used by Users")
            
            # 상위 인플루언서 테이블 (브라우저 스타일로)
            top_influencers = filtered_df.nlargest(5, 'followers')[
                ['username', 'followers', 'engagement_rate', 'ai_grade']
            ].copy()
            
            # 브라우저 스타일로 변환
            browser_data = []
            browsers = ['Chrome', 'Safari', 'Internet Explorer', 'Opera', 'Firefox']
            
            for i, (_, row) in enumerate(top_influencers.iterrows()):
                browser_data.append({
                    'Browser': browsers[i],
                    'Sessions': f"{row['followers']//1000}k",
                    'Bounce Rate': f"{row['engagement_rate']:.1f}%",
                    'Transactions': f"{row['followers']//1000//10}",
                    'Revenue': f"${row['followers']//100:,}"
                })
            
            browser_df = pd.DataFrame(browser_data)
            st.dataframe(browser_df, use_container_width=True, hide_index=True)
        
        with col2:
            st.markdown("### Traffic Sources")
            
            # 트래픽 소스 테이블
            traffic_data = {
                'Channel': ['Organic search', 'Email', 'Referral', 'Email', 'Social'],
                'Sessions': ['764k(47%)', '483k(32%)', '366k(24%)', '109k(8%)', '66k(4%)'],
                'Prev Period': ['566k(44%)', '377k(33%)', '215k(18%)', '98k(7%)', '28k(2%)'],
                '% Change': ['+35.1%', '+28.1%', '+70.1%', '+11.2%', '+135.7%']
            }
            
            traffic_df = pd.DataFrame(traffic_data)
            st.dataframe(traffic_df, use_container_width=True, hide_index=True)

    with tab2:
        st.markdown("### 📈 Analytics")
        st.info("Analytics 기능은 개발 중입니다.")
    
    with tab3:
        st.markdown("### 👥 CRM")
        st.info("CRM 기능은 개발 중입니다.")
    
    with tab4:
        st.markdown("### ⚙️ Settings")
        st.info("Settings 기능은 개발 중입니다.")

if __name__ == "__main__":
    main()