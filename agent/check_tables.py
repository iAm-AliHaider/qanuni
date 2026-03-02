import os, psycopg2
os.environ['DATABASE_URL']='postgresql://neondb_owner:npg_laesRAW8Dui1@ep-plain-sound-aib5z9bz-pooler.c-4.us-east-1.aws.neon.tech/qanuni?sslmode=require'
conn=psycopg2.connect(os.environ['DATABASE_URL'])
c=conn.cursor()
# List all tables
c.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
tables = [r[0] for r in c.fetchall()]
print("ALL TABLES:", tables)
print()
for t in ['contracts','court_filings','trust_accounts','trust_transactions','retainer_agreements']:
    c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name=%s ORDER BY ordinal_position",(t,))
    cols = c.fetchall()
    if cols:
        print(f"\n{t}:")
        for col_name, dtype in cols:
            print(f"  {col_name} ({dtype})")
    else:
        print(f"\n{t}: NOT EXISTS")
conn.close()
