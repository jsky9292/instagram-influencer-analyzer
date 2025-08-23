# Instagram Influencer Analyzer

실시간 Instagram 인플루언서 분석 도구

## 기능

- 🔍 해시태그 기반 인플루언서 실시간 검색
- 📊 인플루언서 상세 분석 (팔로워, 참여율, 게시물)
- 🌏 다국어 해시태그 자동 번역 (한국, 미국, 일본, 중국, 인도네시아 등)
- 🎯 바이럴 콘텐츠 분석 및 AI 기반 콘텐츠 아이디어 생성
- 👥 팔로워 크롤링 및 분석
- 📈 대시보드를 통한 시각화

## 설치 방법

### 필요 프로그램
- Python 3.8+
- Node.js 18+

### 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/jsky9292/instagram-influencer-analyzer.git
cd instagram-influencer-analyzer
```

2. **InstagramAnalyzer_Pro.bat** 실행
   - 자동으로 필요한 패키지 설치
   - Instagram 로그인 정보 입력
   - 브라우저 자동 실행

## 폴더 구조

```
├── dashboard/          # Next.js 웹 대시보드
│   ├── api/           # FastAPI 백엔드 서버
│   └── components/    # React 컴포넌트
├── Instagram/         # Instagram 크롤러
└── InstagramAnalyzer_Pro.bat  # 실행 파일
```

## 사용법

1. 프로그램 실행 후 브라우저에서 http://localhost:3000 접속
2. 검색하고 싶은 해시태그 입력
3. 국가 선택 (자동으로 해당 국가 언어로 번역)
4. 인플루언서 목록 확인 및 상세 분석

## 주의사항

- Instagram 계정이 필요합니다
- 과도한 크롤링은 계정 제한을 받을 수 있습니다
- config.json 파일은 Git에 포함되지 않습니다 (보안)

## License

MIT