import React from "react";

const SecurityReportButton: React.FC = () => {
  const openReport = () => {
    window.open(
      "/securityreportdetails",
      "_blank",
      "width=800,height=600,scrollbars=yes"
    );
  };

  return (
    <button className="font-semibold text-[#028db7]" onClick={openReport}>
      Read the Penetration Testing Report
    </button>
  );
};

export default SecurityReportButton;
