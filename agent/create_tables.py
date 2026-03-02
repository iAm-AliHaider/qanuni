import os, psycopg2
os.environ['DATABASE_URL']='postgresql://neondb_owner:npg_laesRAW8Dui1@ep-plain-sound-aib5z9bz-pooler.c-4.us-east-1.aws.neon.tech/qanuni?sslmode=require'
conn=psycopg2.connect(os.environ['DATABASE_URL'])
c=conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    ref TEXT UNIQUE,
    client_id INTEGER REFERENCES clients(id),
    case_id INTEGER REFERENCES cases(id),
    title TEXT NOT NULL,
    title_ar TEXT,
    contract_type TEXT DEFAULT 'service',
    status TEXT DEFAULT 'draft',
    start_date TEXT,
    end_date TEXT,
    value REAL DEFAULT 0,
    currency TEXT DEFAULT 'SAR',
    terms TEXT,
    obligations TEXT,
    renewal_type TEXT DEFAULT 'none',
    renewal_date TEXT,
    signed_by_client INTEGER DEFAULT 0,
    signed_by_firm INTEGER DEFAULT 0,
    document_url TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS court_filings (
    id SERIAL PRIMARY KEY,
    ref TEXT UNIQUE,
    case_id INTEGER REFERENCES cases(id),
    filing_type TEXT NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    court_id INTEGER REFERENCES courts(id),
    najiz_ref TEXT,
    filing_date TEXT,
    deadline_date TEXT,
    status TEXT DEFAULT 'pending',
    filed_by TEXT,
    document_url TEXT,
    notes TEXT,
    response_required INTEGER DEFAULT 0,
    response_deadline TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# Seed some contracts
c.execute("""
INSERT INTO contracts (ref, client_id, case_id, title, contract_type, status, start_date, end_date, value, terms, created_by)
VALUES 
('CTR-2026-001', 1, 1, 'Legal Representation Agreement - Al-Rashid Corp', 'retainer', 'active', '2026-01-01', '2026-12-31', 50000, 'Monthly retainer for general legal counsel', 'U001'),
('CTR-2026-002', 2, 2, 'Litigation Services - Ibrahim Holdings', 'litigation', 'active', '2026-02-01', '2027-02-01', 75000, 'Flat fee for commercial dispute resolution', 'U002'),
('CTR-2026-003', 3, NULL, 'Advisory Services - Saudi Tech Ventures', 'advisory', 'draft', '2026-03-01', '2026-09-01', 30000, 'IP advisory and trademark registration', 'U003')
ON CONFLICT DO NOTHING
""")

# Seed some court filings
c.execute("""
INSERT INTO court_filings (ref, case_id, filing_type, title, court_id, najiz_ref, filing_date, deadline_date, status, filed_by, response_required, response_deadline)
VALUES
('FIL-2026-001', 1, 'statement_of_claim', 'Initial Statement of Claim', 1, 'NJZ-2026-44521', '2026-01-15', '2026-02-15', 'filed', 'U002', 1, '2026-03-01'),
('FIL-2026-002', 1, 'evidence', 'Supporting Evidence Bundle', 1, 'NJZ-2026-44522', '2026-02-01', NULL, 'filed', 'U002', 0, NULL),
('FIL-2026-003', 2, 'defense', 'Statement of Defense', 3, 'NJZ-2026-55101', '2026-02-20', '2026-03-20', 'pending', 'U004', 1, '2026-04-05'),
('FIL-2026-004', 3, 'petition', 'Trademark Registration Petition', 5, NULL, NULL, '2026-03-15', 'draft', 'U003', 0, NULL)
ON CONFLICT DO NOTHING
""")

conn.commit()
conn.close()
print("TABLES + SEED OK")
