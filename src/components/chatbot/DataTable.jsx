// components/DataTable.jsx
"use client";
import { useRef } from "react";
import { useDownloadExcel } from "react-export-table-to-excel";
import styles from "./DataTable.module.css";

const DataTable = ({ headers, data, title }) => {
  const tableRef = useRef(null);

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: `${title.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}`,
    sheet: title,
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p><strong>{title}</strong></p>
        <button onClick={onDownload} className={styles.exportButton}>
          Export to Excel
        </button>
      </div>
      <table ref={tableRef} className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;