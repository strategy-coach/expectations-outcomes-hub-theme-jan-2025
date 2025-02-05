import React from "react";
import DataTable from 'react-data-table-component';
type DataTableProps = {
    data: { [key: string]: any }[]; // Array of objects with dynamic keys
};
type RowData = { [key: string]: any };

const DataTables: React.FC<DataTableProps> = ({ data }) => {
    const columns = Object.keys(data[0])
        .filter((key) => key !== "isDetail") // Exclude 'isDetail' key
        .map((key) => ({
            name: key.replace(/_/g, " ").toUpperCase(), // Format key names (e.g., "first_name" -> "FIRST NAME")
            selector: (row: RowData) => {
                if (key === "detail_link" && row.isDetail) {
                    // Only show the link if isDetail is true
                    const link = row[key];
                    delete row.isDetail;  // Remove the isDetail key after checking
                    return <a href={link} rel="noopener noreferrer">View</a>;
                }
                return row[key]; // Access other values dynamically
            },
            sortable: true, // Make columns sortable
        }));
    // Remove null entries (like isDetail)
    return (
        <>
            <DataTable
                pagination
                columns={columns}
                data={data}
            />
        </>
    );
};

export default DataTables;
