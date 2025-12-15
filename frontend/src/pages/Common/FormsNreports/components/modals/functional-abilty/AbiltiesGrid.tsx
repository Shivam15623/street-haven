import { Icon } from "@iconify/react";
import type { Abilites } from "../../../../../../services/FormApi";

interface AbilitiesGridProps {
  abilities?: Abilites;
  className?: string;
}
type AbilityOption = {
  label: string;
  value: string;
};

function getSelectedLabel(value: string | undefined, options: AbilityOption[]) {
  if (!value) return "None";
  return options.find((o) => o.value === value)?.label ?? value;
}
type AbilityField =
  | "walking"
  | "standing"
  | "sitting"
  | "liftingFloorToWaist"
  | "liftingWaistToShoulder"
  | "stairClimbing"
  | "ladderClimbing";

type AbilityConfig = {
  label: string;
  fieldPath: AbilityField;
  icon: string;
  options: AbilityOption[];
};

const abilityConfigs: AbilityConfig[] = [
  {
    label: "Walking",
    fieldPath: "walking",
    icon: "mdi:walk",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "Up to 100 metres", value: "upto100" },
      { label: "100 - 200 metres", value: "100to200" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Standing",
    fieldPath: "standing",
    icon: "mdi:human-male",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "Up to 15 minutes", value: "upto15" },
      { label: "15 - 30 minutes", value: "15to30" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Sitting",
    fieldPath: "sitting",
    icon: "mdi:seat-passenger",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "Up to 30 minutes", value: "upto30" },
      { label: "30 - 60 minutes", value: "30to60" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Lifting (Floor to Waist)",
    fieldPath: "liftingFloorToWaist",
    icon: "mdi:arrow-up-bold",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "Up to 5 kg", value: "upto5kg" },
      { label: "5 - 10 kg", value: "5to10kg" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Lifting (Waist to Shoulder)",
    fieldPath: "liftingWaistToShoulder",
    icon: "mdi:arrow-down-bold",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "Up to 5 kg", value: "upto5kg" },
      { label: "5 - 10 kg", value: "5to10kg" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Stair Climbing",
    fieldPath: "stairClimbing",
    icon: "mdi:stairs-up",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "Up to 5 steps", value: "upto5steps" },
      { label: "5 - 10 steps", value: "5to10steps" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Ladder Climbing",
    fieldPath: "ladderClimbing",
    icon: "mdi:ladder",
    options: [
      { label: "Full abilities", value: "fullAbilities" },
      { label: "1 to 3 steps", value: "1to3steps" },
      { label: "4 - 6 steps", value: "4to6steps" },
      { label: "Other", value: "other" },
    ],
  },
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
    <div className={`${className} d-flex flex-column gap-10 `}>
      {/* Physical Abilities */}
      <div className="row g-3">
        {abilityConfigs.map(({ label, fieldPath, icon, options }) => {
          const value = abilities[fieldPath];

          const displayLabel = getSelectedLabel(value, options);
          return (
            <div key={fieldPath} className="col-6 col-sm-4 col-lg-3">
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
                    className="text-street-primary"
                  />
                </div>

                <div className="text-street-base small fw-medium mb-1">
                  {label}
                </div>

                <div className="fw-bold">{displayLabel || "—"}</div>
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
                    className="text-street-primary"
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
                    className="text-street-primary"
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
