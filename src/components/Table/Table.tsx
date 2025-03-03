import React from "react";
import "./Table.css";
import type { IList } from "@/types";

const Table = ({ list }: { list: IList }): JSX.Element => {
  return (
    <table class="border-collapse border border-gray-300 dark:border-gray-600 w-full">
      <thead>
        <tr>
          <th>Index</th>
          {list?.keys.map((key) => <th key={key}>{key}</th>)}
        </tr>
      </thead>
      <tbody>
        {list?.array?.map((value: Record<string, string>, index: number) => (
          <tr key={index}>
            <td>{index}</td>
            {list.keys.map((key) => (
              <td key={key}>{value[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default Table;
