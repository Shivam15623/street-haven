import { PERMISSIONS } from "./permissions.js";

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),

  admin: Object.values(PERMISSIONS).filter((p) => {
    return [
      PERMISSIONS.EDIT_EMPLOYEE,
      PERMISSIONS.DELETE_EMPLOYEE,
      PERMISSIONS.CREATE_EMPLOYEE,
      PERMISSIONS.EDIT_FORM,
      PERMISSIONS.DELETE_FORM
    ].includes(p);
  }),

  manager: [
    // 🔹 Announcements
    PERMISSIONS.VIEW_ANNOUNCEMENTS,

    // 🔹 Collective Agreements
    PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,

    // 🔹 Emergency Contacts
    PERMISSIONS.VIEW_EMERGENCY_CONTACTS,

    // 🔹 Employees
    PERMISSIONS.CREATE_EMPLOYEE,
    PERMISSIONS.DELETE_EMPLOYEE,
    PERMISSIONS.EDIT_EMPLOYEE,

    // 🔹 Events
    PERMISSIONS.VIEW_EVENTS,

    // 🔹 Event Minutes
    PERMISSIONS.VIEW_EVENT_MINUTES,

    // 🔹 FAQs
    PERMISSIONS.VIEW_FAQS,

    // 🔹 HR Updates
    PERMISSIONS.VIEW_HR_UPDATES,

    // 🔹 Organizational Chart
    PERMISSIONS.CREATE_ORG_CHART,
    PERMISSIONS.DELETE_ORG_CHART,
    PERMISSIONS.EDIT_ORG_CHART,
    PERMISSIONS.VIEW_ORG_CHART,

    // 🔹 Program Manuals
    PERMISSIONS.VIEW_PROGRAM_MANUALS,

    // 🔹 Forms
    PERMISSIONS.VIEW_SUBMIT_FORM,
  ],

  hr: [
    // 🔹 Announcements
    PERMISSIONS.CREATE_ANNOUNCEMENT,
    PERMISSIONS.DELETE_ANNOUNCEMENT,
    PERMISSIONS.EDIT_ANNOUNCEMENT,
    PERMISSIONS.VIEW_ANNOUNCEMENTS,

    // 🔹 Collective Agreements
    PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,

    // 🔹 Emergency Contacts
    PERMISSIONS.VIEW_EMERGENCY_CONTACTS,

    // 🔹 Employees

    // 🔹 Events
    PERMISSIONS.VIEW_EVENTS,

    // 🔹 Event Minutes
    PERMISSIONS.VIEW_EVENT_MINUTES,

    // 🔹 FAQs
    PERMISSIONS.VIEW_FAQS,

    // 🔹 HR Updates
    PERMISSIONS.CREATE_HR_UPDATE,
    PERMISSIONS.DELETE_HR_UPDATE,
    PERMISSIONS.EDIT_HR_UPDATE,
    PERMISSIONS.VIEW_HR_UPDATES,

    // 🔹 Organizational Chart
    PERMISSIONS.VIEW_ORG_CHART,

    // 🔹 Program Manuals
    PERMISSIONS.VIEW_PROGRAM_MANUALS,

    // 🔹 Forms
    PERMISSIONS.VIEW_SUBMIT_FORM,
  ],

  employee: [
    // 🔹 Announcements
    PERMISSIONS.VIEW_ANNOUNCEMENTS,

    // 🔹 Collective Agreements
    PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,

    // 🔹 Emergency Contacts
    PERMISSIONS.VIEW_EMERGENCY_CONTACTS,

    // 🔹 Employees

    // 🔹 Events
    PERMISSIONS.VIEW_EVENTS,

    // 🔹 Event Minutes
    PERMISSIONS.VIEW_EVENT_MINUTES,

    // 🔹 FAQs
    PERMISSIONS.VIEW_FAQS,

    // 🔹 HR Updates
    PERMISSIONS.VIEW_HR_UPDATES,

    // 🔹 Organizational Chart
    PERMISSIONS.VIEW_ORG_CHART,

    // 🔹 Program Manuals
    PERMISSIONS.VIEW_PROGRAM_MANUALS,

    // 🔹 Forms
    PERMISSIONS.VIEW_SUBMIT_FORM,
  ],
};
