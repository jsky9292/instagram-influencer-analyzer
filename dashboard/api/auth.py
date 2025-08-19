#!/usr/bin/env python3
"""
사용자 인증 시스템
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sqlite3
import json
from pathlib import Path

# JWT 설정
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 패스워드 암호화
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token
security = HTTPBearer()

# 데이터베이스 경로
DB_PATH = Path(__file__).parent / "users.db"

class UserSignup(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_info: dict

class TokenData(BaseModel):
    username: Optional[str] = None

def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            full_name TEXT,
            hashed_password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            usage_count INTEGER DEFAULT 0,
            saved_searches TEXT,
            saved_influencers TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def verify_password(plain_password, hashed_password):
    """패스워드 검증"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """패스워드 해시화"""
    return pwd_context.hash(password)

def get_user(username: str):
    """사용자 조회"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
    return None

def authenticate_user(username: str, password: str):
    """사용자 인증"""
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user['hashed_password']):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """현재 사용자 확인"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def create_user(user_data: UserSignup):
    """새 사용자 생성"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 이메일/사용자명 중복 확인
    cursor.execute("SELECT id FROM users WHERE email = ? OR username = ?", 
                   (user_data.email, user_data.username))
    if cursor.fetchone():
        conn.close()
        return None
    
    # 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    cursor.execute('''
        INSERT INTO users (email, username, full_name, hashed_password)
        VALUES (?, ?, ?, ?)
    ''', (user_data.email, user_data.username, user_data.full_name, hashed_password))
    
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    return {
        'id': user_id,
        'email': user_data.email,
        'username': user_data.username,
        'full_name': user_data.full_name
    }

def update_last_login(username: str):
    """마지막 로그인 시간 업데이트"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, usage_count = usage_count + 1
        WHERE username = ?
    ''', (username,))
    
    conn.commit()
    conn.close()

def save_user_data(username: str, data_type: str, data: any):
    """사용자 데이터 저장 (검색 기록, 저장한 인플루언서 등)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if data_type == 'search':
        cursor.execute('''
            UPDATE users 
            SET saved_searches = ?
            WHERE username = ?
        ''', (json.dumps(data), username))
    elif data_type == 'influencer':
        cursor.execute('''
            UPDATE users 
            SET saved_influencers = ?
            WHERE username = ?
        ''', (json.dumps(data), username))
    
    conn.commit()
    conn.close()

# 데이터베이스 초기화
init_database()