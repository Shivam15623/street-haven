// utills/userDisplay.tsx
interface PersonLike {
  firstname?: string;
  lastname?: string;
  status?: string;
  isDeleted?: boolean;
}

export const isRemoved = (u?: PersonLike | null) => !u || !!u.isDeleted;

export const personName = (u?: PersonLike | null) =>
  !u ? "Deleted user" : `${u.firstname ?? ""} ${u.lastname ?? ""}`.trim();

export const PersonLabel = ({ user }: { user?: PersonLike | null }) => {
  const removed = isRemoved(user);
  const inactive = !removed && user?.status === "inactive";
  return (
    <span className={removed ? "text-street-base" : ""}>
      {personName(user)}
      {removed && <span className="text-street-base"> (removed)</span>}
      {inactive && <span className="text-street-base"> (inactive)</span>}
    </span>
  );
};