import avatar from "@assets/images/avatar/john.jpg";
import { Icon } from "@iconify/react/dist/iconify.js";
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
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
              src={profile?.data.profilePic ?? avatar}
              className="w-100 h-100 rounded-circle object-fit-cover"
              alt="Avatar"
            />
            <ImageUploader />
          </div>

          <div className="d-flex flex-column gap-1">
            <h5 className="text-lg xs:text-xl text-street-dark fw-semibold mb-0">
              {profile?.data.firstname} {profile?.data.lastname}
            </h5>
            <p className="text-xs xs:text-sm fw-medium">{profile?.data.email}</p>
          </div>
        </div>

        <div className="border-sh-base-1-2 h-120-px overflow-auto rounded-3 py-12 ps-16 pe-24 position-relative">
          <Icon
            icon="tabler:edit"
            width={20}
            height={20}
            className="position-absolute z-3 top-4 end-4"
          />
          <p className="text-sm fw-normal">
            Lorem ipsum dolor sit amet consectetur. Nec pharetra eu mauris malesuada laoreet netus tellus...
          </p>
        </div>

        {/* Other info fields */}
        <InfoField label="Title" value="Demo" />
        <InfoField label="Hire Date" value={dayjs(profile?.data.createdAt).format("DD-MM-YYYY")} />
        <InfoField label="Time Period" value={dayjs(profile?.data.createdAt).fromNow()} />
        <InfoField label="Work Email" value={profile?.data.email??"---"} />
        <InfoField label="Work Phone" value={profile?.data.phoneNo??"---"} />
        <InfoField label="Social media" value="—" />
      </div>
    </div>
  );
};

// Small reusable component for info fields
const InfoField = ({ label, value }:{label:string,value:string}) => (
  <div className="">
    <p className="text-sm fw-medium text-street-dark mb-10">{label}</p>
    <div className="border-sh-base-1-2 py-12 px-16 rounded-3 text-sm fw-normal">{value}</div>
  </div>
);

export default PersonalInfoTab;
