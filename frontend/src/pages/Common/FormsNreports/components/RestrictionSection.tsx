import { RestrictionCheckbox } from "./RestrictionCheckbox";

import { VibrationFields } from "./VibrationFields";
import { HandUseFields } from "./HandUseFields";
import { NestedPushPullFields } from "./NestedPushPullFields";
export interface RestrictionsValues {
  bendingTwisting: boolean;
  workAboveShoulder: boolean;

  chemicalExposure: boolean;
  environmentalExposure: boolean;

  limitedPushingPulling: {
    checked: boolean;
    leftArm: boolean;
    rightArm: boolean;
    other: boolean;
    otherText: string;
  };

  operatingMotorizedEquipment: boolean;

  medicationSideEffects: boolean;

  exposureToVibration: {
    checked: boolean;
    type: string;
  };

  limitedUseOfHands: {
    checked: boolean;
    left: boolean;
    right: boolean;
    other: boolean;
    otherText: string;
  };
}

export interface RestrictionsSectionProps {
  values: RestrictionsValues;
  setFieldValue: (field: string, value: unknown) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default function RestrictionsSection({
  values,
  setFieldValue,
  handleChange,
}: RestrictionsSectionProps) {
  return (
    <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3">
      {/* 1. BENDING / TWISTING */}
      <div className="col">
        <RestrictionCheckbox
          label="Bending/twisting repetitive movement (specify)"
          checked={values.bendingTwisting}
          onChange={(v) => setFieldValue("restrictions.bendingTwisting", v)}
        />
      </div>

      {/* 2. WORK ABOVE SHOULDER */}
      <div className="col">
        <RestrictionCheckbox
          label="Work at or above shoulder activity"
          checked={values.workAboveShoulder}
          onChange={(v) => setFieldValue("restrictions.workAboveShoulder", v)}
        />
      </div>

      {/* 3. CHEMICAL EXPOSURE */}
      <div className="col">
        <RestrictionCheckbox
          label="Chemical exposure to"
          checked={values.chemicalExposure}
          onChange={(v) =>
            setFieldValue("restrictions.chemicalExposure.checked", v)
          }
        />
      </div>

      {/* 4. ENVIRONMENTAL EXPOSURE */}
      <div className="col">
        <RestrictionCheckbox
          label="Environmental exposure (heat, cold, noise, scents)"
          checked={values.environmentalExposure}
          onChange={(v) =>
            setFieldValue("restrictions.environmentalExposure.checked", v)
          }
        />
      </div>

      {/* 5. LIMITED PUSHING / PULLING */}
      <div className="col">
        <RestrictionCheckbox
          label="Limited Pushing / Pulling"
          checked={values.limitedPushingPulling.checked}
          onChange={(v) =>
            setFieldValue("restrictions.limitedPushingPulling.checked", v)
          }
        >
          {/* Nested fields */}
          <NestedPushPullFields
            values={values}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
          />
        </RestrictionCheckbox>
      </div>

      {/* 6. OPERATING MOTORIZED EQUIPMENT */}
      <div className="col">
        <RestrictionCheckbox
          label="Operating motorized equipment (e.g. forklift)"
          checked={values.operatingMotorizedEquipment}
          onChange={(v) =>
            setFieldValue("restrictions.operatingMotorizedEquipment", v)
          }
        />
      </div>

      {/* 7. MEDICATION SIDE EFFECTS */}
      <div className="col">
        <RestrictionCheckbox
          label="Potential medication side effects (no names)"
          checked={values.medicationSideEffects}
          onChange={(v) =>
            setFieldValue("restrictions.medicationSideEffects.checked", v)
          }
        />
      </div>

      {/* 8. EXPOSURE TO VIBRATION */}
      <div className="col">
        <RestrictionCheckbox
          label="Exposure to vibration"
          checked={values.exposureToVibration.checked}
          onChange={(v) =>
            setFieldValue("restrictions.exposureToVibration.checked", v)
          }
        >
          <VibrationFields values={values} setFieldValue={setFieldValue} />
        </RestrictionCheckbox>
      </div>

      {/* 9. LIMITED USE OF HANDS */}
      <div className="col">
        <RestrictionCheckbox
          label="Limited use of hands"
          checked={values.limitedUseOfHands.checked}
          onChange={(v) =>
            setFieldValue("restrictions.limitedUseOfHands.checked", v)
          }
        >
          <HandUseFields
            values={values}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
          />
        </RestrictionCheckbox>
      </div>
    </div>
  );
}
