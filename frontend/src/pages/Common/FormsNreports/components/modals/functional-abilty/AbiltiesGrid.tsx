import { Icon } from "@iconify/react";
import type { Abilites } from "../../../../../../services/FormApi";

interface AbilitiesGridProps {
  abilities?: Abilites;
  className?: string;
}

const abilityItems = [
  { key: "walking", label: "Walking", icon: "mdi:walk" },
  { key: "standing", label: "Standing", icon: "mdi:human-male" },
  { key: "sitting", label: "Sitting", icon: "mdi:seat-passenger" },
  {
    key: "liftingFloorToWaist",
    label: "Lifting (Floor to Waist)",
    icon: "mdi:arrow-up-bold",
  },
  {
    key: "liftingWaistToShoulder",
    label: "Lifting (Waist to Shoulder)",
    icon: "mdi:arrow-down-bold",
  },
  { key: "stairClimbing", label: "Stair Climbing", icon: "mdi:stairs-up" },
  { key: "ladderClimbing", label: "Ladder Climbing", icon: "mdi:ladder" },
];

export function AbilitiesGrid({ abilities, className }: AbilitiesGridProps) {
  if (!abilities) {
    return (
      <p className="text-street-base fst-italic">
        No abilities information available.
      </p>
    );
  }

  return (
    <div className={className}>
      {/* Physical Abilities */}
      <div className="row g-3">
        {abilityItems.map(({ key, label, icon }) => {
          const value = abilities[key as keyof Abilites] as string | undefined;

          return (
            <div key={key} className="col-6 col-sm-4 col-lg-3">
              <div
                className="text-center p-3 border rounded b h-100 d-flex flex-column align-items-center"
                style={{ background: "var(--street-bg-f4)" }}
              >
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-2"
                  style={{ width: 40, height: 40 }}
                >
                  <Icon
                    icon={icon}
                    width="20"
                    height="20"
                    className="text-primary"
                  />
                </div>

                <div className="text-street-base small fw-medium mb-1">
                  {label}
                </div>

                <div className="fw-bold">{value || "—"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Travel to Work */}
      {abilities.travelToWork && (
        <div className="mt-4">
          <h6 className="text-uppercase text-sm text-street-base mb-3">
            Travel to Work
          </h6>

          <div className="row g-3" style={{ maxWidth: 400 }}>
            {/* Public Transit */}
            <div className="col-6">
              <div
                className="d-flex align-items-center gap-2 p-3 border rounded "
                style={{ background: "var(--street-bg-f4)" }}
              >
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center"
                  style={{ width: 32, height: 32 }}
                >
                  <Icon
                    icon="mdi:bus"
                    width="18"
                    height="18"
                    className="text-primary"
                  />
                </div>

                <div>
                  <div className="text-street-base small">Public Transit</div>
                  <div
                    className={
                      abilities.travelToWork.publicTransit === "yes"
                        ? "fw-semibold text-success"
                        : "fw-semibold text-street-base"
                    }
                  >
                    {abilities.travelToWork.publicTransit === "yes"
                      ? "Yes"
                      : "No"}
                  </div>
                </div>
              </div>
            </div>

            {/* Car */}
            <div className="col-6">
              <div
                className="d-flex align-items-center gap-2 p-3 border rounded "
                style={{ background: "var(--street-bg-f4)" }}
              >
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center"
                  style={{ width: 32, height: 32 }}
                >
                  <Icon
                    icon="mdi:car"
                    width="18"
                    height="18"
                    className="text-primary"
                  />
                </div>

                <div>
                  <div className="text-street-base small">Drive a Car</div>
                  <div
                    className={
                      abilities.travelToWork.car === "yes"
                        ? "fw-semibold text-success"
                        : "fw-semibold text-street-base"
                    }
                  >
                    {abilities.travelToWork.car === "yes" ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
