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

  // -------------------------
  // PROGRAM & MANUALS (Combined)
  // -------------------------
  CREATE_PROGRAM_MANUAL: "create_program_manual",
  EDIT_PROGRAM_MANUAL: "edit_program_manual",
  DELETE_PROGRAM_MANUAL: "delete_program_manual",
  VIEW_PROGRAM_MANUALS: "view_program_manuals",
  // -------------------------
  // EVENT MINUTES
  // -------------------------
  CREATE_EVENT_MINUTE: "create_event_minute",
  EDIT_EVENT_MINUTE: "edit_event_minute",
  DELETE_EVENT_MINUTE: "delete_event_minute",
  VIEW_EVENT_MINUTES: "view_event_minutes",

  // -------------------------
  // COLLECTIVE AGREEMENT
  // -------------------------
  CREATE_COLLECTIVE_AGREEMENT: "create_collective_agreement",
  EDIT_COLLECTIVE_AGREEMENT: "edit_collective_agreement",
  DELETE_COLLECTIVE_AGREEMENT: "delete_collective_agreement",
  VIEW_COLLECTIVE_AGREEMENTS: "view_collective_agreements",

  // -------------------------
  // HR UPDATES
  // -------------------------
  CREATE_HR_UPDATE: "create_hr_update",
  EDIT_HR_UPDATE: "edit_hr_update",
  DELETE_HR_UPDATE: "delete_hr_update",
  VIEW_HR_UPDATES: "view_hr_updates",

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

  // Organizational Chart
  CREATE_ORG_CHART: "create_org_chart",
  EDIT_ORG_CHART: "edit_org_chart",
  DELETE_ORG_CHART: "delete_org_chart",
  VIEW_ORG_CHART: "view_org_chart",

  VIEW_SUBMIT_FORM:"view_submit_form",
  VIEW_SUBMISSIONS:"view_submissions",
  EDIT_FORM:"edit_form",
  DELETE_FORM:"delete_form"
} as const;
export type AllPermissions=(typeof PERMISSIONS)[keyof typeof PERMISSIONS]