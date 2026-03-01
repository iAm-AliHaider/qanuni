import os, psycopg2
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_laesRAW8Dui1@ep-plain-sound-aib5z9bz-pooler.c-4.us-east-1.aws.neon.tech/qanuni?sslmode=require'
conn = psycopg2.connect(os.environ['DATABASE_URL'])
c = conn.cursor()
c.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
tables = [r[0] for r in c.fetchall()]
print(f"{len(tables)} tables: {', '.join(tables)}")
for t in ['contacts','retainers','invoices','payments','documents','case_notes','case_parties','time_entries']:
    print(f"  {t}: {'YES' if t in tables else 'MISSING'}")
conn.close()
