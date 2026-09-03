import ImageUploader from "./ImageUploader";
import { useFetchUserProfileQuery } from "../../../../services/UserApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Spinner } from "react-bootstrap"; // import Bootstrap Spinner

dayjs.extend(relativeTime);

const PersonalInfoTab = () => {
  const { data: profile, isLoading } = useFetchUserProfileQuery();

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body p-16 radius-8 p-md-24  d-flex flex-column gap-20">
        <h3 className="text-lg xs:text-xl text-street-dark fw-semibold">
          Personal Information
        </h3>

        <div className="d-flex px-3 flex-column flex-sm-row gap-1 gap-sm-3 align-items-sm-center">
          <div className="position-relative w-100-px h-100-px radius-50">
            <img
              src={profile?.data.profilePic ?? "assets/images/userlogo.png"}
              className="w-100 h-100 rounded-circle object-fit-cover"
              alt="Avatar"
            />
            <ImageUploader />
          </div>

          <div className="d-flex flex-column gap-1">
            <h5 className="text-lg xs:text-xl text-street-dark fw-semibold mb-0">
              {profile?.data.firstname} {profile?.data.lastname}
            </h5>
            <p className="text-xs xs:text-sm fw-medium">
              {profile?.data.email}
            </p>
          </div>
        </div>

        {/* Other info fields */}
        <InfoField label="Job Title" value={profile?.data.title ?? "---"} />
        <InfoField
          label="Status"
          value={profile?.data.status === "inactive" ? "Inactive" : "Active"}
        />
        <InfoField
          label="Hire Date"
          value={dayjs(profile?.data.hireDate).format("DD-MM-YYYY")}
        />
        <InfoField label="Work Email" value={profile?.data.email ?? "---"} />
        <InfoField label="Work Phone" value={profile?.data.phoneNo ?? "---"} />
      </div>
    </div>
  );
};

// Small reusable component for info fields
const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="">
    <p className="text-sm fw-medium text-street-dark mb-10">{label}</p>
    <div className="border-sh-base-1-2 py-12 px-16 rounded-3 text-sm fw-normal">
      {value}
    </div>
  </div>
);

export default PersonalInfoTab;
