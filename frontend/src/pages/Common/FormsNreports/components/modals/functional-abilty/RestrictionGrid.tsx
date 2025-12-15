import { Icon } from "@iconify/react";
import type { Restrictions } from "../../../../../../services/FormApi";

interface RestrictionsGridProps {
  restrictions?: Restrictions;
  className?: string;
}
type HandType = "gripping" | "pinching" | "other";

const handTypes: HandType[] = ["gripping", "pinching", "other"];
const restrictionItems = [
  {
    key: "bendingTwisting",
    label: "Bending / Twisting",
    icon: "mdi:rotate-3d",
  },
  {
    key: "chemicalExposure",
    label: "Chemical Exposure",
    icon: "mdi:chemical-weapon",
  },
  {
    key: "environmentalExposure",
    label: "Environmental Exposure",
    icon: "mdi:weather-sunny-alert",
  },
  {
    key: "operatingMotorizedEquipment",
    label: "Motorized Equipment",
    icon: "mdi:truck",
  },
  {
    key: "medicationSideEffects",
    label: "Medication Side Effects",
    icon: "mdi:pill",
  },
  {
    key: "workAboveShoulder",
    label: "Work Above Shoulder",
    icon: "mdi:arrow-up",
  },
];

export function RestrictionsGrid({
  restrictions,
  className,
}: RestrictionsGridProps) {
  if (!restrictions) {
    return (
      <p className="text-street-base fst-italic">
        No restrictions information available.
      </p>
    );
  }

  return (
    <div className={`${className}  mt-10 d-flex flex-column gap-10`}>
      {/* General Restrictions */}
      <div className="row g-3 ">
        {restrictionItems.map(({ key, label, icon }) => {
          const value = restrictions[key as keyof Restrictions] as
            | string
            | undefined;
          const isActive = !!value;

          return (
            <div key={key} className="col-6 col-md-4">
              <div
                className={`d-flex align-items-start gap-2 p-3 border rounded
                  ${
                    isActive
                      ? "bg-warning-subtle border-warning"
                      : " border-secondary"
                  }`}
                style={{
                  background: isActive
                    ? "bg-warning-surface"
                    : "var(--street-bg-f4)",
                }}
              >
                {/* Icon Box */}
                <div
                  className={`d-flex justify-content-center align-items-center rounded-circle
                    ${
                      isActive ? "bg-warning-300 bg-opacity-25" : "bg-secondary"
                    } `}
                  style={{ width: "32px", height: "32px" }}
                >
                  <Icon
                    icon={icon}
                    className={`fs-6 ${
                      isActive ? "text-warning-800" : "text-light"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-grow-1">
                  <div
                    className={`${
                      isActive ? "text-warning-800" : "text-street-base"
                    } small`}
                  >
                    {label}
                  </div>
                  <div
                    className={`fw-semibold ${
                      isActive ? "text-warning-800" : "text-street-base"
                    }`}
                  >
                    {value || "None"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Limited Pushing/Pulling */}
      {restrictions.limitedPushingPulling && (
        <div className="mt-10 d-flex flex-column gap-10">
          <h5 className="text-sm text-street-base text-uppercase mb-2 d-flex align-items-center gap-1">
            <Icon icon="mdi:hand" className="fs-6" />
            Limited Pushing/Pulling
          </h5>

          <div className="d-flex flex-wrap gap-2">
            {restrictions.limitedPushingPulling.leftArm && (
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                <Icon icon="mdi:alert" className="fs-6" />
                Left Arm
              </span>
            )}
            {restrictions.limitedPushingPulling.rightArm && (
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                <Icon icon="mdi:alert" className="fs-6" />
                Right Arm
              </span>
            )}
            {restrictions.limitedPushingPulling.other && (
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                <Icon icon="mdi:alert" className="fs-6" />
                Other
              </span>
            )}

            {!restrictions.limitedPushingPulling.leftArm &&
              !restrictions.limitedPushingPulling.rightArm &&
              !restrictions.limitedPushingPulling.other && (
                <span className="badge bg-secondary text-light d-flex align-items-center gap-1">
                  <Icon icon="mdi:check" className="fs-6" />
                  No Limitations
                </span>
              )}
          </div>
        </div>
      )}

      {/* Exposure to Vibration */}
      {restrictions.exposureToVibration && (
        <div className="mt-10 d-flex flex-column gap-10">
          <h5 className="text-sm text-street-base text-uppercase mb-2 d-flex align-items-center gap-1">
            <Icon icon="mdi:vibrate" className="fs-6" />
            Exposure to Vibration
          </h5>

          <div className="d-flex flex-wrap gap-2">
            {restrictions.exposureToVibration.wholeBody && (
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                <Icon icon="mdi:alert" className="fs-6" />
                Whole Body
              </span>
            )}
            {restrictions.exposureToVibration.handArm && (
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                <Icon icon="mdi:alert" className="fs-6" />
                Hand/Arm
              </span>
            )}

            {!restrictions.exposureToVibration.wholeBody &&
              !restrictions.exposureToVibration.handArm && (
                <span className="badge bg-secondary text-light d-flex align-items-center gap-1">
                  <Icon icon="mdi:check" className="fs-6" />
                  No Vibration Restrictions
                </span>
              )}
          </div>
        </div>
      )}

      {/* Limited Use of Hands */}
      {restrictions.limitedUseOfHands && (
        <div className="mt-10 d-flex flex-column gap-10">
          <h5 className="text-sm text-street-base text-uppercase mb-2 d-flex align-items-center gap-1">
            <Icon icon="mdi:hand" />
            Limited Use of Hands
          </h5>

          <div className="row g-3">
            {/* Left Hand */}
            <div className="col-md-6">
              <div
                className="border rounded p-3 "
                style={{ background: "var(--street-bg-f4)" }}
              >
                <div className="text-street-base small mb-2 fw-semibold">
                  Left Hand
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {handTypes.map((type) =>
                    restrictions.limitedUseOfHands?.left?.[type] ? (
                      <span
                        key={type}
                        className="badge  bg-warning-subtle text-warning"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ) : null
                  )}

                  {!restrictions.limitedUseOfHands.left?.gripping &&
                    !restrictions.limitedUseOfHands.left?.pinching &&
                    !restrictions.limitedUseOfHands.left?.other && (
                      <span className="text-street-base small">None</span>
                    )}
                </div>
              </div>
            </div>

            {/* Right Hand */}
            <div className="col-md-6">
              <div
                className="border rounded p-3"
                style={{ background: "var(--street-bg-f4)" }}
              >
                <div className="text-street-base small mb-2 fw-semibold">
                  Right Hand
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {handTypes.map((type) =>
                    restrictions.limitedUseOfHands?.right?.[type] ? (
                      <span
                        key={type}
                        className="badge bg-warning-subtle text-warning"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ) : null
                  )}

                  {!restrictions.limitedUseOfHands.right?.gripping &&
                    !restrictions.limitedUseOfHands.right?.pinching &&
                    !restrictions.limitedUseOfHands.right?.other && (
                      <span className="text-street-base small">None</span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
