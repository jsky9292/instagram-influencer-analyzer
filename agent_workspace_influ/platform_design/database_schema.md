## 5. 데이터베이스 스키마 설계

- **설계 원칙**: 마이크로서비스 아키텍처에 따라 각 서비스가 독립적인 데이터베이스를 가지는 것을 원칙으로 하나, 본 문서에서는 핵심 테이블들의 논리적 설계를 중심으로 기술한다.

### 5.1. 사용자 서비스 (User Service)

- **Users (사용자 공통)**
    - `user_id` (PK, UUID)
    - `email` (UNIQUE, VARCHAR)
    - `password_hash` (VARCHAR)
    - `user_type` (ENUM: 'INFLUENCER', 'BRAND', 'AGENCY', 'ADMIN')
    - `name` (VARCHAR)
    - `profile_image_url` (VARCHAR)
    - `phone_number` (VARCHAR)
    - `status` (ENUM: 'ACTIVE', 'INACTIVE', 'SUSPENDED')
    - `created_at` (TIMESTAMP)
    - `updated_at` (TIMESTAMP)

- **Influencer_Profiles (인플루언서 프로필)**
    - `influencer_id` (PK, FK from Users)
    - `channel_name` (VARCHAR)
    - `description` (TEXT)
    - `categories` (JSONB) - (예: ["뷰티", "패션"])
    - `contact_email` (VARCHAR)
    - `portfolio_url` (VARCHAR)

- **Brand_Profiles (브랜드/에이전시 프로필)**
    - `brand_id` (PK, FK from Users)
    - `company_name` (VARCHAR)
    - `business_registration_number` (VARCHAR)
    - `website_url` (VARCHAR)
    - `industry` (VARCHAR)

- **SNS_Accounts (연동 SNS 계정)**
    - `sns_account_id` (PK, BIGSERIAL)
    - `influencer_id` (FK from Influencer_Profiles)
    - `platform` (ENUM: 'INSTAGRAM', 'YOUTUBE', 'TIKTOK')
    - `sns_user_id` (VARCHAR)
    - `access_token` (VARCHAR, ENCRYPTED)
    - `followers_count` (INTEGER)
    - `avg_engagement_rate` (DECIMAL)
    - `last_synced_at` (TIMESTAMP)

### 5.2. 캠페인 서비스 (Campaign Service)

- **Campaigns (캠페인)**
    - `campaign_id` (PK, UUID)
    - `brand_id` (FK from Brand_Profiles)
    - `title` (VARCHAR)
    - `description` (TEXT)
    - `budget` (DECIMAL)
    - `start_date` (DATE)
    - `end_date` (DATE)
    - `status` (ENUM: 'RECRUITING', 'ONGOING', 'COMPLETED', 'CANCELLED')
    - `target_kpis` (JSONB) - (예: {"reach": 100000, "engagement_rate": 0.03})
    - `created_at` (TIMESTAMP)

- **Campaign_Applications (캠페인 지원/계약)**
    - `application_id` (PK, BIGSERIAL)
    - `campaign_id` (FK from Campaigns)
    - `influencer_id` (FK from Influencer_Profiles)
    - `proposed_cost` (DECIMAL)
    - `status` (ENUM: 'APPLIED', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CONTRACTED')
    - `contract_id` (FK from Contracts)
    - `applied_at` (TIMESTAMP)

- **Contracts (계약)**
    - `contract_id` (PK, UUID)
    - `content` (TEXT) - (계약서 내용)
    - `brand_signature` (BLOB)
    - `influencer_signature` (BLOB)
    - `signed_at` (TIMESTAMP)

### 5.3. 성과 분석 서비스 (Analytics Service)

- **Campaign_Performance (캠페인 성과)**
    - `performance_id` (PK, BIGSERIAL)
    - `application_id` (FK from Campaign_Applications)
    - `post_url` (VARCHAR)
    - `snapshot_date` (DATE)
    - `reach` (INTEGER)
    - `impressions` (INTEGER)
    - `likes` (INTEGER)
    - `comments` (INTEGER)
    - `shares` (INTEGER)
    - `saves` (INTEGER)
    - `clicks` (INTEGER)
    - `conversions` (INTEGER)

### 5.4. 결제 서비스 (Payment Service)

- **Payments (결제)**
    - `payment_id` (PK, UUID)
    - `brand_id` (FK from Brand_Profiles)
    - `campaign_id` (FK from Campaigns)
    - `amount` (DECIMAL)
    - `method` (ENUM: 'CREDIT_CARD', 'BANK_TRANSFER')
    - `status` (ENUM: 'PENDING', 'SUCCESS', 'FAILED')
    - `transaction_id` (VARCHAR)
    - `created_at` (TIMESTAMP)

- **Payouts (정산)**
    - `payout_id` (PK, UUID)
    - `influencer_id` (FK from Influencer_Profiles)
    - `application_id` (FK from Campaign_Applications)
    - `amount` (DECIMAL) - (수수료 차감 후 금액)
    - `platform_fee` (DECIMAL)
    - `status` (ENUM: 'REQUESTED', 'PROCESSING', 'COMPLETED')
    - `completed_at` (TIMESTAMP)
