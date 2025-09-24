import React from "react";
import avatar from "@assets/images/avatar/john.jpg";
import { Icon } from "@iconify/react/dist/iconify.js";
import ImageUploader from "./ImageUploader";
import { useFetchUserProfileQuery } from "../../../../services/UserApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const PersonalInfoTab = () => {
  const { data: profile, isLoading } = useFetchUserProfileQuery();
  console.log(profile?.data);
  return (
    <div className="card">
      <div className="card-body p-16 radius-8 p-md-24  d-flex flex-column gap-20">
        <h3 className="text-lg xs:text-xl text-street-dark fw-semibold fw-semibold">
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
            <p className="text-xs xs:text-sm fw-medium">
              {profile?.data.email}
            </p>
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
            Lorem ipsum dolor sit amet consectetur. Nec pharetra eu mauris
            malesuada laoreet netus tellus. Volutpat blandit id in nulla
            facilisi etiam. Tempor vestibulum praesent neque auctor purus
            accumsan vitae. Nunc morbi sit rutrum mi amet ac cras praesent.
            Vitae porta lorem orci nec et. A vivamus tincidunt donec in viverra
            aliquet sed placerat nisl. Convallis eget id enim sit ipsum id
            tristique. Nunc pulvinar congue habitant aliquam sociis.
          </p>
        </div>

        <div className="">
          <p className="text-sm fw-medium text-street-dark mb-10">Title</p>
          <div className="border-sh-base-1-2 py-12 px-16 rounded-3 text-sm fw-normal">
            Demo
          </div>
        </div>
        <div className="">
          <p className="text-sm fw-medium text-street-dark mb-10">Hire Date</p>
          <div className="border-sh-base-1-2 py-12 px-16 rounded-3 text-sm fw-normal">
            {dayjs(profile?.data.createdAt).format("DD-MM-YYYY")}
          </div>
        </div>

        <div className="">
          <p className="text-sm fw-medium text-street-dark mb-10">
            Time Period
          </p>
          <div className="border-sh-base-1-2 py-12 px-16 rounded-3 text-sm fw-normal">
            {dayjs(profile?.data.createdAt).fromNow()}
          </div>
        </div>
        <div className="">
          <p className="text-sm fw-medium text-street-dark mb-10">Work Email</p>
          <div className="border-sh-base-1-2 py-12 px-16 rounded-3  text-sm fw-normal">
            {profile?.data.email}
          </div>
        </div>
        <div className="">
          <p className="text-sm fw-medium text-street-dark mb-10">Work Phone</p>
          <div className="border-sh-base-1-2 py-12 px-16 rounded-3 text-sm fw-normal">
            {profile?.data.phoneNo}
          </div>
        </div>
        <div>
          <p className="text-sm fw-medium text-street-dark mb-10">
            Social media
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
