"""Qanuni — Law Firm Management Database Layer.

Neon Postgres with psycopg2. All functions return dicts.
"""

import os
import json
import logging
import psycopg2
import psycopg2.extras
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("qanuni-db")

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def get_db():
    """Get a new database connection."""
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def _fetchall(cursor):
    """Fetch all rows as list of dicts."""
    if cursor.description is None:
        return []
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


def _fetchone(cursor):
    """Fetch one row as dict."""
    if cursor.description is None:
        return None
    cols = [d[0] for d in cursor.description]
    row = cursor.fetchone()
    return dict(zip(cols, row)) if row else None


# ============================================================
# SCHEMA INITIALIZATION
# ============================================================

def init_db():
    """Create all tables and seed initial data."""
    conn = get_db()
    c = conn.cursor()

    # ── Users & Roles ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT,
        email TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'associate',
        department TEXT,
        bar_number TEXT,
        specializations TEXT,
        languages TEXT DEFAULT 'Arabic,English',
        pin TEXT DEFAULT '1234',
        hourly_rate REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Practice Areas ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS practice_areas (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        name_ar TEXT,
        description TEXT,
        head_user_id TEXT REFERENCES users(id),
        is_active INTEGER DEFAULT 1
    )""")

    # ── Clients ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        client_type TEXT DEFAULT 'individual',
        name TEXT NOT NULL,
        name_ar TEXT,
        email TEXT,
        phone TEXT,
        phone2 TEXT,
        address TEXT,
        address_ar TEXT,
        national_id TEXT,
        cr_number TEXT,
        vat_number TEXT,
        nationality TEXT DEFAULT 'Saudi',
        risk_level TEXT DEFAULT 'low',
        kyc_status TEXT DEFAULT 'pending',
        kyc_verified_at TEXT,
        kyc_verified_by TEXT,
        notes TEXT,
        tags TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT,
        created_by TEXT
    )""")

    # ── Cases ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        title TEXT NOT NULL,
        title_ar TEXT,
        case_type TEXT NOT NULL,
        practice_area TEXT,
        status TEXT DEFAULT 'intake',
        priority TEXT DEFAULT 'medium',
        client_id INTEGER REFERENCES clients(id),
        opposing_party TEXT,
        opposing_counsel TEXT,
        court TEXT,
        court_branch TEXT,
        judge TEXT,
        najiz_ref TEXT,
        case_value REAL DEFAULT 0,
        fee_type TEXT DEFAULT 'hourly',
        fee_amount REAL DEFAULT 0,
        description TEXT,
        description_ar TEXT,
        assigned_partner TEXT REFERENCES users(id),
        assigned_associate TEXT REFERENCES users(id),
        assigned_paralegal TEXT REFERENCES users(id),
        open_date TEXT DEFAULT CURRENT_DATE::TEXT,
        close_date TEXT,
        outcome TEXT,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT,
        created_by TEXT
    )""")

    # ── Case Parties ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS case_parties (
        id SERIAL PRIMARY KEY,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        party_type TEXT NOT NULL,
        name TEXT NOT NULL,
        name_ar TEXT,
        role TEXT,
        contact_info TEXT,
        national_id TEXT
    )""")

    # ── Case Notes ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS case_notes (
        id SERIAL PRIMARY KEY,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id),
        note TEXT NOT NULL,
        note_type TEXT DEFAULT 'general',
        is_confidential INTEGER DEFAULT 0,
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Courts ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT,
        court_type TEXT NOT NULL,
        city TEXT,
        address TEXT,
        phone TEXT,
        najiz_code TEXT
    )""")

    # ── Judges ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS judges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT,
        court_id INTEGER REFERENCES courts(id),
        specialization TEXT,
        notes TEXT
    )""")

    # ── Hearings ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS hearings (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        court_id INTEGER REFERENCES courts(id),
        judge_id INTEGER REFERENCES judges(id),
        hearing_date TEXT NOT NULL,
        hearing_time TEXT,
        hearing_type TEXT DEFAULT 'regular',
        location TEXT,
        najiz_session_ref TEXT,
        status TEXT DEFAULT 'scheduled',
        outcome TEXT,
        notes TEXT,
        attendees TEXT,
        next_hearing_date TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Deadlines ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS deadlines (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        deadline_date TEXT NOT NULL,
        deadline_type TEXT DEFAULT 'general',
        priority TEXT DEFAULT 'high',
        assigned_to TEXT REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        notes TEXT,
        days_before_alert INTEGER DEFAULT 3,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Documents ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        case_id INTEGER REFERENCES cases(id),
        client_id INTEGER REFERENCES clients(id),
        title TEXT NOT NULL,
        title_ar TEXT,
        doc_type TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        file_url TEXT,
        file_size INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        status TEXT DEFAULT 'draft',
        content TEXT,
        created_by TEXT REFERENCES users(id),
        reviewed_by TEXT REFERENCES users(id),
        approved_by TEXT REFERENCES users(id),
        created_at TEXT DEFAULT NOW()::TEXT,
        updated_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Document Templates ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS document_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT,
        template_type TEXT NOT NULL,
        practice_area TEXT,
        body_html TEXT,
        body_html_ar TEXT,
        variables TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Power of Attorney ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS power_of_attorney (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        case_id INTEGER REFERENCES cases(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        lawyer_id TEXT NOT NULL REFERENCES users(id),
        poa_type TEXT DEFAULT 'general',
        scope TEXT,
        court TEXT,
        issue_date TEXT DEFAULT CURRENT_DATE::TEXT,
        expiry_date TEXT,
        notary_ref TEXT,
        status TEXT DEFAULT 'active',
        document_url TEXT,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Time Entries ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES cases(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        entry_date TEXT DEFAULT CURRENT_DATE::TEXT,
        hours REAL NOT NULL,
        rate REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        description TEXT,
        activity_type TEXT DEFAULT 'legal_work',
        is_billable INTEGER DEFAULT 1,
        is_invoiced INTEGER DEFAULT 0,
        invoice_id INTEGER,
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Invoices ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        case_id INTEGER REFERENCES cases(id),
        invoice_date TEXT DEFAULT CURRENT_DATE::TEXT,
        due_date TEXT,
        subtotal REAL DEFAULT 0,
        vat_rate REAL DEFAULT 15.0,
        vat_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'draft',
        payment_status TEXT DEFAULT 'unpaid',
        zatca_uuid TEXT,
        zatca_hash TEXT,
        zatca_qr TEXT,
        zatca_xml TEXT,
        notes TEXT,
        created_by TEXT REFERENCES users(id),
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Invoice Line Items ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit_price REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        time_entry_id INTEGER REFERENCES time_entries(id)
    )""")

    # ── Payments ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        invoice_id INTEGER REFERENCES invoices(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        amount REAL NOT NULL,
        payment_date TEXT DEFAULT CURRENT_DATE::TEXT,
        payment_method TEXT DEFAULT 'bank_transfer',
        reference_number TEXT,
        notes TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Trust Accounts ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS trust_accounts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        case_id INTEGER REFERENCES cases(id),
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'SAR',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    c.execute("""
    CREATE TABLE IF NOT EXISTS trust_transactions (
        id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL REFERENCES trust_accounts(id),
        transaction_type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        reference TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Tasks ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        case_id INTEGER REFERENCES cases(id),
        title TEXT NOT NULL,
        description TEXT,
        assigned_to TEXT REFERENCES users(id),
        assigned_by TEXT REFERENCES users(id),
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'todo',
        due_date TEXT,
        completed_at TEXT,
        category TEXT DEFAULT 'general',
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Contacts (opposing counsel, experts, etc) ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT,
        contact_type TEXT NOT NULL,
        organization TEXT,
        phone TEXT,
        email TEXT,
        specialization TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Client Communications ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS client_communications (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        case_id INTEGER REFERENCES cases(id),
        user_id TEXT REFERENCES users(id),
        comm_type TEXT DEFAULT 'note',
        subject TEXT,
        body TEXT,
        direction TEXT DEFAULT 'outbound',
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Conflict Checks ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS conflict_checks (
        id SERIAL PRIMARY KEY,
        checked_name TEXT NOT NULL,
        checked_by TEXT REFERENCES users(id),
        result TEXT DEFAULT 'clear',
        conflicts_found TEXT,
        notes TEXT,
        checked_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Expenses ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE,
        case_id INTEGER REFERENCES cases(id),
        user_id TEXT REFERENCES users(id),
        category TEXT DEFAULT 'filing_fee',
        description TEXT,
        amount REAL NOT NULL,
        expense_date TEXT DEFAULT CURRENT_DATE::TEXT,
        receipt_url TEXT,
        is_billable INTEGER DEFAULT 1,
        is_invoiced INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        approved_by TEXT,
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Retainer Agreements ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS retainer_agreements (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        case_id INTEGER REFERENCES cases(id),
        agreement_type TEXT DEFAULT 'monthly',
        amount REAL NOT NULL,
        start_date TEXT,
        end_date TEXT,
        billing_day INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        document_url TEXT,
        created_at TEXT DEFAULT CURRENT_DATE::TEXT
    )""")

    # ── Audit Log ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT NOW()::TEXT
    )""")

    # ── Policies (JSONB config) ──
    c.execute("""
    CREATE TABLE IF NOT EXISTS policies (
        id SERIAL PRIMARY KEY,
        category TEXT UNIQUE NOT NULL,
        config JSONB DEFAULT '{}'::JSONB,
        updated_at TEXT DEFAULT NOW()::TEXT,
        updated_by TEXT
    )""")

    conn.commit()

    # ── Seed Data ──
    _seed_data(conn, c)

    conn.close()
    logger.info("Database initialized successfully")


def _seed_data(conn, c):
    """Seed initial data if tables are empty."""

    # Users
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        users = [
            ("U001", "Abdulrahman Al-Rashid", "عبدالرحمن الراشد", "managing_partner", "Management", "SA-1001", 1500, "1234"),
            ("U002", "Noura Al-Faisal", "نورة الفيصل", "senior_partner", "Litigation", "SA-1002", 1200, "1234"),
            ("U003", "Khalid Al-Otaibi", "خالد العتيبي", "partner", "Commercial", "SA-1003", 1000, "1234"),
            ("U004", "Fatima Al-Zahrani", "فاطمة الزهراني", "senior_associate", "Family Law", "SA-1004", 800, "1234"),
            ("U005", "Mohammed Al-Qahtani", "محمد القحطاني", "associate", "Criminal", "SA-1005", 500, "1234"),
            ("U006", "Sara Al-Dosari", "سارة الدوسري", "associate", "Labor Law", "SA-1006", 500, "1234"),
            ("U007", "Omar Al-Harbi", "عمر الحربي", "paralegal", "Litigation", None, 200, "1234"),
            ("U008", "Aisha Al-Mutairi", "عائشة المطيري", "legal_secretary", "Management", None, 0, "1234"),
            ("U009", "Youssef Al-Shehri", "يوسف الشهري", "finance", "Finance", None, 0, "1234"),
            ("U010", "Admin", "مدير النظام", "admin", "IT", None, 0, "0000"),
        ]
        for uid, name, name_ar, role, dept, bar_num, rate, pin in users:
            c.execute("""INSERT INTO users (id, name, name_ar, role, department, bar_number, hourly_rate, pin) 
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", (uid, name, name_ar, role, dept, bar_num, rate, pin))

    # Practice Areas
    c.execute("SELECT COUNT(*) FROM practice_areas")
    if c.fetchone()[0] == 0:
        areas = [
            ("Criminal Law", "القانون الجنائي", "U002"),
            ("Civil Litigation", "التقاضي المدني", "U002"),
            ("Commercial Law", "القانون التجاري", "U003"),
            ("Family Law", "قانون الأسرة", "U004"),
            ("Labor Law", "قانون العمل", "U006"),
            ("Real Estate", "العقارات", "U003"),
            ("Banking & Finance", "البنوك والتمويل", "U003"),
            ("Insurance", "التأمين", "U003"),
            ("Intellectual Property", "الملكية الفكرية", "U003"),
            ("Administrative Law", "القانون الإداري", "U002"),
            ("Arbitration", "التحكيم", "U001"),
        ]
        for name, name_ar, head in areas:
            c.execute("INSERT INTO practice_areas (name, name_ar, head_user_id) VALUES (%s,%s,%s)", (name, name_ar, head))

    # Courts
    c.execute("SELECT COUNT(*) FROM courts")
    if c.fetchone()[0] == 0:
        courts = [
            ("General Court - Riyadh", "المحكمة العامة - الرياض", "general", "Riyadh"),
            ("Criminal Court - Riyadh", "المحكمة الجزائية - الرياض", "criminal", "Riyadh"),
            ("Commercial Court - Riyadh", "المحكمة التجارية - الرياض", "commercial", "Riyadh"),
            ("Labor Court - Riyadh", "المحكمة العمالية - الرياض", "labor", "Riyadh"),
            ("Administrative Court - Riyadh", "المحكمة الإدارية - الرياض", "administrative", "Riyadh"),
            ("Court of Appeal - Riyadh", "محكمة الاستئناف - الرياض", "appeal", "Riyadh"),
            ("Supreme Court", "المحكمة العليا", "supreme", "Riyadh"),
            ("Family Court - Riyadh", "محكمة الأحوال الشخصية - الرياض", "family", "Riyadh"),
            ("General Court - Jeddah", "المحكمة العامة - جدة", "general", "Jeddah"),
            ("Commercial Court - Jeddah", "المحكمة التجارية - جدة", "commercial", "Jeddah"),
        ]
        for name, name_ar, ctype, city in courts:
            c.execute("INSERT INTO courts (name, name_ar, court_type, city) VALUES (%s,%s,%s,%s)", (name, name_ar, ctype, city))

    # Judges
    c.execute("SELECT COUNT(*) FROM judges")
    if c.fetchone()[0] == 0:
        judges = [
            ("Judge Abdullah Al-Malik", "القاضي عبدالله المالك", 1, "General"),
            ("Judge Saud Al-Tamimi", "القاضي سعود التميمي", 3, "Commercial"),
            ("Judge Nasser Al-Dawsari", "القاضي ناصر الدوسري", 2, "Criminal"),
            ("Judge Ibrahim Al-Ghamdi", "القاضي إبراهيم الغامدي", 4, "Labor"),
            ("Judge Majed Al-Anazi", "القاضي ماجد العنزي", 8, "Family"),
        ]
        for name, name_ar, court_id, spec in judges:
            c.execute("INSERT INTO judges (name, name_ar, court_id, specialization) VALUES (%s,%s,%s,%s)", (name, name_ar, court_id, spec))

    # Sample Clients
    c.execute("SELECT COUNT(*) FROM clients")
    if c.fetchone()[0] == 0:
        clients = [
            ("CLT-001", "individual", "Mohammed Al-Otaibi", "محمد العتيبي", "0501234567", "1087654321", None, "Saudi", "verified"),
            ("CLT-002", "corporate", "Saudi Mining Corporation", "شركة التعدين السعودية", "0112345678", None, "4030012345", "Saudi", "verified"),
            ("CLT-003", "individual", "Layla Al-Ahmad", "ليلى الأحمد", "0559876543", "1098765432", None, "Saudi", "pending"),
            ("CLT-004", "corporate", "Al-Rajhi Trading Group", "مجموعة الراجحي التجارية", "0118765432", None, "4030054321", "Saudi", "verified"),
            ("CLT-005", "individual", "Ahmed Hassan", "أحمد حسن", "0567891234", "2398765432", None, "Egyptian", "verified"),
        ]
        for ref, ctype, name, name_ar, phone, nid, vat, nat, kyc in clients:
            c.execute("""INSERT INTO clients (ref, client_type, name, name_ar, phone, national_id, vat_number, nationality, kyc_status) 
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", (ref, ctype, name, name_ar, phone, nid, vat, nat, kyc))

    # Sample Cases
    c.execute("SELECT COUNT(*) FROM cases")
    if c.fetchone()[0] == 0:
        cases = [
            ("2024-COM-001", "Saudi Mining Corp v. Al-Rajhi Trading", "شركة التعدين السعودية ضد مجموعة الراجحي التجارية", "commercial", "Commercial Law", "active", "high", 2, "Al-Rajhi Trading Group", "Adv. Hassan Mahmoud", "Commercial Court - Riyadh", "Judge Saud Al-Tamimi", None, 5000000, "hourly", 0, "U003", "U005"),
            ("2024-CRM-001", "Public Prosecution v. Ahmed Hassan", "النيابة العامة ضد أحمد حسن", "criminal", "Criminal Law", "active", "critical", 5, "Public Prosecution", "Public Prosecutor", "Criminal Court - Riyadh", "Judge Nasser Al-Dawsari", None, 0, "flat_fee", 50000, "U002", "U005"),
            ("2024-FAM-001", "Al-Otaibi Custody Case", "قضية حضانة العتيبي", "family", "Family Law", "active", "medium", 1, "Maha Al-Otaibi", "Adv. Reem Al-Saud", "Family Court - Riyadh", "Judge Majed Al-Anazi", None, 0, "flat_fee", 30000, "U004", None),
            ("2024-LAB-001", "Employee Wrongful Termination", "فصل تعسفي للموظف", "labor", "Labor Law", "intake", "medium", 3, "InfoTech Solutions", None, None, None, None, 250000, "contingency", 25, "U006", None),
            ("2024-RE-001", "Land Dispute - North Riyadh", "نزاع أراضي - شمال الرياض", "real_estate", "Real Estate", "active", "high", 1, "Ministry of Housing", None, "General Court - Riyadh", "Judge Abdullah Al-Malik", None, 3000000, "hourly", 0, "U003", "U006"),
        ]
        for ref, title, title_ar, ctype, area, status, priority, client_id, opposing, opp_counsel, court, judge, najiz, value, fee_type, fee_amount, partner, associate in cases:
            c.execute("""INSERT INTO cases (ref, title, title_ar, case_type, practice_area, status, priority, client_id, opposing_party, opposing_counsel, court, judge, najiz_ref, case_value, fee_type, fee_amount, assigned_partner, assigned_associate)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (ref, title, title_ar, ctype, area, status, priority, client_id, opposing, opp_counsel, court, judge, najiz, value, fee_type, fee_amount, partner, associate))

    # Sample Hearings
    c.execute("SELECT COUNT(*) FROM hearings")
    if c.fetchone()[0] == 0:
        hearings = [
            ("HRG-001", 1, 3, 2, "2026-03-10", "09:00", "oral_argument", "scheduled", "U003,U005"),
            ("HRG-002", 2, 2, 3, "2026-03-12", "10:30", "witness_examination", "scheduled", "U002,U005"),
            ("HRG-003", 3, 8, 5, "2026-03-15", "11:00", "mediation", "scheduled", "U004"),
            ("HRG-004", 1, 3, 2, "2026-03-25", "09:00", "judgment", "scheduled", "U003,U005"),
        ]
        for ref, case_id, court_id, judge_id, date, time, htype, status, attendees in hearings:
            c.execute("""INSERT INTO hearings (ref, case_id, court_id, judge_id, hearing_date, hearing_time, hearing_type, status, attendees)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", (ref, case_id, court_id, judge_id, date, time, htype, status, attendees))

    # Sample Tasks
    c.execute("SELECT COUNT(*) FROM tasks")
    if c.fetchone()[0] == 0:
        tasks = [
            ("TSK-001", 1, "Prepare witness statements", "U005", "U003", "high", "in_progress", "2026-03-08", "litigation"),
            ("TSK-002", 1, "File motion for discovery", "U007", "U003", "critical", "todo", "2026-03-05", "filing"),
            ("TSK-003", 2, "Review evidence bundle", "U005", "U002", "high", "todo", "2026-03-10", "review"),
            ("TSK-004", 3, "Draft custody agreement proposal", "U004", "U004", "medium", "in_progress", "2026-03-12", "drafting"),
            ("TSK-005", 4, "Calculate end of service benefits", "U006", "U006", "medium", "todo", "2026-03-15", "research"),
        ]
        for ref, case_id, title, assigned_to, assigned_by, priority, status, due, category in tasks:
            c.execute("""INSERT INTO tasks (ref, case_id, title, assigned_to, assigned_by, priority, status, due_date, category)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", (ref, case_id, title, assigned_to, assigned_by, priority, status, due, category))

    # Deadlines
    c.execute("SELECT COUNT(*) FROM deadlines")
    if c.fetchone()[0] == 0:
        deadlines = [
            (1, "Appeal filing deadline", "2026-03-20", "statute", "critical", "U003"),
            (2, "Evidence submission", "2026-03-09", "court_order", "high", "U005"),
            (4, "Claim filing deadline", "2026-03-30", "statute", "high", "U006"),
        ]
        for case_id, title, date, dtype, priority, assigned in deadlines:
            c.execute("INSERT INTO deadlines (case_id, title, deadline_date, deadline_type, priority, assigned_to) VALUES (%s,%s,%s,%s,%s,%s)",
                (case_id, title, date, dtype, priority, assigned))

    # Sample Time Entries
    c.execute("SELECT COUNT(*) FROM time_entries")
    if c.fetchone()[0] == 0:
        entries = [
            (1, "U003", "2026-03-01", 3.5, 1000, "Contract review and analysis", "legal_work"),
            (1, "U005", "2026-03-01", 5.0, 500, "Research on commercial court precedents", "research"),
            (2, "U002", "2026-03-01", 2.0, 1200, "Client meeting - case strategy", "meeting"),
            (2, "U005", "2026-03-02", 4.0, 500, "Evidence review and cataloging", "legal_work"),
            (3, "U004", "2026-03-02", 3.0, 800, "Draft custody proposal", "drafting"),
        ]
        for case_id, user_id, date, hours, rate, desc, atype in entries:
            c.execute("""INSERT INTO time_entries (case_id, user_id, entry_date, hours, rate, amount, description, activity_type)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", (case_id, user_id, date, hours, rate, hours * rate, desc, atype))

    # Policies
    c.execute("SELECT COUNT(*) FROM policies")
    if c.fetchone()[0] == 0:
        policies = {
            "firm": {"name_en": "Al-Rashid & Partners Law Firm", "name_ar": "مكتب الراشد وشركاؤه للمحاماة", "cr_number": "", "vat_number": "", "address_en": "King Fahd Road, Riyadh", "address_ar": "طريق الملك فهد، الرياض", "phone": "+966112345678", "email": "info@alrashidlaw.com.sa"},
            "billing": {"default_vat_rate": 15.0, "payment_terms_days": 30, "currency": "SAR", "trust_account_required": True, "minimum_billable_increment": 0.25},
            "compliance": {"kyc_required": True, "conflict_check_required": True, "aml_screening": True, "pdpl_compliance": True},
            "deadlines": {"appeal_period_days": 30, "objection_period_days": 15, "statute_of_limitations_check": True},
        }
        for cat, config in policies.items():
            c.execute("INSERT INTO policies (category, config) VALUES (%s, %s::JSONB)", (cat, json.dumps(config)))

    conn.commit()


# ============================================================
# QUERY FUNCTIONS
# ============================================================

# ── Users ──

def get_user(user_id):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    row = _fetchone(c)
    conn.close()
    return row

def get_all_users(active_only=True):
    conn = get_db()
    c = conn.cursor()
    if active_only:
        c.execute("SELECT * FROM users WHERE is_active = 1 ORDER BY role, name")
    else:
        c.execute("SELECT * FROM users ORDER BY role, name")
    rows = _fetchall(c)
    conn.close()
    return rows

def authenticate_user(user_id, pin):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = %s AND pin = %s AND is_active = 1", (user_id, pin))
    row = _fetchone(c)
    conn.close()
    return row

def is_partner(user_id):
    user = get_user(user_id)
    return user and user.get("role") in ("managing_partner", "senior_partner", "partner")


# ── Cases ──

def get_cases(user_id=None, status=None, case_type=None, limit=50):
    conn = get_db()
    c = conn.cursor()
    query = """SELECT cs.*, cl.name as client_name, cl.name_ar as client_name_ar,
        u1.name as partner_name, u2.name as associate_name
        FROM cases cs 
        LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id
        LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        WHERE 1=1"""
    params = []
    if user_id:
        query += " AND (cs.assigned_partner = %s OR cs.assigned_associate = %s OR cs.assigned_paralegal = %s)"
        params.extend([user_id, user_id, user_id])
    if status:
        query += " AND cs.status = %s"
        params.append(status)
    if case_type:
        query += " AND cs.case_type = %s"
        params.append(case_type)
    query += f" ORDER BY cs.created_at DESC LIMIT {limit}"
    c.execute(query, params)
    rows = _fetchall(c)
    conn.close()
    return rows

def get_case(case_id=None, ref=None):
    conn = get_db()
    c = conn.cursor()
    if ref:
        c.execute("""SELECT cs.*, cl.name as client_name, cl.name_ar as client_name_ar, cl.phone as client_phone,
            u1.name as partner_name, u2.name as associate_name
            FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
            LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
            WHERE cs.ref = %s""", (ref,))
    else:
        c.execute("""SELECT cs.*, cl.name as client_name, cl.name_ar as client_name_ar, cl.phone as client_phone,
            u1.name as partner_name, u2.name as associate_name
            FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
            LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
            WHERE cs.id = %s""", (case_id,))
    row = _fetchone(c)
    conn.close()
    return row

def create_case(title, case_type, practice_area, client_id, priority="medium", fee_type="hourly", fee_amount=0, assigned_partner=None, description=None):
    conn = get_db()
    c = conn.cursor()
    type_prefix = {"criminal": "CRM", "civil": "CIV", "commercial": "COM", "family": "FAM", "labor": "LAB", "real_estate": "RE", "banking": "BNK", "insurance": "INS", "ip": "IP", "administrative": "ADM", "arbitration": "ARB"}.get(case_type, "GEN")
    c.execute("INSERT INTO cases (ref, title, case_type, practice_area, client_id, priority, fee_type, fee_amount, assigned_partner, description) VALUES (gen_random_uuid()::TEXT, %s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (title, case_type, practice_area, client_id, priority, fee_type, fee_amount, assigned_partner, description))
    case_id = c.fetchone()[0]
    import datetime
    year = datetime.datetime.now().year
    ref = f"{year}-{type_prefix}-{case_id:03d}"
    c.execute("UPDATE cases SET ref = %s WHERE id = %s", (ref, case_id))
    conn.commit()
    conn.close()
    return {"id": case_id, "ref": ref}

def update_case_status(case_id, status, outcome=None):
    conn = get_db()
    c = conn.cursor()
    if outcome:
        c.execute("UPDATE cases SET status = %s, outcome = %s, close_date = CASE WHEN %s IN ('closed','archived') THEN CURRENT_DATE::TEXT ELSE close_date END WHERE id = %s", (status, outcome, status, case_id))
    else:
        c.execute("UPDATE cases SET status = %s, close_date = CASE WHEN %s IN ('closed','archived') THEN CURRENT_DATE::TEXT ELSE close_date END WHERE id = %s", (status, status, case_id))
    conn.commit()
    conn.close()


# ── Clients ──

def get_clients(active_only=True, limit=50):
    conn = get_db()
    c = conn.cursor()
    query = "SELECT cl.*, (SELECT COUNT(*) FROM cases WHERE client_id = cl.id) as case_count FROM clients cl"
    if active_only:
        query += " WHERE cl.is_active = 1"
    query += f" ORDER BY cl.name LIMIT {limit}"
    c.execute(query)
    rows = _fetchall(c)
    conn.close()
    return rows

def get_client(client_id=None, ref=None):
    conn = get_db()
    c = conn.cursor()
    if ref:
        c.execute("SELECT * FROM clients WHERE ref = %s", (ref,))
    else:
        c.execute("SELECT * FROM clients WHERE id = %s", (client_id,))
    row = _fetchone(c)
    conn.close()
    return row

def create_client(name, client_type="individual", phone=None, email=None, national_id=None, cr_number=None, name_ar=None, created_by=None):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO clients (ref, client_type, name, name_ar, phone, email, national_id, cr_number, created_by) VALUES (gen_random_uuid()::TEXT, %s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (client_type, name, name_ar, phone, email, national_id, cr_number, created_by))
    cid = c.fetchone()[0]
    ref = f"CLT-{cid:03d}"
    c.execute("UPDATE clients SET ref = %s WHERE id = %s", (ref, cid))
    conn.commit()
    conn.close()
    return {"id": cid, "ref": ref}


# ── Hearings ──

def get_hearings(case_id=None, user_id=None, upcoming_only=True, limit=20):
    conn = get_db()
    c = conn.cursor()
    query = """SELECT h.*, cs.ref as case_ref, cs.title as case_title, ct.name as court_name, j.name as judge_name
        FROM hearings h
        JOIN cases cs ON h.case_id = cs.id
        LEFT JOIN courts ct ON h.court_id = ct.id
        LEFT JOIN judges j ON h.judge_id = j.id WHERE 1=1"""
    params = []
    if case_id:
        query += " AND h.case_id = %s"
        params.append(case_id)
    if user_id:
        query += " AND (h.attendees LIKE %s OR cs.assigned_partner = %s OR cs.assigned_associate = %s)"
        params.extend([f"%{user_id}%", user_id, user_id])
    if upcoming_only:
        query += " AND h.hearing_date >= CURRENT_DATE::TEXT AND h.status = 'scheduled'"
    query += f" ORDER BY h.hearing_date, h.hearing_time LIMIT {limit}"
    c.execute(query, params)
    rows = _fetchall(c)
    conn.close()
    return rows

def create_hearing(case_id, hearing_date, hearing_time=None, court_id=None, judge_id=None, hearing_type="regular", created_by=None):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO hearings (ref, case_id, hearing_date, hearing_time, court_id, judge_id, hearing_type, created_by) VALUES (gen_random_uuid()::TEXT, %s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (case_id, hearing_date, hearing_time, court_id, judge_id, hearing_type, created_by))
    hid = c.fetchone()[0]
    ref = f"HRG-{hid:03d}"
    c.execute("UPDATE hearings SET ref = %s WHERE id = %s", (ref, hid))
    conn.commit()
    conn.close()
    return {"id": hid, "ref": ref}


# ── Tasks ──

def get_tasks(user_id=None, case_id=None, status=None, limit=30):
    conn = get_db()
    c = conn.cursor()
    query = """SELECT t.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name
        FROM tasks t LEFT JOIN cases cs ON t.case_id = cs.id LEFT JOIN users u ON t.assigned_to = u.id WHERE 1=1"""
    params = []
    if user_id:
        query += " AND t.assigned_to = %s"
        params.append(user_id)
    if case_id:
        query += " AND t.case_id = %s"
        params.append(case_id)
    if status:
        query += " AND t.status = %s"
        params.append(status)
    query += f" ORDER BY CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.due_date LIMIT {limit}"
    c.execute(query, params)
    rows = _fetchall(c)
    conn.close()
    return rows

def create_task(title, case_id=None, assigned_to=None, assigned_by=None, priority="medium", due_date=None, category="general", description=None):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO tasks (ref, case_id, title, description, assigned_to, assigned_by, priority, due_date, category) VALUES (gen_random_uuid()::TEXT, %s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (case_id, title, description, assigned_to, assigned_by, priority, due_date, category))
    tid = c.fetchone()[0]
    ref = f"TSK-{tid:03d}"
    c.execute("UPDATE tasks SET ref = %s WHERE id = %s", (ref, tid))
    conn.commit()
    conn.close()
    return {"id": tid, "ref": ref}

def update_task_status(task_id, status):
    conn = get_db()
    c = conn.cursor()
    completed = "NOW()::TEXT" if status == "completed" else "NULL"
    c.execute(f"UPDATE tasks SET status = %s, completed_at = {completed} WHERE id = %s", (status, task_id))
    conn.commit()
    conn.close()


# ── Time Entries ──

def log_time(case_id, user_id, hours, description, activity_type="legal_work", is_billable=True):
    conn = get_db()
    c = conn.cursor()
    user = get_user(user_id)
    rate = user.get("hourly_rate", 0) if user else 0
    amount = hours * rate
    c.execute("""INSERT INTO time_entries (case_id, user_id, hours, rate, amount, description, activity_type, is_billable)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
        (case_id, user_id, hours, rate, amount, description, activity_type, 1 if is_billable else 0))
    eid = c.fetchone()[0]
    conn.commit()
    conn.close()
    return {"id": eid, "hours": hours, "rate": rate, "amount": amount}

def get_time_entries(case_id=None, user_id=None, limit=50):
    conn = get_db()
    c = conn.cursor()
    query = """SELECT te.*, u.name as user_name, cs.ref as case_ref, cs.title as case_title
        FROM time_entries te JOIN users u ON te.user_id = u.id
        LEFT JOIN cases cs ON te.case_id = cs.id WHERE 1=1"""
    params = []
    if case_id:
        query += " AND te.case_id = %s"
        params.append(case_id)
    if user_id:
        query += " AND te.user_id = %s"
        params.append(user_id)
    query += f" ORDER BY te.entry_date DESC, te.id DESC LIMIT {limit}"
    c.execute(query, params)
    rows = _fetchall(c)
    conn.close()
    return rows

def get_billable_summary(user_id=None, month=None):
    conn = get_db()
    c = conn.cursor()
    query = "SELECT SUM(hours) as total_hours, SUM(amount) as total_amount, SUM(CASE WHEN is_billable=1 THEN hours ELSE 0 END) as billable_hours, SUM(CASE WHEN is_billable=1 THEN amount ELSE 0 END) as billable_amount FROM time_entries WHERE 1=1"
    params = []
    if user_id:
        query += " AND user_id = %s"
        params.append(user_id)
    if month:
        query += " AND entry_date LIKE %s"
        params.append(f"{month}%")
    c.execute(query, params)
    row = _fetchone(c)
    conn.close()
    return row or {"total_hours": 0, "total_amount": 0, "billable_hours": 0, "billable_amount": 0}


# ── Deadlines ──

def get_deadlines(user_id=None, case_id=None, upcoming_only=True, limit=20):
    conn = get_db()
    c = conn.cursor()
    query = """SELECT d.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name
        FROM deadlines d LEFT JOIN cases cs ON d.case_id = cs.id LEFT JOIN users u ON d.assigned_to = u.id WHERE 1=1"""
    params = []
    if user_id:
        query += " AND d.assigned_to = %s"
        params.append(user_id)
    if case_id:
        query += " AND d.case_id = %s"
        params.append(case_id)
    if upcoming_only:
        query += " AND d.deadline_date >= CURRENT_DATE::TEXT AND d.status = 'pending'"
    query += f" ORDER BY d.deadline_date LIMIT {limit}"
    c.execute(query, params)
    rows = _fetchall(c)
    conn.close()
    return rows


# ── Documents ──

def get_documents(case_id=None, client_id=None, doc_type=None, limit=30):
    conn = get_db()
    c = conn.cursor()
    query = """SELECT d.*, u.name as created_by_name FROM documents d LEFT JOIN users u ON d.created_by = u.id WHERE 1=1"""
    params = []
    if case_id:
        query += " AND d.case_id = %s"
        params.append(case_id)
    if client_id:
        query += " AND d.client_id = %s"
        params.append(client_id)
    if doc_type:
        query += " AND d.doc_type = %s"
        params.append(doc_type)
    query += f" ORDER BY d.created_at DESC LIMIT {limit}"
    c.execute(query, params)
    rows = _fetchall(c)
    conn.close()
    return rows


# ── Conflict Check ──

def check_conflicts(name):
    """Check if a name conflicts with existing clients or opposing parties."""
    conn = get_db()
    c = conn.cursor()
    search = f"%{name}%"
    c.execute("SELECT id, ref, name, name_ar FROM clients WHERE name ILIKE %s OR name_ar ILIKE %s", (search, search))
    client_matches = _fetchall(c)
    c.execute("SELECT id, ref, title, opposing_party FROM cases WHERE opposing_party ILIKE %s", (search,))
    case_matches = _fetchall(c)
    conn.close()
    conflicts = []
    if client_matches:
        conflicts.extend([{"type": "existing_client", "ref": m["ref"], "name": m["name"]} for m in client_matches])
    if case_matches:
        conflicts.extend([{"type": "opposing_party", "ref": m["ref"], "case": m["title"], "party": m["opposing_party"]} for m in case_matches])
    return {"name": name, "has_conflicts": len(conflicts) > 0, "conflicts": conflicts}


# ── Dashboard Stats ──

def get_dashboard_stats(user_id=None):
    conn = get_db()
    c = conn.cursor()
    
    # Active cases
    if user_id:
        c.execute("SELECT COUNT(*) FROM cases WHERE status NOT IN ('closed','archived') AND (assigned_partner=%s OR assigned_associate=%s OR assigned_paralegal=%s)", (user_id, user_id, user_id))
    else:
        c.execute("SELECT COUNT(*) FROM cases WHERE status NOT IN ('closed','archived')")
    active_cases = c.fetchone()[0]
    
    # Upcoming hearings (next 7 days)
    c.execute("SELECT COUNT(*) FROM hearings WHERE hearing_date BETWEEN CURRENT_DATE::TEXT AND (CURRENT_DATE + 7)::TEXT AND status='scheduled'")
    upcoming_hearings = c.fetchone()[0]
    
    # Pending tasks
    if user_id:
        c.execute("SELECT COUNT(*) FROM tasks WHERE assigned_to=%s AND status IN ('todo','in_progress')", (user_id,))
    else:
        c.execute("SELECT COUNT(*) FROM tasks WHERE status IN ('todo','in_progress')")
    pending_tasks = c.fetchone()[0]
    
    # Overdue deadlines
    c.execute("SELECT COUNT(*) FROM deadlines WHERE deadline_date < CURRENT_DATE::TEXT AND status='pending'")
    overdue_deadlines = c.fetchone()[0]
    
    # Total clients
    c.execute("SELECT COUNT(*) FROM clients WHERE is_active=1")
    total_clients = c.fetchone()[0]
    
    # Billable hours this month
    c.execute("SELECT COALESCE(SUM(hours),0), COALESCE(SUM(amount),0) FROM time_entries WHERE entry_date >= date_trunc('month', CURRENT_DATE)::TEXT AND is_billable=1")
    billing = c.fetchone()
    
    # Cases by type
    c.execute("SELECT case_type, COUNT(*) as count FROM cases WHERE status NOT IN ('closed','archived') GROUP BY case_type ORDER BY count DESC")
    cases_by_type = _fetchall(c)
    
    conn.close()
    return {
        "active_cases": active_cases,
        "upcoming_hearings": upcoming_hearings,
        "pending_tasks": pending_tasks,
        "overdue_deadlines": overdue_deadlines,
        "total_clients": total_clients,
        "billable_hours_month": billing[0],
        "billable_amount_month": billing[1],
        "cases_by_type": cases_by_type,
    }


# ── Policy helpers ──

_policy_cache = {}
_policy_cache_time = 0

def get_policy(path):
    """Get a policy value by dot-path, e.g. 'billing.default_vat_rate'."""
    import time
    global _policy_cache, _policy_cache_time
    if time.time() - _policy_cache_time > 60:
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT category, config FROM policies")
        _policy_cache = {r[0]: r[1] if isinstance(r[1], dict) else json.loads(r[1]) for r in c.fetchall()}
        _policy_cache_time = time.time()
        conn.close()
    parts = path.split(".")
    val = _policy_cache
    for p in parts:
        if isinstance(val, dict):
            val = val.get(p)
        else:
            return None
    return val


# ── Audit ──

def log_audit(user_id, action, entity_type=None, entity_id=None, details=None):
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute("INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES (%s,%s,%s,%s,%s)",
            (user_id, action, entity_type, str(entity_id) if entity_id else None, details))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Audit log error: {e}")


# Init on import
try:
    init_db()
    logger.info("Qanuni DB initialized")
except Exception as e:
    logger.error(f"DB init error: {e}")
