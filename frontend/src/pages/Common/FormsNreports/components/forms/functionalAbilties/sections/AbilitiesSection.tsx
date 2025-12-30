import type { FormikErrors, FormikHandlers, FormikTouched } from "formik";
import React from "react";
import AbilityBlock from "../../../AbiltyBlock";
import { Form } from "react-bootstrap";
import type { FunctionalAbilityFormValues } from "../../FunctionalAbiltiesForm";

const travelWorkField: Array<{ label: string; key: "publicTransit" | "car" }> =
  [
    {
      key: "publicTransit",
      label: "Ability to use public transit",
    },
    { key: "car", label: "Ability to drive a car" },
  ];
interface SectionProps {
  values: FunctionalAbilityFormValues;
  errors: FormikErrors<FunctionalAbilityFormValues>;
  touched: FormikTouched<FunctionalAbilityFormValues>;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean
  ) => void;
}

const AbilitiesSection: React.FC<SectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      {" "}
      <h2 className="text-lg fw-semibold text-street-dark">
        Functional Abilties
      </h2>
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-3 g-4">
        {[
          {
            label: "Walking",
            fieldPath: "walking",
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
            options: [
              { label: "Full abilities", value: "fullAbilities" },
              { label: "Up to 30 minutes", value: "upto30" },
              { label: "30 - 60 minutes", value: "30to60" },
              { label: "Other", value: "other" },
            ],
          },
          {
            label: "Lifting Floor to Waist",
            fieldPath: "liftingFloorToWaist",
            options: [
              { label: "Full abilities", value: "fullAbilities" },
              { label: "Up to 5 kg", value: "upto5kg" },
              { label: "5 - 10 kg", value: "5to10kg" },
              { label: "Other", value: "other" },
            ],
          },
          {
            label: "Lifting Waist to Shoulder",
            fieldPath: "liftingWaistToShoulder",
            options: [
              { label: "Full abilities", value: "fullAbilities" },
              { label: "Up to 5 kg", value: "upto5kg" },
              { label: "5 - 10 kg", value: "5to10kg" },
              { label: "Other", value: "other" },
            ],
          },
          {
            label: "Stair climbing",
            fieldPath: "stairClimbing",
            options: [
              { label: "Full abilities", value: "fullAbilities" },
              { label: "Up to 5 steps", value: "upto5steps" },
              { label: "5 - 10 steps", value: "5to10steps" },
              { label: "Other", value: "other" },
            ],
          },
          {
            label: "Ladder climbing",
            fieldPath: "ladderClimbing",
            options: [
              { label: "Full abilities", value: "fullAbilities" },
              { label: "1 to 3 steps", value: "1to3steps" },
              { label: "4 - 6 steps", value: "4to6steps" },
              { label: "Other", value: "other" },
            ],
          },
        ].map((item) => (
          <AbilityBlock
            key={item.fieldPath}
            label={item.label}
            fieldPath={item.fieldPath}
            values={values}
            setFieldValue={setFieldValue}
            handleChange={handleChange}
            options={item.options}
            errors={errors}
            touched={touched}
          />
        ))}

        {/* Travel to Work */}
        <div className="col">
          <Form.Group className="d-flex flex-column gap-10">
            <Form.Label className="fw-medium">Travel to work</Form.Label>
            <div className="d-flex flex-row gap-8">
              {travelWorkField.map((item) => (
                <div key={item.key} className="d-flex flex-column gap-1">
                  <span className="text-xs xs:text-sm fw-medium">
                    {item.label}
                  </span>
                  <div className="d-flex flex-column gap-3">
                    {["yes", "no"].map((val) => (
                      <label
                        key={val}
                        className="d-flex align-items-center text-xs gap-1"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={
                            values.abilities.travelToWork[item.key] === val
                          }
                          onChange={() =>
                            setFieldValue(
                              `abilities.travelToWork.${item.key}`,
                              values.abilities.travelToWork[item.key] === val
                                ? ""
                                : val
                            )
                          }
                        />
                        {val.charAt(0).toUpperCase() + val.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Form.Group>
        </div>
      </div>
    </div>
  );
};

export default AbilitiesSection;
