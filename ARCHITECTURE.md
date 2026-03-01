# Qanuni (قانوني) — Voice-First Law Firm Management Platform

## Overview
Complete law firm automation for a large Saudi full-service firm migrating from paper.
Voice-first AI assistant + modern law-focused UI.

## Stack
- **Agent**: LiveKit Agents v1.4.3 + Deepgram Nova-3 (STT) + GPT-4o-mini (LLM) + Kokoro TTS
- **Frontend**: Next.js 15 + Tailwind CSS (light theme, emerald/slate accents)
- **Database**: Neon Postgres (serverless)
- **Auth**: PIN login per user (same pattern as Taliq)
- **Deploy**: Vercel (frontend) + LiveKit Cloud (agent)

## User Roles & Hierarchy
1. **Managing Partner** — full access, firm-wide analytics, financials
2. **Senior Partner** — department head, case assignment, billing approval
3. **Partner** — own cases, team oversight
4. **Senior Associate** — case management, court appearances
5. **Associate** — case work, research, drafting
6. **Paralegal** — document prep, filing, calendar management
7. **Legal Secretary** — scheduling, client comms, admin tasks
8. **Finance/Accounting** — billing, invoicing, trust accounts
9. **Admin** — system configuration, user management

## Modules (18 total)

### 1. Dashboard
- Role-based overview (partner sees firm metrics, associate sees caseload)
- Upcoming hearings, deadlines, tasks
- KPIs: active cases, billable hours, revenue, win rate

### 2. Case Management
- **Lifecycle**: Intake → Conflict Check → Accepted → Active → Court/Arbitration → Judgment → Appeal → Closed → Archived
- **Case types**: Criminal, Civil, Commercial, Family, Real Estate, Labor, IP, Banking, Insurance, Administrative, Arbitration
- **Fields**: Case #, Najiz ref, court, judge, opposing counsel, case value, fees, status, priority
- **Linked**: Clients, documents, hearings, tasks, time entries, invoices, notes
- Case templates per practice area
- Conflict of interest checker

### 3. Client Management (CRM)
- Individual & corporate clients
- KYC/AML compliance (Saudi ID/Iqama, CR number, authorized signatories)
- Communication log (calls, emails, meetings)
- Client portal access
- Satisfaction tracking
- Retainer agreements

### 4. Court Calendar & Hearings
- Court hearing schedule with Najiz case linking
- Judge profiles & court preferences
- Hearing preparation checklists
- Adjournment tracking
- Deadline calculator (appeal periods, statute of limitations)
- Hijri/Gregorian dual calendar

### 5. Document Management
- Categories: Pleadings, Contracts, Powers of Attorney, Memos, Letters, Court Orders, Evidence
- Version control
- Arabic/English bilingual templates
- Template engine with variable substitution
- Document numbering system
- Digital signatures readiness
- OCR for scanned paper documents (future)

### 6. Time Tracking & Billing
- Timer-based or manual time entry
- Billable vs non-billable hours
- Rate cards per lawyer grade
- Fee types: Hourly, Flat Fee, Contingency, Retainer, Success Fee
- Pre-bill review workflow
- Trust/escrow account management (IOLTA equivalent)

### 7. Invoicing & Finance
- ZATCA Phase 2 compliant e-invoicing
- QR code generation (TLV encoded)
- VAT calculations (15%)
- Invoice lifecycle: Draft → Reviewed → Sent → Partially Paid → Paid → Overdue
- Payment tracking (bank transfer, check, cash)
- Revenue reports by practice area, lawyer, client
- Aging reports (30/60/90 days)
- Expense tracking per case

### 8. Task Management
- Task assignment with deadlines
- Priority levels (critical → low)
- Linked to cases
- Recurring tasks
- SLA tracking
- Kanban view

### 9. Legal Research & Knowledge Base
- Internal precedent database
- Legal memo library
- Saudi law reference (regulations, royal decrees)
- Case law summaries
- AI-powered research assistant (via voice)

### 10. Contacts & Opposing Counsel
- Judge directory
- Opposing counsel database
- Expert witnesses
- Court clerks & staff
- Government agency contacts

### 11. Compliance & Risk
- Conflict of interest checks (automated)
- Anti-money laundering (AML) screening
- Client risk assessment
- Regulatory deadline tracking
- Saudi Bar Association compliance
- Data protection (Saudi PDPL)

### 12. Reporting & Analytics
- Caseload distribution
- Lawyer utilization rates
- Revenue by practice area
- Win/loss ratios
- Client acquisition trends
- Court outcome analysis
- Firm profitability

### 13. HR & Lawyer Management
- Lawyer profiles (bar number, specializations, languages)
- Vacation/leave tracking
- Performance metrics
- CLE/CPD tracking (continuing education)
- Bar license renewal reminders

### 14. Communication
- Client communication log
- Internal messaging
- Email integration readiness
- SMS/WhatsApp notifications
- Meeting scheduler

### 15. Power of Attorney (POA)
- POA register (active, expired, revoked)
- Template generation
- Court-specific POA requirements
- Expiry alerts
- Linked to cases and clients

### 16. Contract Management
- Contract drafting from templates
- Review workflow (associate → partner)
- Key terms extraction
- Renewal tracking
- Obligation monitoring

### 17. Court Filing
- Filing checklist per court type
- Document assembly for submission
- Filing fee tracking
- e-Filing readiness (Najiz)
- Receipt tracking

### 18. Firm Settings & Configuration
- Practice areas configuration
- Court definitions
- Fee rate cards
- Document templates
- Workflow rules
- User management
- Firm branding (letterhead, logo)

## Saudi Compliance Requirements

### ZATCA E-Invoicing (Phase 2 - Integration)
- Clearance & reporting to ZATCA
- XML invoice generation (UBL 2.1)
- QR code with TLV encoding (seller, VAT, timestamp, total, VAT amount)
- Cryptographic stamp
- Sequential invoice numbering
- Credit/debit notes

### Ministry of Justice (MOJ)
- Najiz platform case reference numbers
- Court types: General Court, Criminal Court, Commercial Court, Labor Court, Administrative Court, Court of Appeal, Supreme Court
- Judge assignment tracking
- Session/hearing management

### Saudi Bar Association
- Lawyer registration numbers
- Practice license tracking
- Mandatory insurance
- Fee guidelines
- Disciplinary records

### Saudi PDPL (Personal Data Protection Law)
- Client data encryption
- Consent management
- Data retention policies
- Right to deletion
- Cross-border transfer restrictions

## Database Schema (Key Tables)

### Core
- users, roles, permissions
- firms, departments, practice_areas

### Cases
- cases, case_parties, case_events, case_notes
- case_documents, case_tasks, case_conflicts

### Clients
- clients, client_contacts, client_kyc
- client_communications, retainer_agreements

### Court
- courts, judges, hearings, hearing_attendees
- court_filings, deadlines

### Finance
- time_entries, invoices, invoice_items
- payments, trust_accounts, trust_transactions
- expenses, fee_arrangements

### Documents
- documents, document_versions, document_templates
- power_of_attorney, contracts

### Contacts
- opposing_counsel, expert_witnesses, contacts

### HR
- lawyers, qualifications, bar_licenses
- leave_requests, performance_reviews

### Settings
- policies (JSONB), workflows, templates

## Voice Commands (Examples)
- "Open case 2024-COM-001"
- "Schedule hearing for Al-Rashid case next Thursday at General Court"
- "Log 2 hours on the Aramco contract review"
- "Generate invoice for client Mohammed Al-Otaibi"
- "What are my upcoming deadlines this week?"
- "File grievance against opposing counsel"
- "Check conflicts for new client Saudi Mining Corp"
- "Show my billable hours this month"
- "Draft a power of attorney for Ahmed case"
- "What's the status of the appeal in case 2024-CRM-015?"

## Design Language
- **Light theme** — white/gray backgrounds, emerald + slate accents
- **Law-focused UI** — scales of justice motif, professional typography
- **Arabic-first** — RTL support, Arabic legal terms, Hijri dates
- **Mobile-first** — lawyers in court need mobile access
- **Professional** — Apple/Linear design vibes, no playful elements
