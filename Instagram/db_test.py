import json
import psycopg2

def load_db_config(path='../db.config'):
    with open(path, 'r') as f:
        return json.load(f)

def test_db_connection():
    DB_CONFIG = load_db_config()
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            dbname=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        print("[DB] 연결 성공!")
        conn.close()
    except Exception as e:
        print("[DB] 연결 실패:", e)

if __name__ == "__main__":
    test_db_connection()