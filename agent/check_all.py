import os, psycopg2
os.environ['DATABASE_URL']='postgresql://neondb_owner:npg_laesRAW8Dui1@ep-plain-sound-aib5z9bz-pooler.c-4.us-east-1.aws.neon.tech/qanuni?sslmode=require'
conn=psycopg2.connect(os.environ['DATABASE_URL'])
c=conn.cursor()
for t in ['power_of_attorney','conflict_checks','document_templates','policies','practice_areas','trust_accounts','trust_transactions','client_communications','expenses']:
    c.execute("SELECT column_name FROM information_schema.columns WHERE table_name=%s ORDER BY ordinal_position",(t,))
    cols = [r[0] for r in c.fetchall()]
    print(f"{t}: {cols}")
conn.close()
