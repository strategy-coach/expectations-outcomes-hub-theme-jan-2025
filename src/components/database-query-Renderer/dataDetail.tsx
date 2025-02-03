import React from "react";


type DataTableProps = {
    data: { [key: string]: any }[];
};

const DataDetail: React.FC<DataTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p>No data available</p>;
    }

    const detail = data[0]; // Assuming there's only one detail object

    return (
        <div className="container">
            <button className="back-button" onClick={() => window.history.back()}>
                ← Back
            </button>
            <table className="detail-table">
                <tbody>
                    {Object.entries(detail).map(([key, value]) => (
                        <tr key={key}>
                            <th>{key}</th>
                            <td>
                                {String(value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataDetail;