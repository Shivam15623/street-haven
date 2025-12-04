import React from "react";
import { Form } from "react-bootstrap";
import { type FormikValues } from "formik";

import NestedCheckboxGroup from "./NestedCheckboxGroup";
import CheckboxWithDetails from "./CheckBoxWithDetails";
import AbilityBlock from "./AbiltyBlock";

interface AbilitiesRestrictionsProps {
  values: FormikValues;
  setFieldValue: (field: string, value: any) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  touched: any;
  errors: any;
  HandFields: { label: string; value: string }[];
  travelWorkField: { key: string; label: string }[];
}

const AbilitiesRestrictions: React.FC<AbilitiesRestrictionsProps> = ({
  values,
  setFieldValue,
  handleChange,
  touched,
  errors,
  HandFields,
  travelWorkField,
}) => {
  if (values.returnToWorkStatus !== "withRestrictions") return null;

  return (
    <div className="card">
      <div className="card-body d-flex flex-column gap-20 px-24 py-16">
        {/* Section E Title */}
        <h3 className="text-xl text-street-dark fw-semibold mb-0">
          E. Abilities and/or Restrictions
        </h3>

        {/* Abilities Section */}
        <p className="text-xs text-street-dark fw-normal">
          1. Please indicate Abilities that apply. Include additional details in
          section 3
        </p>
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3">
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

        <hr style={{ backgroundColor: "#00000033" }} />

        {/* Restrictions Section */}
        <p className="text-xs text-street-dark fw-normal">
          2. Please indicate Restrictions that apply. Include additional details
          in section 3
        </p>
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3">
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
              {values.restrictions.limitedUseOfHands.checked &&
                HandFields.map((field) => (
                  <div
                    key={field.label}
                    className="d-flex align-items-center text-xs justify-content-between my-2"
                    style={{ width: "260px" }}
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
                    <span className="text-center flex-grow-1">
                      {field.label}
                    </span>
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

        {/* Additional Comments */}
        <hr style={{ backgroundColor: "#00000033" }} />
        <Form.Group className="d-flex flex-column gap-2 mb-3">
          <Form.Label className="text-xs text-street-dark fw-normal">
            3. Additional Comments on Abilities and/or Restrictions
          </Form.Label>
          <Form.Control
            style={{ height: "40px" }}
            name="commentsOnAbilities"
            value={values.commentsOnAbilities}
            onChange={handleChange}
          />
          {touched.commentsOnAbilities && errors.commentsOnAbilities && (
            <div className="text-danger text-sm">
              {errors.commentsOnAbilities}
            </div>
          )}
        </Form.Group>

        {/* Assessment Duration */}
        <hr style={{ backgroundColor: "#00000033" }} />
        <Form.Group className="d-flex flex-column gap-2 mb-3">
          <Form.Label className="text-xs text-street-dark fw-normal">
            4. From the date of this assessment, the above will apply for
            approximately
          </Form.Label>
          <div className="d-flex flex-row gap-20 align-items-center">
            {[
              { label: "1-2 days", value: "1-2 days" },
              { label: "3-7 days", value: "3-7 days" },
              { label: "8-14 days", value: "8-14 days" },
              { label: "14+ days", value: "14+ days" },
            ].map((opt) => (
              <div key={opt.label} className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={values.assessmentDuration === opt.value}
                  onChange={() =>
                    setFieldValue(
                      "assessmentDuration",
                      values.assessmentDuration === opt.value ? "" : opt.value
                    )
                  }
                  className="form-check-input"
                />
                <span className="text-xs">{opt.label}</span>
              </div>
            ))}
          </div>
        </Form.Group>

        {/* Return to Work Discussion */}
        <hr style={{ backgroundColor: "#00000033" }} />
        <Form.Group className="d-flex flex-column gap-2 mb-3">
          <Form.Label className="text-xs text-street-dark fw-normal">
            5. Have you discussed return to work with your patient?
          </Form.Label>

          <div className="d-flex flex-row gap-20 align-items-center">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <div key={opt.label} className="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="isDiscussRTWtoPatient"
                  value={String(opt.value)}
                  checked={values.isDiscussRTWtoPatient === opt.value}
                  onChange={() =>
                    setFieldValue("isDiscussRTWtoPatient", opt.value)
                  }
                  className="form-check-input"
                />
                <span className="text-xs">{opt.label}</span>
              </div>
            ))}
          </div>
        </Form.Group>
      </div>
    </div>
  );
};

export default AbilitiesRestrictions;
