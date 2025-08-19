# 🚀 실제 데이터 수집 구현 가이드

## 📋 현재 상황

✅ **완료된 작업:**
- 인플루언서 매칭 플랫폼 기본 구조 완성
- Instagram, TikTok, YouTube 실제 데이터 수집 스크립트 개발
- 통합 실시간 데이터 수집 Edge Function 배포
- API 테스트 완료 (현재 샘플 데이터 반환)

⚠️ **현재 문제:**
- 실제 데이터 수집이 아닌 샘플 데이터만 표시
- 크롤링 기능이 작동하지 않음
- UI 표시 문제 (상단 인플루언서 카드 잘림)

## 🎯 실제 데이터 수집을 위한 3단계 구현

### 1단계: YouTube API (즉시 구현 가능) ⚡

**필요한 것:**
- Google Cloud Console API 키 (무료)

**설정 방법:**
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "라이브러리" → "YouTube Data API v3" 활성화
4. "사용자 인증 정보" → "API 키 만들기"
5. API 키를 Supabase 환경변수 `YOUTUBE_API_KEY`에 설정

**무료 할당량:**
- 일일 10,000 units
- 크리에이터 1명 조회당 약 3-5 units
- 하루 약 2,000-3,000명 조회 가능

### 2단계: Instagram 데이터 (Instaloader) 🔥

**필요한 것:**
- Instagram 로그인 계정 (개인 계정 권장)

**설정 방법:**
```bash
# 1. Instaloader 설치 확인 (이미 완료)
pip install instaloader

# 2. Instagram 로그인 (서버에서 실행)
instaloader --login=your_instagram_username

# 3. 세션 저장 후 스크립트에서 사용
```

**주의사항:**
- Instagram 이용약관 준수
- 요청 간격 조절 (rate limiting)
- 공개 프로필만 접근 가능

### 3단계: TikTok 브라우저 자동화 🤖

**필요한 것:**
- Chrome/Chromium 브라우저
- Selenium WebDriver

**설정 방법:**
```bash
# 1. Chrome 드라이버 설치
apt-get update
apt-get install -y chromium-browser chromium-chromedriver

# 2. 헤드리스 브라우저 환경 설정
export CHROME_BIN=/usr/bin/chromium-browser
export CHROMEDRIVER_PATH=/usr/bin/chromedriver
```

## 🔧 실제 구현 명령어

### A. YouTube API 설정 (1분 완료)

1. **API 키 발급:**
   - Google Cloud Console에서 YouTube Data API v3 키 생성

2. **Supabase 환경변수 설정:**
```bash
# Supabase 대시보드 → Settings → Environment Variables
YOUTUBE_API_KEY=YOUR_ACTUAL_API_KEY
```

3. **즉시 테스트:**
```bash
python3 youtube_real_scraper.py "음식" YOUR_API_KEY
```

### B. Instagram 실제 데이터 설정 (5분 완료)

1. **로그인 세션 생성:**
```bash
cd /workspace/code
python3 -c "
import instaloader
L = instaloader.Instaloader()
L.login('your_username', 'your_password')  # 실제 계정으로 변경
"
```

2. **즉시 테스트:**
```bash
python3 instagram_real_scraper.py "음식"
```

### C. 통합 실시간 수집 활성화 (2분 완료)

1. **Edge Function 업데이트:**
   - 환경변수 설정 완료 후 자동으로 실제 데이터 수집 시작

2. **즉시 테스트:**
```bash
python3 test_real_data_collector.py "음식" true
```

## 🎨 UI 문제 해결

### 문제 1: 상단 인플루언서 카드 잘림

**원인:** CSS 레이아웃 문제
**해결방법:**
```css
.influencer-card {
    min-height: 200px;
    overflow: visible;
    padding: 16px;
}
```

### 문제 2: 검색 기능 미표시

**원인:** 검색바 컴포넌트 누락
**해결방법:** 명확한 검색 입력 필드 추가

### 문제 3: 필터 옵션 불명확

**원인:** 아이콘만으로 기능 표시
**해결방법:** 텍스트 라벨 추가

## 🚀 즉시 실행 가능한 액션

### 옵션 1: YouTube부터 시작 (권장)
```bash
# 1. YouTube API 키 발급 (2분)
# 2. 환경변수 설정 (1분)
# 3. 실제 YouTube 크리에이터 데이터 수집 시작 ✅
```

### 옵션 2: 전체 플랫폼 동시 설정
```bash
# 1. YouTube API 키 + Instagram 계정 + TikTok 환경 설정 (10분)
# 2. 모든 플랫폼 실시간 데이터 수집 활성화 ✅
```

### 옵션 3: UI 우선 수정
```bash
# 1. 화면 표시 문제 즉시 수정 (5분)
# 2. 데이터 수집은 단계적 적용
```

## 📊 예상 결과

### YouTube API 설정 후:
```json
{
  "real_data": 10,
  "sample_data": 0,
  "platforms": ["youtube"],
  "data_sources": ["youtube_data_api_v3"]
}
```

### 전체 설정 완료 후:
```json
{
  "real_data": 30,
  "sample_data": 0, 
  "platforms": ["instagram", "youtube", "tiktok"],
  "data_sources": ["instaloader_api", "youtube_data_api_v3", "browser_automation"]
}
```

## 🔥 바로 실행하시겠습니까?

어떤 옵션을 선택하시면 즉시 구현해드리겠습니다:

1. **YouTube API 설정** (2분, 즉시 실제 데이터 확인)
2. **전체 플랫폼 설정** (10분, 완전한 실시간 수집)
3. **UI 문제 우선 해결** (5분, 화면 표시 개선)

API 키를 제공해주시거나 설정 방법을 안내해달라고 하시면 바로 진행하겠습니다!
