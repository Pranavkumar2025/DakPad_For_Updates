import React, { useState, useEffect, useMemo } from "react";
import casesData from "../../JsonData/DataTable.json";
import WorkAssignedFilterHeader from "./WorkAssignedFilterHeader";
import WorkAssignedApplicationTable from "./WorkAssignedApplicationTable";
import AssigningWork from "./AssigningWork";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const WorkAssignedDataTable = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedDate, setSelectedDate] = useState({ startDate: null, endDate: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const filteredCases = useMemo(() => {
    return casesData.filter((c) => {
      const matchStatus = !selectedStatus || c.status === selectedStatus;
      const matchDepartment = !selectedDepartment || c.concernedOfficer.includes(selectedDepartment);
      const matchBlock = !selectedBlock || c.gpBlock === selectedBlock;
      const matchSearch =
        c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      let matchDate = true;
      if (selectedDate.startDate && selectedDate.endDate) {
        const appDate = new Date(c.dateOfApplication);
        const startDate = new Date(selectedDate.startDate);
        const endDate = new Date(selectedDate.endDate);
        matchDate = appDate >= startDate && appDate <= endDate;
      }

      return matchStatus && matchDepartment && matchBlock && matchDate && matchSearch;
    });
  }, [selectedStatus, selectedDepartment, selectedBlock, selectedDate, searchQuery]);

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
    <div className="p-2 sm:p-4">
      <WorkAssignedFilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredCases.length}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onExcelClick={handleDownloadExcel}
      />

      <WorkAssignedApplicationTable
        data={filteredCases}
        onRowClick={(row) => {
          setSelectedCase(row);
          setOpenDialog(true);
        }}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        selectedDepartment={selectedDepartment}
        selectedBlock={selectedBlock}
        selectedDate={selectedDate}
      />

      {openDialog && selectedCase && (
        <AssigningWork data={selectedCase} onClose={() => setOpenDialog(false)} />
      )}
    </div>
  );
};

export default WorkAssignedDataTable;