# 📚 Instagram Influencer Analyzer - 배포 가이드

## 🚀 GitHub 푸시 방법

### 1. GitHub 저장소 생성
1. https://github.com/new 접속
2. Repository name: `instagram-influencer-analyzer`
3. Description: "인스타그램 인플루언서 분석 및 바이럴 콘텐츠 분석 도구"
4. **중요**: Initialize 옵션들은 모두 체크 해제
5. Create repository 클릭

### 2. 로컬에서 GitHub 연결
```bash
cd C:/influ
git remote add origin https://github.com/jsky9292/instagram-influencer-analyzer.git
git push -u origin master
```

### 3. GitHub 인증
- Username: jsky9292
- Password: GitHub Personal Access Token (비밀번호 대신 토큰 사용)
  
#### Personal Access Token 생성 방법:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. 권한 선택: repo (전체 체크)
5. Generate token
6. 토큰 복사 (한 번만 보여짐!)

## 🌐 온라인 배포 (Vercel)

### Frontend (Next.js) 배포

1. **Vercel 계정 생성**: https://vercel.com

2. **GitHub 연동**:
   - Import Git Repository
   - GitHub 계정 연결
   - 저장소 선택

3. **프로젝트 설정**:
   ```
   Framework Preset: Next.js
   Root Directory: dashboard
   Build Command: npm run build
   Output Directory: .next
   ```

4. **환경 변수 설정**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.herokuapp.com
   ```

5. **Deploy 클릭**

### Backend (FastAPI) 배포 - Heroku

1. **Heroku 계정 생성**: https://heroku.com

2. **Heroku CLI 설치**

3. **Backend 준비**:
   ```bash
   cd dashboard/api
   ```

4. **Procfile 생성**:
   ```
   web: uvicorn crawl_realtime:app --host 0.0.0.0 --port $PORT
   ```

5. **requirements.txt 생성**:
   ```
   fastapi
   uvicorn
   python-jose[cryptography]
   passlib[bcrypt]
   python-multipart
   sqlalchemy
   pandas
   ```

6. **Heroku 앱 생성 및 배포**:
   ```bash
   heroku create your-app-name
   git add .
   git commit -m "Add Heroku deployment files"
   git push heroku master
   ```

## 🔐 환경 변수 설정

### Frontend (Vercel):
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Backend (Heroku):
- `SECRET_KEY`: JWT 시크릿 키
- `DATABASE_URL`: PostgreSQL URL (Heroku 자동 제공)
- `INSTAGRAM_USERNAME`: Instagram 크롤링 계정
- `INSTAGRAM_PASSWORD`: Instagram 크롤링 비밀번호

## 📱 도메인 연결 (선택사항)

### Custom Domain 설정:
1. Vercel Dashboard → Settings → Domains
2. Add Domain
3. DNS 설정:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

## 🎯 배포 체크리스트

- [ ] GitHub 저장소 생성
- [ ] 코드 푸시
- [ ] Vercel 계정 생성
- [ ] Frontend 배포
- [ ] Heroku 계정 생성
- [ ] Backend 배포
- [ ] 환경 변수 설정
- [ ] API URL 연결 확인
- [ ] 테스트

## 💡 팁

1. **무료 호스팅 옵션**:
   - Frontend: Vercel, Netlify
   - Backend: Render.com, Railway.app
   - Database: Supabase, PlanetScale

2. **Instagram 크롤링 주의사항**:
   - 프로덕션에서는 Instagram API 사용 권장
   - Rate limiting 구현 필수
   - 프록시 서버 고려

3. **보안 강화**:
   - HTTPS 필수
   - CORS 설정 확인
   - 환경 변수로 민감 정보 관리

## 📞 문의사항

배포 관련 문제가 있으면 GitHub Issues에 남겨주세요!