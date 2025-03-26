import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { SortDirection } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { DeleteUser } from "../../services/zitadel.services.ts";


type DataItem = Record<string, string | null | undefined>;


interface DefaultColDefType {
  sortable?: boolean;
  sort?: SortDirection;
}

interface Props {
  rowData: DataItem[];
  path?: string;
  connection?: string;
  autoStyle?: boolean;
  filter?: boolean;
  page?: string;
  isClick?: boolean;
  defaultColDef?: DefaultColDefType;
}
const AgGridComponent: React.FC<Props> = ({
  rowData,
  connection,
  filter,
  defaultColDef,
}) => {

  const [data, setData] = useState(rowData)
  const [activeFilter, setActiveFilter] = useState<string | null>()

  const filterData = (level: string) => {
    let filteredData = rowData;
    if (level === activeFilter) {
      setData(rowData);
      setActiveFilter("");
    } else {
      if (connection === "sqlmap") {
        filteredData = rowData.filter((data) => data.level === level);
      } else if (connection === "zap") {
        filteredData = rowData.filter((data) => data["Risk Level"]?.split('(')[0].trim() === level);
      }

      setData(filteredData);
      setActiveFilter(level);
    }
  };


  const columnDefs =
    rowData?.length > 0
      ? Object.keys(rowData[0]).map((key: string) => ({
        headerName: key === "user-list-userId" ? "Delete User" : String(key).toUpperCase().replaceAll("_", " "),
        field: key,
        cellRenderer: (params: any) => {
          if (key === "user-list-userId") {
            const name = params.data["display name"];
            return (
              // deno-lint-ignore jsx-button-has-type
              <button className="" onClick={() => handleDeleteConfirmation(params.value, name)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            );
          }
          return params.value; // Return the actual value for other fields
        },
      }))
      : [];



  const handleDeleteConfirmation = async (
    id: string,
    name: string
  ): Promise<void> => {
    const isConfirmed = globalThis.confirm(
      `Are you sure you want to delete the user ${name}?`,
    );

    if (isConfirmed) {
      await DeleteUser(id);
      const event = new CustomEvent("delete-user", {
        detail: {
          description: "Delete User",
        },
      });
      document.dispatchEvent(event);
    }
    const currentWindow: Window = window;
    currentWindow.location.reload();
  };



  const paginationPageSize = 10;


  const exportData = () => {
    const params = {
      fileName: "exportedData",
    };

    const gridApi = gridRef.current.api;

    gridApi.exportDataAsCsv(params);
  };

  const gridRef = React.useRef<any>(null);


  return (
    <div>

      {filter && connection == "zap" && <div className="flex gap-4">
        <div
          onClick={() => filterData("High")}
          className={`border cursor-pointer rounded-md w-24 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "High" ? "bg-red-500 text-white" : "bg-gray-200 text-black"}
    `}>
          High
        </div>
        <div
          onClick={() => filterData("Medium")}
          className={`border cursor-pointer rounded-md w-24 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "Medium" ? "bg-orange-500 text-white" : "bg-gray-200 text-black"}
    `}>
          Medium
        </div>
        <div
          onClick={() => filterData("Low")}
          className={`border cursor-pointer rounded-md w-24 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "Low" ? "bg-yellow-400 text-white" : "bg-gray-200 text-black"}
    `}>
          Low
        </div>
        <div
          onClick={() => filterData("Informational")}
          className={`border cursor-pointer rounded-md w-32 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "Informational" ? "bg-blue-700 text-white" : "bg-gray-200 text-black"}
    `}>
          Informational
        </div>
      </div>
      }

      {filter && connection == "sqlmap" &&
        <div className="flex gap-4">
          <div
            onClick={() => filterData("INFO")}
            className={`border cursor-pointer rounded-md w-24 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "INFO" ? "bg-green-600 text-white" : "bg-gray-200 text-black"}
    `}>
            Info
          </div>
          <div
            onClick={() => filterData("CRITICAL")}
            className={`border cursor-pointer rounded-md w-24 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "CRITICAL" ? "bg-red-500 text-white" : "bg-gray-200 text-black"}
    `}>
            Critical
          </div>
          <div
            onClick={() => filterData("WARNING")}
            className={`border cursor-pointer rounded-md w-24 h-10 flex items-center justify-center font-semibold text-sm
      ${activeFilter === "WARNING" ? "bg-orange-500 text-white" : "bg-gray-200 text-black"}
    `}>
            Warning
          </div>
        </div>
      }

      <button
        type="button"
        onClick={exportData}
        className="mt-3 mb-4 relative inline-flex items-center gap-x-1.5 rounded bg-black px-5 py-2 font-normal text-white ring-1 ring-inset ring-black hover:bg-black focus:z-10 text-base"
      >


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
            columnDefs={columnDefs}
            autoSizeStrategy={
              { type: "fitGridWidth" }
            }
            rowData={data}
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
