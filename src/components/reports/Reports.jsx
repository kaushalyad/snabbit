import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import arrowLeftIcon from "../../assets/leftarrow-icon.svg";
import filterIcon from "../../assets/filter.svg";
import sortIcon from "../../assets/sort.svg";
import exportIcon from "../../assets/export.svg";
import eyeIcon from "../../assets/eye.svg";
import fileIcon from "../../assets/file.svg";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { FiDownload, FiArrowUp, FiFilter } from "react-icons/fi";
import { parseDate, formatDataForExport, createExportFilename, validateDateRange, DATE_FORMATS } from "../../utils/formatters";

const Reports = ({ globalSearchQuery = "" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hosts");
  const [timeFilter, setTimeFilter] = useState("Weekly");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Set minimum date to January 1, 2024
  const minDate = "2024-01-01";

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const [localSearchQuery, setLocalSearchQuery] = useState(globalSearchQuery);
  const [selectedFilters, setSelectedFilters] = useState({
    executionState: [],
    type: [],
    executedBy: [],
  });

  // Mock data with entries across different time periods
  const [executions] = useState([
    // June 2025 Data (Current Week)
    {
      id: '20250608',
      hostName: 'June_8_2025_Report',
      hostIP: '192.168.0.101',
      executionName: 'June_8_2025_Report',
      startDate: '2025-06-08T10:00:00',
      progress: 100,
      executionState: 'Completed',
      type: 'Report',
      executedBy: 'System'
    },
    {
      id: '20250607',
      hostName: 'June_7_2025_Scan',
      hostIP: '192.168.0.102',
      executionName: 'June_7_2025_Scan',
      startDate: '2025-06-07T14:30:00',
      progress: 75,
      executionState: 'In Progress',
      type: 'Scan',
      executedBy: 'Mayank'
    },
    {
      id: '20250606',
      hostName: 'June_6_2025_Report',
      hostIP: '192.168.0.103',
      executionName: 'June_6_2025_Report',
      startDate: '2025-06-06T09:15:00',
      progress: 50,
      executionState: 'In Progress',
      type: 'Report',
      executedBy: 'Shreya'
    },
    {
      id: '20250605',
      hostName: 'June_5_2025_Scan',
      hostIP: '192.168.0.104',
      executionName: 'June_5_2025_Scan',
      startDate: '2025-06-05T09:00:00',
      progress: 25,
      executionState: 'In Progress',
      type: 'Scan',
      executedBy: 'Vignesh'
    },
    {
      id: '20250604',
      hostName: 'June_4_2025_Report',
      hostIP: '192.168.0.105',
      executionName: 'June_4_2025_Report',
      startDate: '2025-06-04T11:20:00',
      progress: 0,
      executionState: 'Not Started',
      type: 'Report',
      executedBy: 'System'
    },
    {
      id: '20250603',
      hostName: 'June_3_2025_Scan',
      hostIP: '192.168.0.106',
      executionName: 'June_3_2025_Scan',
      startDate: '2025-06-03T15:45:00',
      progress: 90,
      executionState: 'In Progress',
      type: 'Scan',
      executedBy: 'Mayank'
    },
    {
      id: '20250602',
      hostName: 'June_2_2025_Report',
      hostIP: '192.168.0.107',
      executionName: 'June_2_2025_Report',
      startDate: '2025-06-02T08:00:00',
      progress: 100,
      executionState: 'Completed',
      type: 'Report',
      executedBy: 'System'
    },
    // February 2025 Data (Previous Month)
    {
      id: '20250228',
      hostName: 'Feb_2025_Report',
      hostIP: '192.128.0.100',
      executionName: 'Feb_2025_Report',
      startDate: '2025-02-28T16:45:00',
      progress: 100,
      executionState: 'Completed',
      type: 'Template',
      executedBy: 'Vignesh'
    },
    {
      id: '20250215',
      hostName: 'Feb_2025_Scan',
      hostIP: '192.128.0.101',
      executionName: 'Feb_2025_Scan',
      startDate: '2025-02-15T10:30:00',
      progress: 75,
      executionState: 'In Progress',
      type: 'Test case',
      executedBy: 'Mayank'
    },
    // January 2025 Data
    {
      id: '20250131',
      hostName: 'Jan_2025_Report',
      hostIP: '192.128.0.107',
      executionName: 'Jan_2025_Report',
      startDate: '2025-01-31T15:20:00',
      progress: 100,
      executionState: 'Completed',
      type: 'Template',
      executedBy: 'Shreya'
    },
    {
      id: '20250115',
      hostName: 'Jan_2025_Scan',
      hostIP: '192.128.0.108',
      executionName: 'Jan_2025_Scan',
      startDate: '2025-01-15T09:30:00',
      progress: 60,
      executionState: 'In Progress',
      type: 'Scan',
      executedBy: 'Mayank'
    }
  ]);

  // Add a handler for time filter changes
  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    // Reset pagination to first page when changing time filter
    setCurrentPage(1);
  };

  // Filter data based on time filter
  const getFilteredDataByTime = (data) => {
    // For testing, let's use June 9th, 2025 as the current date
    const testDate = parseDate('2025-06-09');
    testDate.setHours(0, 0, 0, 0);

    const filteredData = data.filter((item) => {
      // Parse the item's date and set time to start of day for consistent comparison
      const itemDate = parseDate(item.startDate);
      itemDate.setHours(0, 0, 0, 0);
      
      let isInRange = false;

      switch (timeFilter) {
        case "Weekly": {
          // Calculate start of week (7 days before test date)
          const weekStart = new Date(testDate);
          weekStart.setDate(testDate.getDate() - 7);
          weekStart.setHours(0, 0, 0, 0);
          
          // Set end of week to end of test date
          const weekEnd = new Date(testDate);
          weekEnd.setHours(23, 59, 59, 999);
          
          isInRange = itemDate >= weekStart && itemDate <= weekEnd;
          break;
        }

        case "Monthly": {
          // Calculate start of month
          const monthStart = new Date(testDate.getFullYear(), testDate.getMonth(), 1);
          monthStart.setHours(0, 0, 0, 0);
          
          // Calculate start of next month
          const nextMonthStart = new Date(testDate.getFullYear(), testDate.getMonth() + 1, 1);
          nextMonthStart.setHours(0, 0, 0, 0);
          
          isInRange = itemDate >= monthStart && itemDate < nextMonthStart;
          break;
        }

        case "Yearly": {
          // Calculate start of year
          const yearStart = new Date(testDate.getFullYear(), 0, 1);
          yearStart.setHours(0, 0, 0, 0);
          
          // Calculate start of next year
          const nextYearStart = new Date(testDate.getFullYear() + 1, 0, 1);
          nextYearStart.setHours(0, 0, 0, 0);
          
          isInRange = itemDate >= yearStart && itemDate < nextYearStart;
          break;
        }

        case "Custom": {
          if (dateRange.startDate && dateRange.endDate) {
            const startDate = parseDate(dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = parseDate(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            
            isInRange = itemDate >= startDate && itemDate <= endDate;
          } else {
            isInRange = true;
          }
          break;
        }

        default:
          isInRange = true;
      }

      return isInRange;
    });

    return filteredData;
  };

  // Filter data based on search queries (both global and local)
  const getFilteredDataBySearch = (data) => {
    // Handle global search query
    const globalQuery = String(globalSearchQuery || "")
      .toLowerCase()
      .trim();
    // Handle local search query
    const localQuery = String(localSearchQuery || "")
      .toLowerCase()
      .trim();

    // If both queries are empty, return all data
    if (!globalQuery && !localQuery) return data;

    return data.filter((item) => {
      // Search across all relevant fields
      const searchableFields = [
        item.id,
        item.hostName,
        item.hostIP,
        item.executionName,
        item.startDate,
        item.executionState,
        item.type,
        item.executedBy,
        `${item.progress}%`, // Include progress percentage in search
      ];

      const fieldValues = searchableFields.map((field) =>
        String(field || "").toLowerCase()
      );

      // Match against both global and local queries
      const matchesGlobal =
        !globalQuery ||
        fieldValues.some((value) => value.includes(globalQuery));
      const matchesLocal =
        !localQuery || fieldValues.some((value) => value.includes(localQuery));

      // Return true only if both queries match
      return matchesGlobal && matchesLocal;
    });
  };

  // Filter data based on selected filters
  const getFilteredDataByFilters = (data) => {
    if (
      !selectedFilters.executionState.length &&
      !selectedFilters.type.length &&
      !selectedFilters.executedBy.length
    ) {
      return data;
    }

    return data.filter((item) => {
      const matchesState =
        selectedFilters.executionState.length === 0 ||
        selectedFilters.executionState.includes(item.executionState);
      const matchesType =
        selectedFilters.type.length === 0 ||
        selectedFilters.type.includes(item.type);
      const matchesExecutedBy =
        selectedFilters.executedBy.length === 0 ||
        selectedFilters.executedBy.includes(item.executedBy);
      return matchesState && matchesType && matchesExecutedBy;
    });
  };

  // Sort data
  const getSortedData = (data) => {
    return [...data].sort((a, b) => {
      // For custom filter, sort by date
      if (timeFilter === "Custom") {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      // For other filters, sort by execution name
      if (a.executionName < b.executionName) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (a.executionName > b.executionName) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Combine all filters and sorting
  const filteredAndSortedData = useMemo(() => {
    console.log("Recalculating filtered data with:", {
      timeFilter,
      dateRange,
      executionsLength: executions.length
    });

    let data = [...executions];

    // Apply time filter first
    data = getFilteredDataByTime(data);
    console.log("After time filter:", {
      filteredLength: data.length,
      sampleItems: data.slice(0, 2).map(item => ({
        name: item.executionName,
        startDate: item.startDate
      }))
    });

    // Then apply search filter
    data = getFilteredDataBySearch(data);

    // Then apply other filters
    data = getFilteredDataByFilters(data);

    // Finally apply sorting
    data = getSortedData(data);

    return data;
  }, [
    executions,
    timeFilter,
    dateRange,
    globalSearchQuery,
    localSearchQuery,
    selectedFilters,
    sortOrder,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleExport = () => {
    try {
      const filteredData = filteredAndSortedData || [];
      
      const columnConfig = {
        id: { header: "Execution ID", type: "string" },
        hostName: { header: "Host Name", type: "string" },
        hostIP: { header: "Host IP", type: "string" },
        executionName: { header: "Execution Name", type: "string" },
        startDate: { header: "Start Date", type: "date", format: DATE_FORMATS.DISPLAY_WITH_TIME },
        executionState: { header: "Execution State", type: "string" },
        type: { header: "Type", type: "string" },
        executedBy: { header: "Executed by", type: "string" }
      };

      const exportData = formatDataForExport(filteredData, columnConfig);
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      XLSX.writeFile(workbook, createExportFilename("reports-export", "xlsx"));
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleViewLogs = (id) => {
    // TODO: Implement view logs functionality
    console.log("View logs clicked for ID:", id);
  };

  // Filter modal component
  const FilterModal = ({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onApply,
  }) => {
    if (!isOpen) return null;

    // Get unique values from mock data for filter options
    const uniqueExecutionStates = [
      ...new Set(executions.map((item) => item.executionState)),
    ];
    const uniqueTypes = [...new Set(executions.map((item) => item.type))];
    const uniqueExecutedBy = [
      ...new Set(executions.map((item) => item.executedBy)),
    ];

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={onClose}
          />

          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filter</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filter modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Execution State */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium text-gray-700">
                Execution State
              </h4>
              <div className="space-y-2">
                {uniqueExecutionStates.map((state) => (
                  <label
                    key={state}
                    className={`flex items-center px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors ${
                      filters.executionState.includes(state)
                        ? "bg-[#0000000D]"
                        : "hover:bg-[#0000000D]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.executionState.includes(state)}
                      onChange={(e) => {
                        const newStates = e.target.checked
                          ? [...filters.executionState, state]
                          : filters.executionState.filter((s) => s !== state);
                        onFilterChange({
                          ...filters,
                          executionState: newStates,
                        });
                      }}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">{state}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Type</h4>
              <div className="space-y-2">
                {uniqueTypes.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors ${
                      filters.type.includes(type)
                        ? "bg-[#0000000D]"
                        : "hover:bg-[#0000000D]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.type, type]
                          : filters.type.filter((t) => t !== type);
                        onFilterChange({ ...filters, type: newTypes });
                      }}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Executed By */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium text-gray-700">
                Executed By
              </h4>
              <div className="space-y-2">
                {uniqueExecutedBy.map((executor) => (
                  <label
                    key={executor}
                    className={`flex items-center px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors ${
                      filters.executedBy.includes(executor)
                        ? "bg-[#0000000D]"
                        : "hover:bg-[#0000000D]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.executedBy.includes(executor)}
                      onChange={(e) => {
                        const newExecutors = e.target.checked
                          ? [...filters.executedBy, executor]
                          : filters.executedBy.filter((ex) => ex !== executor);
                        onFilterChange({
                          ...filters,
                          executedBy: newExecutors,
                        });
                      }}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">{executor}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full sm:w-auto gap-3">
              <button
                onClick={() =>
                  onFilterChange({
                    executionState: [],
                    type: [],
                    executedBy: [],
                  })
                }
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-[#0000000D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear All
              </button>
              <button
                onClick={onApply}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Date Range Picker Modal
  const DatePickerModal = ({ isOpen, onClose, dateRange, onDateChange }) => {
    if (!isOpen) return null;

    const handleApply = () => {
      const validation = validateDateRange(dateRange.startDate, dateRange.endDate);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      setTimeFilter("Custom");
      onDateChange(dateRange);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={onClose}
          />

          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Select Date Range</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close date picker modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => {
                    const newDateRange = { ...dateRange, startDate: e.target.value };
                    onDateChange(newDateRange);
                  }}
                  min={minDate}
                  max={dateRange.endDate || today}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    const newDateRange = { ...dateRange, endDate: e.target.value };
                    onDateChange(newDateRange);
                  }}
                  min={dateRange.startDate || minDate}
                  max={today}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  onDateChange({ startDate: "", endDate: "" });
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" bg-gray-200">
      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={selectedFilters}
        onFilterChange={setSelectedFilters}
        onApply={() => setShowFilterModal(false)}
      />

      {/* Date Range Picker Modal */}
      <DatePickerModal
        isOpen={showDatePickerModal}
        onClose={() => {
          setShowDatePickerModal(false);
        }}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      {/* Main Content */}
      <div className="w-full bg-gray-200">
        <div className="w-full bg-gray-200">
          {/* Top row - Back button and Tabs */}
          <div className="flex flex-col w-full mb-4 px-4 bg-gray-200">
            <div className="flex items-center  justify-left mb-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-200 rounded-md bg-gray-200"
              >
                <img src={arrowLeftIcon} alt="Back" className="w-6 h-6" />
              </button>
              <div className="text-lg font-medium text-black ">Reports</div>
            </div>
            <div className="text-black -mt-16 p-10">
              View reports for hosts and projects scans
            </div>
            <div className=" bg-white rounded-[8px] py-5 px-2">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <div className="flex space-x-4 min-w-fit">
                  <div
                    onClick={() => setActiveTab("hosts")}
                    className={`px-2 py-1 text-sm font-medium whitespace-nowrap cursor-pointer ${
                      activeTab === "hosts"
                        ? "bg-gray-200 rounded-lg text-black"
                        : "text-black hover:text-gray-700 bg-gray-white"
                    }`}
                  >
                    Hosts
                  </div>
                  <div
                    onClick={() => setActiveTab("projects")}
                    className={`px-2 py-1 text-sm font-medium whitespace-nowrap cursor-pointer ${
                      activeTab === "projects"
                        ? "bg-gray-200 rounded-lg text-black"
                        : "text-black hover:text-gray-700 bg-whitw"
                    }`}
                  >
                    Projects
                  </div>
                </div>
              </div>

              {/* Controls Row */}
              <div className="space-y-4 ">
                {/* Header section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    {/* Removing the Reports text here */}
                  </div>
                </div>

                {/* Filters and Actions */}
                <div className="grid grid-cols-12 gap-4 mb-4 px-4  ">
                  {/* Left section - Hosts text */}
                  <div className="col-span-12 md:col-span-2">
                    <div className="bg-white font-['Inter'] font-[650] text-[20px] leading-[20px] tracking-[0px] align-middle text-black">
                      Hosts
                    </div>
                  </div>

                  {/* Right section - Controls */}
                  <div className="col-span-12 md:col-span-10 flex flex-col md:flex-row items-start md:items-center justify-start md:justify-end space-y-4 md:space-y-0 md:space-x-4">
                    {/* Time Filter Section */}
                    <div className="flex items-center gap-4">
                      <div className="inline-flex px-0 py-0 items-center hover:border-gray-200 hover:border bg-white border border-gray-200 border-solid rounded-[8px] min-w-fit">
                        <div
                          onClick={() => handleTimeFilterChange("Weekly")}
                          className={`text-sm font-medium whitespace-nowrap text-black bg-white`}
                        >
                          <p
                            className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                              timeFilter === "Weekly"
                                ? "bg-gray-200 rounded-l-[8px] text-black"
                                : "hover:text-gray-700 bg-white"
                            }`}
                          >
                            Weekly
                          </p>
                        </div>
                        <div
                          onClick={() => handleTimeFilterChange("Monthly")}
                          className={`text-sm font-medium whitespace-nowrap text-black bg-white`}
                        >
                          <p
                            className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                              timeFilter === "Monthly"
                                ? "bg-gray-200 text-black"
                                : "hover:text-gray-700 bg-white"
                            }`}
                          >
                            Monthly
                          </p>
                        </div>
                        <div
                          onClick={() => handleTimeFilterChange("Yearly")}
                          className={`text-sm font-medium whitespace-nowrap text-black bg-white`}
                        >
                          <p
                            className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                              timeFilter === "Yearly"
                                ? "bg-gray-200 text-black"
                                : "hover:text-gray-700 bg-white"
                            }`}
                          >
                            Yearly
                          </p>
                        </div>
                        <div
                          onClick={() => {
                            handleTimeFilterChange("Custom");
                            setShowDatePickerModal(true);
                          }}
                          className={`text-sm font-medium whitespace-nowrap text-black bg-white cursor-pointer`}
                        >
                          <p
                            className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                              timeFilter === "Custom"
                                ? "bg-gray-200 rounded-r-[8px] text-black"
                                : "hover:text-gray-700 bg-white rounded-r-[8px]"
                            }`}
                          >
                            Custom
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Button */}
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-black bg-white border border-gray-200 rounded-md hover:bg-gray-200 whitespace-nowrap min-w-[80px]"
                    >
                      Filter
                      <img src={filterIcon} alt="Filter" className="w-5 h-5" />
                    </button>

                    {/* Sort Button */}
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-black bg-white border border-gray-200 rounded-md hover:bg-gray-200 whitespace-nowrap min-w-[80px]"
                    >
                      Sort
                      <img src={sortIcon} alt="Sort" className="w-5 h-5" />
                    </button>

                    {/* Search Input */}
                    <div className="relative min-w-[200px] max-w-[300px]">
                      <input
                        type="text"
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-black"
                      />
                      <svg
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Export Button */}
                    <button
                      onClick={handleExport}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 whitespace-nowrap min-w-[90px]"
                    >
                      <img src={exportIcon} alt="Export" className="w-5 h-5" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="px-4 mt-5">
                <div className="bg-white rounded-lg h-[320px]">
                  <table className="w-full table-fixed min-w-[1024px]">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr className="bg-gray-200 border-b border-gray-200 h-[32px]">
                        <th className="w-[80px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Execution ID
                        </th>
                        <th className="w-[100px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Host Name
                        </th>
                        <th className="w-[100px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Host IP
                        </th>
                        <th className="w-[150px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Execution Name
                        </th>
                        <th className="w-[100px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Start Date
                        </th>
                        <th className="w-[200px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Execution State
                        </th>
                        <th className="w-[80px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Type
                        </th>
                        <th className="w-[100px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Executed by
                        </th>
                        <th className="w-[100px] px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                          Logs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.length === 0 ? (
                        <tr className="h-[240px]">
                          <td colSpan="8" className="px-2 py-1 text-sm text-center text-gray-500">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-200 h-[32px]">
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              <span className="text-[#005BD3] border-b-2 border-[#005BD3]">
                                {item.id}
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              {item.hostName}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              {item.hostIP}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              {item.executionName}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              {item.startDate}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              <div className="flex items-center gap-2">
                                <div className="w-[200px] h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.progress === 100
                                        ? "bg-red-500"
                                        : item.progress <= 25
                                        ? "bg-red-500"
                                        : item.progress <= 50
                                        ? "bg-yellow-500"
                                        : item.progress <= 75
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-black">
                                  {item.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              {item.type}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              <p className="bg-gray-200 rounded-[8px] py-[1px] px-2 items-center text-center">
                                {item.executedBy}
                              </p>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-black">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleViewLogs(item.id)}
                                  className="bg-white p-2 hover:bg-gray-200 rounded-lg"
                                >
                                  <img
                                    src={eyeIcon}
                                    alt="View Logs"
                                    className="w-6 h-6"
                                    style={{ color: "#000000" }}
                                  />
                                </button>
                                <button
                                  onClick={() => handleViewLogs(item.id)}
                                  className="bg-white p-2 hover:bg-gray-200 rounded-lg"
                                >
                                  <img
                                    src={fileIcon}
                                    alt="Download Logs"
                                    className="w-6 h-6"
                                    style={{ color: "#000000" }}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
