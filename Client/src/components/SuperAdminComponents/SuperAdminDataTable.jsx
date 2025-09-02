import React, { useState, useEffect, useMemo } from "react";
import casesData from "../../JsonData/DataTable.json";
import SuperAdminApplicationTable from "./SuperAdminApplicationTable";
import SuperAdminFilterHeader from "./SuperAdminFilterHeader";
import ViewDetails from "./ViewDetails";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SuperAdminDataTable = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const filteredCases = useMemo(() => {
    return casesData.filter((c) => {
      const matchStatus = !selectedStatus || c.status === selectedStatus;
      const matchDepartment = !selectedDepartment || c.concernedOfficer.includes(selectedDepartment);
      // Remove source filter if not present in JSON, or add logic if source is added later
      // const matchSource = !selectedSource || c.addAt === selectedSource;
      const matchBlock = !selectedBlock || c.gpBlock === selectedBlock;
      const matchDate = !selectedDate || c.dateOfApplication === selectedDate;
      const matchSearch =
        c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchStatus &&
        matchDepartment &&
        // matchSource &&
        matchBlock &&
        matchDate &&
        matchSearch
      );
    });
  }, [
    selectedStatus,
    selectedDepartment,
    // selectedSource,
    selectedBlock,
    selectedDate,
    searchQuery,
  ]);

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "ApplicationsList.xlsx");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenDialog(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="overflow-x-auto p-4">
      <SuperAdminFilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredCases.length}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onExcelClick={handleDownloadExcel}
      />

      <SuperAdminApplicationTable
        data={filteredCases}
        onRowClick={(row) => {
          setSelectedCase(row);
          setOpenDialog(true);
        }}
      />

      {openDialog && selectedCase && (
        <ViewDetails data={selectedCase} onClose={() => setOpenDialog(false)} />
      )}

    </div>
  );
};

export default SuperAdminDataTable;