import React from "react";
import DataTable from 'react-data-table-component';
type DataTableProps = {
    data: { [key: string]: any }[]; // Array of objects with dynamic keys
};
type RowData = { [key: string]: any };

const DataTables: React.FC<DataTableProps> = ({ data }) => {
    const columns = Object.keys(data[0]).map((key) => ({
        name: key.replace("_", " ").toUpperCase(), // Format key names (e.g., "first_name" -> "FIRST NAME")
        selector: (row: RowData) => row[key], // Access the value dynamically
        sortable: true, // Make columns sortable
    }));
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
