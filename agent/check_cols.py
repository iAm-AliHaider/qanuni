import os, psycopg2
os.environ['DATABASE_URL']='postgresql://neondb_owner:npg_laesRAW8Dui1@ep-plain-sound-aib5z9bz-pooler.c-4.us-east-1.aws.neon.tech/qanuni?sslmode=require'
conn=psycopg2.connect(os.environ['DATABASE_URL'])
c=conn.cursor()
for t in ['retainer_agreements','invoices','payments','contacts']:
    c.execute("SELECT column_name FROM information_schema.columns WHERE table_name=%s ORDER BY ordinal_position",(t,))
    print(f"{t}: {[r[0] for r in c.fetchall()]}")
conn.close()
