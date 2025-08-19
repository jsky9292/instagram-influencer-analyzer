# Influencer-Crawler

TikTok, Instagram, Shein, Youtube(미개발) 등에서 데이터를 수집하는 크롤러 프로젝트입니다.

---

## 📦 환경 세팅

본 프로젝트는 Python 3.10 이상에서 동작합니다.

### 1. Conda 환경 생성

아래 명령어로 새 conda 환경을 생성하세요.

```bash
conda create -n influencer-crawler python=3.10
```

### 2. 환경 활성화

```bash
conda activate influencer-crawler
```

### 3. 패키지 설치

```bash
pip install -r requirements.txt
```

### 4. 패키지 추가/변경 시

패키지를 새로 설치한 경우, 아래 명령어로 requirements.txt를 갱신하세요.

```bash
pip freeze > requirements.txt
```

---

## 🚀 실행 방법

1. 환경을 활성화한 상태에서 원하는 크롤러 폴더로 이동합니다.
2. 예시:
    ```bash
    cd TikTok
    python main.py
    ```

---

## 📄 참고

-   `requirements.txt` 파일에 설치 패키지와 버전이 정의되어 있습니다.
-   추가적인 라이브러리가 필요하다면 `requirements.txt`에 패키지를 추가한 뒤 패키지를 설치하거나 갱신하세요.

---

## 🔗 기타

기타 문의 및 기능 요청은 [Issues](https://github.com/LIMSONGJIN/Influencer-Crawler/issues)에 남겨주세요.
