import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS doc_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    category TEXT DEFAULT 'general',
    body_html TEXT NOT NULL,
    body_html_ar TEXT,
    variables TEXT DEFAULT '[]',
    header_html TEXT,
    footer_html TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  // Seed default templates
  const count = await sql`SELECT COUNT(*) as c FROM doc_templates`;
  if (Number(count[0]?.c) === 0) {
    const templates = [
      {
        name: "Statement of Claim", name_ar: "صحيفة دعوى", category: "litigation",
        body_html: `<div style="text-align:center;margin-bottom:24px"><h2>بسم الله الرحمن الرحيم</h2><h3>صحيفة دعوى</h3><p>Statement of Claim</p></div><table style="width:100%;border-collapse:collapse;margin:16px 0"><tr><td style="padding:8px;border:1px solid #ddd;width:30%"><strong>Case No. / رقم القضية:</strong></td><td style="padding:8px;border:1px solid #ddd">{{case_ref}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Court / المحكمة:</strong></td><td style="padding:8px;border:1px solid #ddd">{{court_name}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Claimant / المدعي:</strong></td><td style="padding:8px;border:1px solid #ddd">{{client_name}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Defendant / المدعى عليه:</strong></td><td style="padding:8px;border:1px solid #ddd">{{opposing_party}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Date / التاريخ:</strong></td><td style="padding:8px;border:1px solid #ddd">{{date}} ({{hijri_date}})</td></tr></table><h4>Subject of Claim / موضوع الدعوى</h4><p>{{claim_subject}}</p><h4>Facts / الوقائع</h4><p>{{facts}}</p><h4>Legal Basis / السند النظامي</h4><p>{{legal_basis}}</p><h4>Relief Sought / الطلبات</h4><p>{{relief_sought}}</p><div style="margin-top:40px"><p><strong>Attorney / المحامي:</strong> {{attorney_name}}</p><p><strong>License No. / رقم الترخيص:</strong> {{attorney_license}}</p><p><strong>Signature / التوقيع:</strong> ___________________</p></div>`,
        variables: JSON.stringify(["case_ref","court_name","client_name","opposing_party","date","hijri_date","claim_subject","facts","legal_basis","relief_sought","attorney_name","attorney_license"]),
      },
      {
        name: "Power of Attorney", name_ar: "وكالة", category: "authorization",
        body_html: `<div style="text-align:center;margin-bottom:24px"><h2>بسم الله الرحمن الرحيم</h2><h3>وكالة خاصة</h3><p>Special Power of Attorney</p></div><p>I, <strong>{{grantor_name}}</strong>, holder of ID No. <strong>{{grantor_id}}</strong>, residing at <strong>{{grantor_address}}</strong>,</p><p>Hereby appoint <strong>{{attorney_name}}</strong>, holder of Attorney License No. <strong>{{attorney_license}}</strong>, of <strong>{{firm_name}}</strong>,</p><p>As my attorney-in-fact with full authority to:</p><p>{{scope_of_authority}}</p><p>This power of attorney is valid from <strong>{{start_date}}</strong> to <strong>{{end_date}}</strong>.</p><div style="margin-top:40px;display:flex;justify-content:space-between"><div><p><strong>Grantor / الموكل</strong></p><p>Name: {{grantor_name}}</p><p>Signature: ___________________</p><p>Date: {{date}}</p></div><div><p><strong>Witness / الشاهد</strong></p><p>Name: ___________________</p><p>Signature: ___________________</p></div></div>`,
        variables: JSON.stringify(["grantor_name","grantor_id","grantor_address","attorney_name","attorney_license","firm_name","scope_of_authority","start_date","end_date","date"]),
      },
      {
        name: "Demand Letter", name_ar: "خطاب إنذار", category: "correspondence",
        body_html: `<div style="text-align:right;margin-bottom:16px"><p>{{date}}</p><p>{{hijri_date}}</p></div><p>To: <strong>{{recipient_name}}</strong></p><p>Address: {{recipient_address}}</p><p>&nbsp;</p><p>Subject: <strong>{{subject}}</strong></p><p>&nbsp;</p><p>Dear {{recipient_name}},</p><p>{{body_text}}</p><p>&nbsp;</p><p>We hereby demand that you {{demand_action}} within <strong>{{deadline_days}}</strong> days from the date of this letter.</p><p>Failure to comply will result in legal proceedings being initiated without further notice.</p><p>&nbsp;</p><p>Yours faithfully,</p><p><strong>{{attorney_name}}</strong></p><p>{{firm_name}}</p><p>License No. {{attorney_license}}</p>`,
        variables: JSON.stringify(["date","hijri_date","recipient_name","recipient_address","subject","body_text","demand_action","deadline_days","attorney_name","firm_name","attorney_license"]),
      },
      {
        name: "Client Engagement Letter", name_ar: "خطاب تعاقد", category: "engagement",
        body_html: `<div style="text-align:center;margin-bottom:24px"><h3>Client Engagement Letter</h3><h4>خطاب تعاقد مع العميل</h4></div><p>Date: {{date}}</p><p>&nbsp;</p><p>Dear {{client_name}},</p><p>We are pleased to confirm our engagement to represent you in the matter of <strong>{{case_description}}</strong>.</p><h4>Scope of Services</h4><p>{{scope_of_services}}</p><h4>Fee Arrangement</h4><p>{{fee_arrangement}}</p><h4>Payment Terms</h4><p>{{payment_terms}}</p><h4>Confidentiality</h4><p>All information shared will be treated as strictly confidential in accordance with the Saudi Legal Profession Law.</p><p>&nbsp;</p><div style="display:flex;justify-content:space-between;margin-top:40px"><div><p><strong>For the Firm</strong></p><p>{{firm_name}}</p><p>Signature: ___________________</p></div><div><p><strong>Client</strong></p><p>{{client_name}}</p><p>Signature: ___________________</p></div></div>`,
        variables: JSON.stringify(["date","client_name","case_description","scope_of_services","fee_arrangement","payment_terms","firm_name"]),
      },
      {
        name: "Legal Opinion", name_ar: "رأي قانوني", category: "advisory",
        body_html: `<div style="text-align:center;margin-bottom:24px"><h3>Legal Opinion</h3><h4>رأي قانوني</h4><p>CONFIDENTIAL — سري</p></div><p>Date: {{date}}</p><p>Ref: {{ref_number}}</p><p>To: {{client_name}}</p><p>&nbsp;</p><h4>Question Presented / السؤال المطروح</h4><p>{{question}}</p><h4>Brief Answer / إجابة مختصرة</h4><p>{{brief_answer}}</p><h4>Analysis / التحليل</h4><p>{{analysis}}</p><h4>Applicable Laws / الأنظمة المطبقة</h4><p>{{applicable_laws}}</p><h4>Conclusion / الخلاصة</h4><p>{{conclusion}}</p><h4>Recommendation / التوصية</h4><p>{{recommendation}}</p><p>&nbsp;</p><p><strong>{{attorney_name}}</strong></p><p>{{firm_name}}</p>`,
        variables: JSON.stringify(["date","ref_number","client_name","question","brief_answer","analysis","applicable_laws","conclusion","recommendation","attorney_name","firm_name"]),
      },
      {
        name: "Court Submission", name_ar: "مذكرة للمحكمة", category: "litigation",
        body_html: `<div style="text-align:center;margin-bottom:24px"><h2>بسم الله الرحمن الرحيم</h2><h3>مذكرة</h3><p>Memorandum / Submission</p></div><table style="width:100%;border-collapse:collapse;margin:16px 0"><tr><td style="padding:8px;border:1px solid #ddd"><strong>Case No.:</strong> {{case_ref}}</td><td style="padding:8px;border:1px solid #ddd"><strong>Court:</strong> {{court_name}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Filed by:</strong> {{party_name}}</td><td style="padding:8px;border:1px solid #ddd"><strong>Date:</strong> {{date}} ({{hijri_date}})</td></tr></table><h4>Introduction / المقدمة</h4><p>{{introduction}}</p><h4>Arguments / الدفوع</h4><p>{{arguments}}</p><h4>Evidence / المستندات</h4><p>{{evidence}}</p><h4>Conclusion / الخاتمة</h4><p>{{conclusion}}</p><p>&nbsp;</p><p>Respectfully submitted / وتفضلوا بقبول فائق الاحترام</p><p><strong>{{attorney_name}}</strong> — License No. {{attorney_license}}</p>`,
        variables: JSON.stringify(["case_ref","court_name","party_name","date","hijri_date","introduction","arguments","evidence","conclusion","attorney_name","attorney_license"]),
      },
    ];
    for (const tmpl of templates) {
      await sql`INSERT INTO doc_templates (name, name_ar, category, body_html, variables) VALUES (${tmpl.name}, ${tmpl.name_ar}, ${tmpl.category}, ${tmpl.body_html}, ${tmpl.variables})`;
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  try {
    await ensureTable();
    if (id) {
      const rows = await sql`SELECT * FROM doc_templates WHERE id = ${id}`;
      return NextResponse.json(rows[0] || null);
    }
    const rows = await sql`SELECT id, name, name_ar, category, variables, is_active, created_at FROM doc_templates ORDER BY category, name`;
    return NextResponse.json({ templates: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { name, name_ar, category, body_html, body_html_ar, variables, header_html, footer_html, created_by } = body;
      const [row] = await sql`INSERT INTO doc_templates (name, name_ar, category, body_html, body_html_ar, variables, header_html, footer_html, created_by) VALUES (${name}, ${name_ar||null}, ${category||"general"}, ${body_html}, ${body_html_ar||null}, ${JSON.stringify(variables||[])}, ${header_html||null}, ${footer_html||null}, ${created_by||null}) RETURNING id`;
      return NextResponse.json({ success: true, id: row.id });
    }

    if (action === "update") {
      const { id, name, name_ar, category, body_html, variables } = body;
      await sql`UPDATE doc_templates SET name=${name}, name_ar=${name_ar||null}, category=${category||"general"}, body_html=${body_html}, variables=${JSON.stringify(variables||[])}, updated_at=NOW() WHERE id=${id}`;
      return NextResponse.json({ success: true });
    }

    if (action === "render") {
      const { template_id, data } = body;
      const rows = await sql`SELECT * FROM doc_templates WHERE id = ${template_id}`;
      if (!rows.length) return NextResponse.json({ error: "Template not found" }, { status: 404 });
      let html = rows[0].body_html as string;
      for (const [key, value] of Object.entries(data || {})) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
      }
      // Clear unfilled variables
      html = html.replace(/\{\{[^}]+\}\}/g, "___");
      return NextResponse.json({ html, template: rows[0].name });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
