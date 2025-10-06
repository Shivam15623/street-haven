import React from "react";
import { Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";


type DashboardCardProps = {
  value: string | number; // allow number too
  label: string;
  icon: string; // Iconify icon name
  bg?: string;
  link?:string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  value,
  label,
  icon,
  link="#",
  bg = "bg-street-primary-100",
}) => {
  const navigate=useNavigate()
  return (
    <Col sm={6} lg={4}>
      <div onClick={()=>navigate(link)} className={`card-box cursor-pointer ${bg}`}>
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
