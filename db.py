import sqlite3
from datetime import date

def connect():
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATE DEFAULT CURRENT_DATE
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habit_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            date DATE,
            status INTEGER DEFAULT 1,
            FOREIGN KEY (habit_id) REFERENCES habits(id)
        )
    """)
    conn.commit()
    conn.close()

def add_habit(habit_name):
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO habits (name) VALUES (?)", (habit_name,))
    conn.commit()
    conn.close()

def get_habits():
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, created_at FROM habits")
    rows = cursor.fetchall()
    conn.close()
    return rows

def mark_progress(habit_id):
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    today = date.today().isoformat()
    cursor.execute("""
        INSERT INTO habit_progress (habit_id, date, status)
        VALUES (?, ?, 1)
    """, (habit_id, today))
    conn.commit()
    conn.close()

def get_progress_by_habit(habit_id):
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT date, COUNT(*) as done
        FROM habit_progress
        WHERE habit_id = ?
        GROUP BY date
        ORDER BY date ASC
    """, (habit_id,))
    rows = cursor.fetchall()
    conn.close()
    return rows

def delete_habit(habit_id):
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM habit_progress WHERE habit_id = ?", (habit_id,))
    cursor.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()

def update_habit_name(habit_id, new_name):
    conn = sqlite3.connect("habits.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE habits SET name = ? WHERE id = ?", (new_name, habit_id))
    conn.commit()
    conn.close()