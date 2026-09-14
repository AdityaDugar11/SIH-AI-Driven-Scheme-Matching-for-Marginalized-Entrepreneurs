import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    # Create applications table
    c.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            scheme_id INTEGER NOT NULL,
            scheme_name TEXT NOT NULL,
            status TEXT DEFAULT 'APPLIED' NOT NULL,
            requested_amount NUMERIC,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
    ''')
    
    # Create saved schemes table
    c.execute('''
        CREATE TABLE IF NOT EXISTS saved_schemes (
            user_id TEXT NOT NULL,
            scheme_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (user_id, scheme_id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Application Functions
def apply_for_scheme(user_id, scheme_id, scheme_name, requested_amount=500000):
    conn = get_connection()
    c = conn.cursor()
    # Check if already applied
    c.execute('SELECT * FROM applications WHERE user_id = ? AND scheme_id = ?', (user_id, scheme_id))
    if c.fetchone():
        conn.close()
        raise ValueError("Already applied for this scheme")
        
    c.execute('''
        INSERT INTO applications (user_id, scheme_id, scheme_name, requested_amount)
        VALUES (?, ?, ?, ?)
    ''', (user_id, scheme_id, scheme_name, requested_amount))
    app_id = c.lastrowid
    conn.commit()
    
    c.execute('SELECT * FROM applications WHERE id = ?', (app_id,))
    new_app = dict(c.fetchone())
    conn.close()
    return new_app

def get_user_applications(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
    apps = [dict(row) for row in c.fetchall()]
    conn.close()
    return apps

# Saved Scheme Functions
def save_scheme(user_id, scheme_id):
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO saved_schemes (user_id, scheme_id) VALUES (?, ?)', (user_id, scheme_id))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # Already saved
    finally:
        conn.close()

def unsave_scheme(user_id, scheme_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('DELETE FROM saved_schemes WHERE user_id = ? AND scheme_id = ?', (user_id, scheme_id))
    conn.commit()
    conn.close()

def get_saved_schemes(user_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT scheme_id FROM saved_schemes WHERE user_id = ?', (user_id,))
    schemes = [row['scheme_id'] for row in c.fetchall()]
    conn.close()
    return schemes

# Initialize the database file when imported
init_db()
