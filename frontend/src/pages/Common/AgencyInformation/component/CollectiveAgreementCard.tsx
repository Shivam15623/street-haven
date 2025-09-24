import React from "react";
import CollectiveAgreementDetail from "./CollectiveAgreementDetail";
import { Icon } from "@iconify/react/dist/iconify.js";

const CollectiveAgreementCard = () => {
  const articles = [
    "Article 1: Recognition and Scope",
    "Article 2: Management Rights",
    "Article 3: Union Security",
    "Article 4: Hours of Work",
    "Article 5: Overtime and Premium Pay",
    "Article 6: Wages and Classifications",
    "Article 7: Benefits and Insurance",
    "Article 8: Vacation and Leave",
    "Article 9: Grievance Procedure",
    "Article 10: Health and Safety",
    "Article 11: Professional Development",
    "Article 12: Term of Agreement",
  ];
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12">
        <div className="d-flex flex-row justify-content-between align-items-center">
          <div className="d-flex flex-row gap-12 gap-sm-20 align-items-center">
            <div className="collective-icon w-40-px h-40-px p-8 radius-8">
              {" "}
              <Icon
                icon="iconamoon:file-document-light"
                width={24.29}
                height={24.29}
              />
            </div>
            <div className="d-flex flex-column gap-1">
              <h4 className="text-sm xs:text-lg sm:text-xl mb-0 fw-semibold text-street-dark">
                Collective Bargaining Agreement 2024-2027
              </h4>
              <div className="d-flex flex-row flex-wrap text-xxs xs:text-xs fw-normal gap-1 gap-sm-8">
                {" "}
                <span>67 pages </span>•<span>2.8 MB</span>•
                <span>Updated:1/1/2024</span>
              </div>
            </div>
          </div>
          <div className="d-none d-sm-flex flex-row gap-6 gap-sm-12">
            <CollectiveAgreementDetail />
            <button
              className="btn btn-street-primary btn-street-lg  p-8 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs"
              // onClick={onDownload}
            >
              <Icon icon="jam:download" className="text-xl" />
              Download
            </button>
          </div>
        </div>
        <div className="row row-cols-xxxl-3 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-xl-4   gy-3 gx-xl-4 gx-3">
          {articles.map((article) => (
            <div className="col">
              {" "}
              <div className="border-0-5 border-street-base text-street-dark text-xs sm:text-sm fw-semibold radius-12 bg-base h-100 p-16 p-sm-20 p-md-24">
                {article}
              </div>
            </div>
          ))}
        </div>
        <hr className="d-sm-none d-block" />
        <div className="d-flex d-sm-none flex-row justify-content-end gap-8 gap-sm-12">
          <CollectiveAgreementDetail />
          <button
            className="btn btn-street-primary btn-street-lg  p-8 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs"
            // onClick={onDownload}
          >
            <Icon icon="jam:download" className=" text-md sm:text-xl" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectiveAgreementCard;
