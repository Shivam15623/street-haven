export const PERMISSIONS = {
  // -------------------------
  // EVENTS
  // -------------------------
  CREATE_EVENT: "create_event",
  EDIT_EVENT: "edit_event",
  DELETE_EVENT: "delete_event",
  VIEW_EVENTS: "view_events",
  VIEW_REGISTERATIONS: "view_registerations",

  // -------------------------
  // EMPLOYEES
  // -------------------------
  CREATE_EMPLOYEE: "create_employee",
  EDIT_EMPLOYEE: "edit_employee",
  DELETE_EMPLOYEE: "delete_employee",
  VIEW_EMPLOYEES: "view_employees",
  RESET_PASSWORD: "reset_password",
  EMPLOYEE_STATUS_CHANGE: "employee_status_change",

  // -------------------------
  // PROGRAM & MANUALS (Combined)
  // -------------------------
  CREATE_PROGRAM_MANUAL: "create_program_manual",
  EDIT_PROGRAM_MANUAL: "edit_program_manual",
  DELETE_PROGRAM_MANUAL: "delete_program_manual",
  VIEW_PROGRAM_MANUALS: "view_program_manuals",

  // -------------------------
  // COLLECTIVE AGREEMENT
  // -------------------------
  CREATE_COLLECTIVE_AGREEMENT: "create_collective_agreement",
  EDIT_COLLECTIVE_AGREEMENT: "edit_collective_agreement",
  DELETE_COLLECTIVE_AGREEMENT: "delete_collective_agreement",
  VIEW_COLLECTIVE_AGREEMENTS: "view_collective_agreements",

  // -------------------------
  // ANNOUNCEMENTS
  // -------------------------
  CREATE_ANNOUNCEMENT: "create_announcement",
  EDIT_ANNOUNCEMENT: "edit_announcement",
  DELETE_ANNOUNCEMENT: "delete_announcement",
  VIEW_ANNOUNCEMENTS: "view_announcements",

  // -------------------------
  // FAQ
  // -------------------------
  CREATE_FAQ: "create_faq",
  EDIT_FAQ: "edit_faq",
  DELETE_FAQ: "delete_faq",
  VIEW_FAQS: "view_faqs",

  // -------------------------
  // EMERGENCY CONTACTS
  // -------------------------
  CREATE_EMERGENCY_CONTACT: "create_emergency_contact",
  EDIT_EMERGENCY_CONTACT: "edit_emergency_contact",
  DELETE_EMERGENCY_CONTACT: "delete_emergency_contact",
  VIEW_EMERGENCY_CONTACTS: "view_emergency_contacts",

  TICKET_VIEW_SELF: "ticket_view_self",
  TICKET_CATEGORY_MANAGE: "ticket_category_manage",
  TICKET_CATEGORY_ADD: "ticket_category_add",
  TICKET_CREATE: "ticket_create",
  TICKET_REPORT_ALL: "ticket_report_all",
  TICKET_REPORT_SELF_MANAGED: "ticket_report_self_managed",

  TASK_VIEW_SELF: "task_view_self",
  TASK_VIEW_ALL: "task_view_all",
  TASK_EDIT: "task_edit",
  TASK_DELETE: "task_delete",
  TASK_APPROVE_REJECT: "task_approve_reject",
  TASK_SUBMIT: "task_submit",
  TASK_REPORT_EXPORT: "task_report_export",
  TASK_CREATE: "task_create",

  TRAINING_CERTIFICATE_VIEW_SELF: "training_certificate_view_self",
  TRAINING_CERTIFICATE_VIEW_ALL: "training_certificate_view_all",
  TRAINING_CERTIFICATE_SUBMIT: "training_certificate_submit",
  TRAINING_CERTIFICATE_APPROVE_REJECT: "training_certificate_approve_reject",

  LOCATION_VIEW: "location_view",
  LOCATION_CREATE: "location_create",
  LOCATION_EDIT: "location_edit",
  LOCATION_DELETE: "location_delete",
} as const;
export type AllPermissions = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
