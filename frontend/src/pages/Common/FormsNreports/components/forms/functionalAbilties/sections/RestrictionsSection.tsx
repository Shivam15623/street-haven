import React from "react";
import NestedCheckboxGroup from "../../../NestedCheckboxGroup";
import CheckboxWithDetails from "../../../CheckBoxWithDetails";
import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import { Form } from "react-bootstrap";
import type { FunctionalAbilityFormValues } from "../../FunctionalAbiltiesForm";
const HandFields: Array<{
  label: string;
  value: "gripping" | "pinching" | "other";
}> = [
  { label: "Gripping", value: "gripping" },
  { label: "Pinching", value: "pinching" },
  { label: "Other", value: "other" },
];

interface SectionProps {
  values: FunctionalAbilityFormValues;
  errors: FormikErrors<FunctionalAbilityFormValues>;
  touched: FormikTouched<FunctionalAbilityFormValues>;
  handleChange: FormikHandlers["handleChange"];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean
  ) => void;
}

const RestrictionsSection: React.FC<SectionProps> = ({
  errors,
  handleChange,

  setFieldValue,
  touched,
  values,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      <h2 className="text-lg fw-semibold text-street-dark">
        Work Restrictions
      </h2>

      <div className="row row-cols-1  row-cols-lg-2 g-3">
        {/* Use CheckboxWithDetails for all single checkbox restrictions */}
        {[
          {
            label: "Bending/twisting repetitive movement of (please specify)",
            fieldPath: "bendingTwisting",
          },
          {
            label: "Work at or above shoulder activity",
            fieldPath: "workAboveShoulder",
          },
          { label: "Chemical exposure to", fieldPath: "chemicalExposure" },
          {
            label:
              "Environmental exposure to: (e.g. heat, cold, noise or scents)",
            fieldPath: "environmentalExposure",
          },
          {
            label: "Operating motorized equipment: (e.g. forklift)",
            fieldPath: "operatingMotorizedEquipment",
          },
          {
            label:
              "Potential side effects from medications (please specify) Do not include names of medications.",
            fieldPath: "medicationSideEffects",
          },
        ].map((item) => (
          <CheckboxWithDetails
            key={item.fieldPath}
            label={item.label}
            fieldPath={item.fieldPath}
            values={values}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
            errors={errors}
            touched={touched}
          />
        ))}

        {/* Limited Use of Hands */}
        <div className="col">
          <Form.Group className="d-flex flex-column gap-2">
            <label className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={values.restrictions.limitedUseOfHands.checked}
                onChange={(e) =>
                  setFieldValue(
                    "restrictions.limitedUseOfHands.checked",
                    e.target.checked
                  )
                }
              />
              <span className="text-xs ">Limited Use Of Hands</span>
            </label>
            <div className="d-flex align-items-center text-xs justify-content-between my-2">
              <span>Left</span>
              <span className="flex-grow-1"> </span>
              <span>Right</span>
            </div>

            {values.restrictions.limitedUseOfHands.checked &&
              HandFields.map((field) => (
                <div
                  key={field.label}
                  className="d-flex align-items-center text-xs justify-content-between my-2"
                >
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                      values.restrictions.limitedUseOfHands.left[field.value]
                    }
                    onChange={(e) =>
                      setFieldValue(
                        `restrictions.limitedUseOfHands.left.${field.value}`,
                        e.target.checked
                      )
                    }
                  />
                  <span className="text-center flex-grow-1">{field.label}</span>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                      values.restrictions.limitedUseOfHands.right[field.value]
                    }
                    onChange={(e) =>
                      setFieldValue(
                        `restrictions.limitedUseOfHands.right.${field.value}`,
                        e.target.checked
                      )
                    }
                  />
                </div>
              ))}
          </Form.Group>
        </div>

        {/* Nested Checkbox Groups */}
        <NestedCheckboxGroup
          label="Limited Pushing / Pulling"
          fieldPath="limitedPushingPulling"
          options={[
            { label: "Left Arm", value: "leftArm" },
            { label: "Right Arm", value: "rightArm" },
            { label: "Other", value: "other" },
          ]}
          values={values}
          setFieldValue={setFieldValue}
        />
        <NestedCheckboxGroup
          label="Exposure to Vibration"
          fieldPath="exposureToVibration"
          options={[
            { label: "Whole Body", value: "wholeBody" },
            { label: "Hand/Arm", value: "handArm" },
          ]}
          values={values}
          setFieldValue={setFieldValue}
        />
      </div>
    </div>
  );
};

export default RestrictionsSection;
