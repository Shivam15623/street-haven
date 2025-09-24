import React from "react";
import { Col } from "react-bootstrap";
import { Icon } from "@iconify/react";


type DashboardCardProps = {
  value: string | number; // allow number too
  label: string;
  icon: string; // Iconify icon name
  bg?: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  value,
  label,
  icon,
  bg = "bg-street-primary-100",
}) => {
  return (
    <Col sm={6} lg={3}>
      <div className={`card-box ${bg}`}>
        <div className="card-box-left">
          <h3 className="card-box-value">{value}</h3>
          <p className="card-box-label">{label}</p>
        </div>

        <div className="card-box-icon">
          <Icon icon={icon} className="icon" />
        </div>
      </div>
    </Col>
  );
};

export default DashboardCard;
