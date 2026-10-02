import React, { useState } from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  useDeleteEmployeeMutation,
  useGetEmployeeDeletionPreviewQuery,
} from "../../../../services/EmployeeApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";

interface DeleteEmployeeProps {
  employee: {
    _id: string;
    role: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}
interface Candidate {
  _id: string;
  firstname: string;
  lastname: string;
  role: string;
}

type Choice = "tasks" | "ownedTasks" | "tickets" | "locations";
type Mode = "reassign" | "delete";

interface Section {
  key: Choice;
  label: string;
  question: string;
  items: string[];
  options: Candidate[];
  canDelete: boolean;
}

const PARAM: Record<Choice, string> = {
  tasks: "reassignTasksTo",
  ownedTasks: "reassignOwnedTasksTo",
  tickets: "reassignTicketsTo",
  locations: "reassignLocationsTo",
};

const taskLabel = (t: any) =>
  `TASK-${String(t.taskNumber).padStart(5, "0")} ${t.title}`;
const ticketLabel = (t: any) =>
  `TICKET-${String(t.ticketNumber).padStart(5, "0")} ${t.req_title}`;

const DeleteEmployee: React.FC<DeleteEmployeeProps> = ({ employee }) => {
  const [showModal, setShowModal] = useState(false);
  const [choices, setChoices] = useState<Partial<Record<Choice, string>>>({});
  const [ownedTasksMode, setOwnedTasksMode] = useState<Mode>("reassign");
  const [deleteEmployee, { isLoading }] = useDeleteEmployeeMutation();

  const { data, isFetching, isError, error, refetch } =
    useGetEmployeeDeletionPreviewQuery(employee._id, {
      skip: !showModal,
      refetchOnMountOrArgChange: true,
    });

  const blockers = data?.data?.blockers;
  const candidates = data?.data?.candidates ?? {};

  const sections: Section[] = blockers
    ? (
        [
          {
            key: "tasks",
            label: "Open tasks assigned to this person",
            question: "Reassign these tasks to",
            items: (blockers.tasks ?? []).map(taskLabel),
            options: candidates.volunteers ?? [],
            canDelete: false,
          },
          {
            key: "ownedTasks",
            label: "Open tasks this person created and reviews",
            question: "New owner and reviewer",
            items: (blockers.ownedTasks ?? []).map(taskLabel),
            options: candidates.owners ?? [],
            canDelete: true,
          },
          {
            key: "tickets",
            label: "Active tickets assigned to this person",
            question: "Reassign these tickets to",
            items: (blockers.tickets ?? []).map(ticketLabel),
            options: candidates.handlers ?? [],
            canDelete: false,
          },
          {
            key: "locations",
            label: "Locations where this person is facility manager",
            question: "New facility manager",
            items: (blockers.locations ?? []).map((l: any) => l.name),
            options: candidates.managers ?? [],
            canDelete: false,
          },
        ] as Section[]
      ).filter((s) => s.items.length > 0)
    : [];

  const createdTickets: string[] = (blockers?.createdTickets ?? []).map(
    ticketLabel,
  );
  const certificates: string[] = (blockers?.certificates ?? []).map(
    (c: any) => c.title,
  );

  const modeOf = (s: Section): Mode =>
    s.key === "ownedTasks" ? ownedTasksMode : "reassign";

  const missingChoice = sections.some(
    (s) => modeOf(s) === "reassign" && !choices[s.key],
  );
  const canDelete = !!data && !isFetching && !isError && !missingChoice;

  const closeModal = () => {
    setShowModal(false);
    setChoices({});
    setOwnedTasksMode("reassign");
  };

  const handleDelete = async () => {
    const reassign: Record<string, string> = {};
    sections.forEach((s) => {
      if (s.key === "ownedTasks" && ownedTasksMode === "delete") {
        reassign.deleteOwnedTasks = "true";
      } else if (choices[s.key]) {
        reassign[PARAM[s.key]] = choices[s.key]!;
      }
    });

    try {
      const res = await deleteEmployee({ id: employee._id, reassign }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        closeModal();
      }
    } catch (err) {
      showError(getErrorMessage(err));
      refetch(); // work may have changed since the modal opened (e.g. 409 from a race)
    }
  };

  return (
    <div>
      <button
        className="btn btn-sm btn-street-delete d-flex flex-row align-items-center justify-content-center radius-12 p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
        title="Delete User"
      >
        <Icon icon="tabler:trash" className="text-xl" />
      </button>

      <ModalWrapper
        show={showModal}
        title="Delete User"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={closeModal}
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              onClick={handleDelete}
              className="btn btn-street-delete btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              disabled={isLoading || !canDelete}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        }
      >
        <div>
          <p>
            Are you sure you want to delete{" "}
            <span className="fw-bold">
              {employee.firstname} {employee.lastname}
            </span>
            ? They will lose access immediately. Deleted tickets and tasks go to
            the trash, where a super admin can restore them for a limited time.
            Certificates are permanently deleted. Completed work and past
            comments stay on record under their name.
          </p>

          <div
            className="border rounded p-10 text-sm mt-3"
            style={{ backgroundColor: "var(--street-bg-f4)" }}
          >
            <p className="fw-bold">Role: {employee.role}</p>
            <p className="mb-1">Email: {employee.email}</p>
          </div>

          {isFetching && <p className="text-sm mt-3">Checking open work...</p>}

          {isError && (
            <div className="text-danger text-sm mt-3">
              Could not check this user's open work: {getErrorMessage(error)}
              <button className="btn btn-link btn-sm" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}

          {!isFetching && sections.length > 0 && (
            <div className="mt-3 d-flex flex-column gap-3">
              <p className="text-sm fw-bold mb-0">
                This user still has open work. Choose what happens to it:
              </p>

              {sections.map((s) => {
                const deleting = s.canDelete && modeOf(s) === "delete";
                return (
                  <div key={s.key} className="border rounded p-10 text-sm">
                    <p className="fw-bold mb-1">
                      {s.label} ({s.items.length})
                    </p>
                    <ul
                      className="mb-2 ps-3"
                      style={{ maxHeight: 96, overflowY: "auto" }}
                    >
                      {s.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>

                    {s.canDelete && (
                      <div
                        className="d-flex flex-column flex-sm-row gap-2 mb-3"
                        role="radiogroup"
                      >
                        {(["reassign", "delete"] as Mode[]).map((m) => {
                          const selected = ownedTasksMode === m;
                          const isDelete = m === "delete";
                          const accent = isDelete ? "#dc3545" : "#0d6efd";

                          return (
                            <label
                              key={m}
                              className="d-flex align-items-start gap-2 flex-fill radius-12 p-10"
                              style={{
                                cursor: "pointer",
                                border: `1.5px solid ${selected ? accent : "#dee2e6"}`,
                                backgroundColor: selected
                                  ? isDelete
                                    ? "rgba(220, 53, 69, 0.06)"
                                    : "rgba(13, 110, 253, 0.06)"
                                  : "transparent",
                                transition:
                                  "border-color 0.15s, background-color 0.15s",
                              }}
                            >
                              <input
                                type="radio"
                                name={`mode-${s.key}`}
                                className="mt-1"
                                style={{ accentColor: accent }}
                                checked={selected}
                                onChange={() => setOwnedTasksMode(m)}
                              />
                              <span className="d-flex flex-column">
                                <span
                                  className="fw-semibold d-flex align-items-center gap-1"
                                  style={{
                                    color: selected ? accent : "inherit",
                                  }}
                                >
                                  <Icon
                                    icon={
                                      isDelete
                                        ? "tabler:trash"
                                        : "tabler:users-group"
                                    }
                                    className="text-lg"
                                  />
                                  {isDelete
                                    ? "Delete these"
                                    : "Give to someone else"}
                                </span>
                                <span
                                  className="text-muted"
                                  style={{ fontSize: 12 }}
                                >
                                  {isDelete
                                    ? "Moved to trash with their comments"
                                    : "Pick a new owner and reviewer"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {deleting ? (
                      <p className="text-danger mb-0">
                        These will be deleted along with their comments.
                      </p>
                    ) : (
                      <>
                        <label className="form-label mb-1">{s.question}</label>
                        <select
                          className="form-select form-select-sm"
                          value={choices[s.key] ?? ""}
                          onChange={(e) =>
                            setChoices((c) => ({
                              ...c,
                              [s.key]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select a person...</option>
                          {s.options.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.firstname} {u.lastname} ({u.role})
                            </option>
                          ))}
                        </select>
                        {s.options.length === 0 && (
                          <p className="text-danger mt-1 mb-0">
                            No eligible active users. Add or reactivate one
                            first.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isFetching && createdTickets.length > 0 && (
            <div className="border border-danger rounded p-10 text-sm mt-3">
              <p className="fw-bold mb-1">
                Tickets this person requested ({createdTickets.length})
              </p>
              <ul
                className="mb-2 ps-3"
                style={{ maxHeight: 96, overflowY: "auto" }}
              >
                {createdTickets.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <p className="mb-0 text-danger">These will be deleted.</p>
            </div>
          )}

          {!isFetching && certificates.length > 0 && (
            <div className="border border-danger rounded p-10 text-sm mt-3">
              <p className="fw-bold mb-1">
                Certificates submitted by this person ({certificates.length})
              </p>
              <ul
                className="mb-2 ps-3"
                style={{ maxHeight: 96, overflowY: "auto" }}
              >
                {certificates.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <p className="mb-0 text-danger">
                These will be permanently deleted, including their files.
              </p>
            </div>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
};

export default DeleteEmployee;
