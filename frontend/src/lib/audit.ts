/**
 * Client-side audit logging helper.
 * Call after any CRUD action to log to the audit trail.
 */
export async function logAction(params: {
  userId?: number;
  userName?: string;
  action: "create" | "update" | "delete" | "sign" | "approve" | "reject" | "view";
  entityType: string;
  entityId?: number;
  entityRef?: string;
  oldValue?: string;
  newValue?: string;
}) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: params.userId,
        user_name: params.userName,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_ref: params.entityRef,
        old_value: params.oldValue,
        new_value: params.newValue,
      }),
    });
  } catch {}
}

/**
 * Get user from localStorage for audit context.
 */
export function getAuditUser(): { id?: number; name?: string } {
  try {
    const s = localStorage.getItem("qanuni_user");
    if (s) {
      const u = JSON.parse(s);
      return { id: u.id, name: u.name };
    }
  } catch {}
  return {};
}
