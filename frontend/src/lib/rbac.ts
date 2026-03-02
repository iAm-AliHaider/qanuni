/**
 * Role-Based Access Control for Qanuni
 *
 * Roles: managing_partner, senior_partner, partner, senior_associate, associate, paralegal, legal_secretary, finance, admin
 *
 * Permission levels:
 *   full   — CRUD + admin
 *   write  — CRUD own + read all
 *   read   — read only
 *   none   — no access
 */

export type Role = "managing_partner" | "senior_partner" | "partner" | "senior_associate" | "associate" | "paralegal" | "legal_secretary" | "finance" | "admin";

export type Permission = "full" | "write" | "read" | "none";

export type Module =
  | "cases" | "clients" | "documents" | "hearings" | "tasks"
  | "time" | "invoices" | "expenses" | "contracts" | "filings"
  | "poa" | "contacts" | "communications" | "compliance"
  | "trust" | "retainers" | "reports" | "settings" | "hr"
  | "templates" | "audit" | "zatca" | "notifications";

const ROLE_PERMISSIONS: Record<Role, Record<Module, Permission>> = {
  managing_partner: {
    cases: "full", clients: "full", documents: "full", hearings: "full", tasks: "full",
    time: "full", invoices: "full", expenses: "full", contracts: "full", filings: "full",
    poa: "full", contacts: "full", communications: "full", compliance: "full",
    trust: "full", retainers: "full", reports: "full", settings: "full", hr: "full",
    templates: "full", audit: "full", zatca: "full", notifications: "full",
  },
  senior_partner: {
    cases: "full", clients: "full", documents: "full", hearings: "full", tasks: "full",
    time: "full", invoices: "full", expenses: "full", contracts: "full", filings: "full",
    poa: "full", contacts: "full", communications: "full", compliance: "full",
    trust: "read", retainers: "full", reports: "full", settings: "read", hr: "read",
    templates: "full", audit: "read", zatca: "full", notifications: "full",
  },
  partner: {
    cases: "write", clients: "write", documents: "write", hearings: "write", tasks: "write",
    time: "write", invoices: "write", expenses: "write", contracts: "write", filings: "write",
    poa: "write", contacts: "write", communications: "write", compliance: "read",
    trust: "read", retainers: "read", reports: "read", settings: "none", hr: "read",
    templates: "write", audit: "read", zatca: "read", notifications: "full",
  },
  senior_associate: {
    cases: "write", clients: "read", documents: "write", hearings: "write", tasks: "write",
    time: "write", invoices: "read", expenses: "write", contracts: "read", filings: "write",
    poa: "read", contacts: "write", communications: "write", compliance: "read",
    trust: "none", retainers: "none", reports: "read", settings: "none", hr: "none",
    templates: "write", audit: "none", zatca: "none", notifications: "full",
  },
  associate: {
    cases: "write", clients: "read", documents: "write", hearings: "read", tasks: "write",
    time: "write", invoices: "none", expenses: "write", contracts: "read", filings: "write",
    poa: "read", contacts: "read", communications: "write", compliance: "none",
    trust: "none", retainers: "none", reports: "none", settings: "none", hr: "none",
    templates: "read", audit: "none", zatca: "none", notifications: "full",
  },
  paralegal: {
    cases: "read", clients: "read", documents: "write", hearings: "read", tasks: "write",
    time: "write", invoices: "none", expenses: "none", contracts: "read", filings: "read",
    poa: "read", contacts: "read", communications: "read", compliance: "none",
    trust: "none", retainers: "none", reports: "none", settings: "none", hr: "none",
    templates: "read", audit: "none", zatca: "none", notifications: "full",
  },
  legal_secretary: {
    cases: "read", clients: "read", documents: "write", hearings: "write", tasks: "read",
    time: "none", invoices: "none", expenses: "none", contracts: "read", filings: "read",
    poa: "read", contacts: "write", communications: "write", compliance: "none",
    trust: "none", retainers: "none", reports: "none", settings: "none", hr: "none",
    templates: "read", audit: "none", zatca: "none", notifications: "full",
  },
  finance: {
    cases: "read", clients: "read", documents: "read", hearings: "none", tasks: "none",
    time: "read", invoices: "full", expenses: "full", contracts: "read", filings: "none",
    poa: "none", contacts: "none", communications: "none", compliance: "none",
    trust: "full", retainers: "full", reports: "full", settings: "none", hr: "none",
    templates: "none", audit: "read", zatca: "full", notifications: "full",
  },
  admin: {
    cases: "read", clients: "read", documents: "read", hearings: "read", tasks: "read",
    time: "read", invoices: "read", expenses: "read", contracts: "read", filings: "read",
    poa: "read", contacts: "read", communications: "read", compliance: "read",
    trust: "read", retainers: "read", reports: "read", settings: "full", hr: "full",
    templates: "full", audit: "full", zatca: "read", notifications: "full",
  },
};

export function getPermission(role: string, module: Module): Permission {
  return ROLE_PERMISSIONS[role as Role]?.[module] || "none";
}

export function canRead(role: string, module: Module): boolean {
  const p = getPermission(role, module);
  return p !== "none";
}

export function canWrite(role: string, module: Module): boolean {
  const p = getPermission(role, module);
  return p === "write" || p === "full";
}

export function canAdmin(role: string, module: Module): boolean {
  return getPermission(role, module) === "full";
}

/**
 * Get accessible sidebar modules for a role.
 */
export function getAccessibleModules(role: string): Module[] {
  const perms = ROLE_PERMISSIONS[role as Role];
  if (!perms) return [];
  return (Object.entries(perms) as [Module, Permission][])
    .filter(([, p]) => p !== "none")
    .map(([m]) => m);
}

/**
 * Role display labels.
 */
export const ROLE_LABELS: Record<string, { en: string; ar: string }> = {
  managing_partner: { en: "Managing Partner", ar: "الشريك المدير" },
  senior_partner: { en: "Senior Partner", ar: "شريك أول" },
  partner: { en: "Partner", ar: "شريك" },
  senior_associate: { en: "Senior Associate", ar: "محامي أول" },
  associate: { en: "Associate", ar: "محامي" },
  paralegal: { en: "Paralegal", ar: "مساعد قانوني" },
  legal_secretary: { en: "Legal Secretary", ar: "سكرتير قانوني" },
  finance: { en: "Finance", ar: "مالية" },
  admin: { en: "Admin", ar: "إداري" },
};
