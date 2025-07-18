import React, { useState, useEffect } from "react";
import casesData from "../JsonData/DataTable.json";
import AddCaseForm from "./AddCaseForm";
import FilterHeader from "./DataTable/FilterHeader";
import ApplicationTable from "./DataTable/ApplicationTable";
import CaseDialog from "./DataTable/CaseDialog";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DataTable = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredCases = casesData.filter((c) => {
    const matchStatus = !selectedStatus || c.status === selectedStatus;
    const matchDepartment = !selectedDepartment || c.departmentSendTo === selectedDepartment;
    const matchSource = !selectedSource || c.addAt === selectedSource;
    const matchSearch =
      c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchDepartment && matchSource && matchSearch;
  });

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
      <FilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCount={filteredCases.length}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        onAddClick={() => setShowAddDialog(true)}
        onExcelClick={handleDownloadExcel}
      />

      <ApplicationTable
        data={filteredCases}
        onRowClick={(row) => {
          setSelectedCase(row);
          setOpenDialog(true);
        }}
      />

      {openDialog && selectedCase && (
        <CaseDialog data={selectedCase} onClose={() => setOpenDialog(false)} />
      )}

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <AddCaseForm isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
