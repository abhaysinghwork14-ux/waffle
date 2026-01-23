import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, text

load_dotenv(Path(__file__).parent / '.env')
DATABASE_URL = os.environ.get('DATABASE_URL')

engine = create_engine(DATABASE_URL)

# Grant full public access - no restrictions
sql_commands = """
-- Disable RLS completely for full access via dashboard
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to anon and authenticated roles
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON redemptions TO anon;
GRANT ALL ON redemptions TO authenticated;
GRANT ALL ON point_transactions TO anon;
GRANT ALL ON point_transactions TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
"""

with engine.connect() as conn:
    for cmd in sql_commands.strip().split(';'):
        cmd = cmd.strip()
        if cmd and not cmd.startswith('--'):
            try:
                conn.execute(text(cmd))
                print(f"✓ {cmd[:60]}...")
            except Exception as e:
                print(f"⚠ {str(e)[:60]}")
    conn.commit()
    print("\n✅ Full database control granted!")

