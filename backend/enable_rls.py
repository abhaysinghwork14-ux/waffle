import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, text

load_dotenv(Path(__file__).parent / '.env')
DATABASE_URL = os.environ.get('DATABASE_URL')

engine = create_engine(DATABASE_URL)

# SQL to enable RLS with full access policies
sql_commands = """
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for full access (for service role / authenticated users)
-- Users table
DROP POLICY IF EXISTS "Allow all access to users" ON users;
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Redemptions table
DROP POLICY IF EXISTS "Allow all access to redemptions" ON redemptions;
CREATE POLICY "Allow all access to redemptions" ON redemptions FOR ALL USING (true) WITH CHECK (true);

-- Point transactions table
DROP POLICY IF EXISTS "Allow all access to point_transactions" ON point_transactions;
CREATE POLICY "Allow all access to point_transactions" ON point_transactions FOR ALL USING (true) WITH CHECK (true);
"""

with engine.connect() as conn:
    for cmd in sql_commands.strip().split(';'):
        cmd = cmd.strip()
        if cmd:
            try:
                conn.execute(text(cmd))
                print(f"✓ Executed: {cmd[:50]}...")
            except Exception as e:
                print(f"Note: {e}")
    conn.commit()
    print("\n✅ RLS enabled with full access policies!")

