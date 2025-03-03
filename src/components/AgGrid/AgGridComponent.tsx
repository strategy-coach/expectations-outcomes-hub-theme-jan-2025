import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { SortDirection } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { RowClickedEvent } from "ag-grid-community";
//import type { NoDataList } from "../../../lib/native/portfolio/portfolioServices";
//import DetailPage from "../policies/detailPage/detailPage";
//import toolTipJson from "@/components/native/tooltip/on_screen_tooltip_information.json";
//import { getToolTipMessage } from "support/services/service";
//import ToolTipComponent from "../tooltip/toolTipComponent";

type DataItem = Record<string, string | null | undefined>;

interface ParamsType {
  data: {
    Issues: number;
    url: string;
    Description: string;
    title: string;
  };
  value: number;
}

interface DefaultColDefType {
  sortable?: boolean;
  sort?: SortDirection;
}

interface Props {
  rowData: DataItem[] ;
  path?: string;
  autoStyle?: boolean;
  page?: string;
  isClick?: boolean;
  defaultColDef?: DefaultColDefType;
}
interface EventData {
  name?: string;
  person_name?: string;
  // Add other properties as needed
}
const AgGridComponent: React.FC<Props> = ({
  rowData,
  path,
  autoStyle,
  page,
  isClick,
  defaultColDef,
}) => {
  //const [detailPage, setDetailPage] = useState();
  
  const columnDefs =
  rowData?.length > 0
    ? Object.keys(rowData[0])
        .filter(
          (key) =>
            key !== "tag" &&
            key !== "organization_id" &&
            key !== "asset_service_type_id" &&
            key !== "url",
        )
        .map((key: string) => ({
          headerName: String(key).toUpperCase().replaceAll("_", " "),
          field: key,
          cellRenderer: (params: ParamsType) =>
            key === "Issues" ? (
              <a
                href={`${params.data.url.replace(
                  "api.github.com/repos",
                  "github.com",
                )}`}
                target="_blank"
              >
                {"#" + params.data.Issues}
              </a>
            ) : (
              params.value
            ),
        }))
    : []; // ✅ If rowData is empty, return an empty array


  const paginationPageSize = 10;

  const gridOptions = {
    onRowClicked: (event: RowClickedEvent) => handleclick(event),
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function handleclick(event: RowClickedEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

    // if (page == "policies") {
    //   setDetailPage(event.data);
    // } else {
      const name =
        (event.data as EventData)?.name ??
        (event.data as EventData)?.person_name
          ?.replaceAll(" ", "-")
          .toLowerCase();

      window.location.href = `${path}/${name}`;
    //}
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const exportData = () => {
    const params = {
      fileName: "exportedData",
      // Customize other export options as needed
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const gridApi = gridRef.current.api;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    gridApi.exportDataAsCsv(params);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridRef = React.useRef<any>(null);

  return (
    <div>
      <button
        type="button"
        onClick={exportData}
        className="mt-3 mb-4 relative inline-flex items-center gap-x-1.5 rounded bg-black px-5 py-2 font-normal text-white ring-1 ring-inset ring-black hover:bg-black focus:z-10 text-base"
      >
        {/* <ToolTipComponent
          text="Export Data"
          message={getToolTipMessage(
            "export data button",
            toolTipJson.portfolio.porfolioAssetTooltip,
          )}
        /> */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          ></path>
        </svg>
      </button>
      
     
      <div className="ag-theme-alpine">
        {
          <AgGridReact
            gridOptions={ gridOptions }
            columnDefs={columnDefs}
            autoSizeStrategy={
              autoStyle ?? false ? { type: "fitGridWidth" } : undefined
            }
            rowData={rowData}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={paginationPageSize}
            ref={gridRef}
            defaultColDef={defaultColDef}
          />
        }
        
      </div>
    </div>
  );
};

export default AgGridComponent;
