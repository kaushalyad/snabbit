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
import {
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
} from "date-fns";
import { FiDownload, FiArrowUp, FiFilter } from "react-icons/fi";

const Reports = ({ globalSearchQuery = "" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hosts");
  const [timeFilter, setTimeFilter] = useState("Weekly");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Set minimum date to January 1, 2024
  const minDate = "2024-01-01";

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    executionState: [],
    type: [],
    executedBy: [],
  });

  // Mock data with entries across different time periods
  const [executions] = useState([
    // Current Week (March 18-24, 2024)
    {
      id: "20240324",
      hostName: "BEAT",
      hostIP: "192.128.0.100",
      executionName: "BEAT",
      startDate: "2024-03-24 08:28:36",
      progress: 55,
      executionState: "In Progress",
      type: "Template",
      executedBy: "Shreya",
    },
    {
      id: "20240323",
      hostName: "Weekly_report_2",
      hostIP: "192.128.0.100",
      executionName: "Weekly_report_2",
      startDate: "2024-03-23 19:17:15",
      progress: 95,
      executionState: "In Progress",
      type: "Template",
      executedBy: "Vignesh",
    },
    {
      id: "20240322",
      hostName: "Weekly_report_2",
      hostIP: "192.128.0.100",
      executionName: "Weekly_report_2",
      startDate: "2024-03-22 19:17:15",
      progress: 30,
      executionState: "In Progress",
      type: "Test case",
      executedBy: "Mayank",
    },
    {
      id: "20240321",
      hostName: "Weekly_report_1",
      hostIP: "192.128.0.100",
      executionName: "Weekly_report_1",
      startDate: "2024-03-21 10:00:00",
      progress: 75,
      executionState: "In Progress",
      type: "Template",
      executedBy: "Shreya",
    },
    {
      id: "20240320",
      hostName: "Weekly_report_1",
      hostIP: "192.128.0.100",
      executionName: "Weekly_report_1",
      startDate: "2024-03-20 15:30:00",
      progress: 60,
      executionState: "In Progress",
      type: "Test case",
      executedBy: "Vignesh",
    },
    // Current Month (March 2024)
    {
      id: "20240315",
      hostName: "Monthly_scan_1",
      hostIP: "192.128.0.100",
      executionName: "Monthly_scan_1",
      startDate: "2024-03-15 09:00:00",
      progress: 100,
      executionState: "Completed",
      type: "Template",
      executedBy: "Vignesh",
    },
    {
      id: "20240310",
      hostName: "Monthly_scan_2",
      hostIP: "192.128.0.100",
      executionName: "Monthly_scan_2",
      startDate: "2024-03-10 14:30:00",
      progress: 100,
      executionState: "Completed",
      type: "Test case",
      executedBy: "Mayank",
    },
    {
      id: "20240305",
      hostName: "Monthly_scan_3",
      hostIP: "192.128.0.100",
      executionName: "Monthly_scan_3",
      startDate: "2024-03-05 11:20:00",
      progress: 100,
      executionState: "Completed",
      type: "Template",
      executedBy: "Shreya",
    },
    // Current Year (2024)
    {
      id: "20240228",
      hostName: "Feb_report",
      hostIP: "192.128.0.100",
      executionName: "Feb_report",
      startDate: "2024-02-28 19:49:33",
      progress: 100,
      executionState: "Completed",
      type: "Test case",
      executedBy: "Mayank",
    },
    {
      id: "20240215",
      hostName: "Feb_scan",
      hostIP: "192.128.0.100",
      executionName: "Feb_scan",
      startDate: "2024-02-15 14:30:00",
      progress: 100,
      executionState: "Completed",
      type: "Template",
      executedBy: "Shreya",
    },
    {
      id: "20240131",
      hostName: "Jan_report",
      hostIP: "192.128.0.100",
      executionName: "Jan_report",
      startDate: "2024-01-31 16:45:00",
      progress: 100,
      executionState: "Completed",
      type: "Template",
      executedBy: "Vignesh",
    },
    {
      id: "20240115",
      hostName: "Jan_scan",
      hostIP: "192.128.0.100",
      executionName: "Jan_scan",
      startDate: "2024-01-15 10:20:00",
      progress: 100,
      executionState: "Completed",
      type: "Test case",
      executedBy: "Mayank",
    },
  ]);

  // Filter data based on time filter
  const getFilteredDataByTime = (data) => {
    // For testing purposes, let's set a fixed current date to March 24, 2024
    const currentDate = new Date("2024-03-24");
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Calculate date ranges
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Start from Sunday

    const startOfMonth = new Date(startOfDay);
    startOfMonth.setDate(1); // Start from 1st of current month

    const startOfYear = new Date(startOfDay);
    startOfYear.setMonth(0, 1); // Start from January 1st

    console.log("Current filter:", timeFilter);
    if (timeFilter === "Custom") {
      console.log("Custom date range:", dateRange);
    }

    return data.filter((item) => {
      // Parse the item's date and set it to start of day for accurate comparison
      const itemDate = new Date(item.startDate);
      const itemDateOnly = new Date(
        itemDate.getFullYear(),
        itemDate.getMonth(),
        itemDate.getDate()
      );
      let isInRange = false;

      switch (timeFilter) {
        case "Weekly":
          isInRange = itemDateOnly >= startOfWeek && itemDateOnly <= startOfDay;
          break;

        case "Monthly":
          isInRange =
            itemDateOnly >= startOfMonth && itemDateOnly <= startOfDay;
          break;

        case "Yearly":
          isInRange = itemDateOnly >= startOfYear && itemDateOnly <= startOfDay;
          break;

        case "Custom":
          if (dateRange.startDate && dateRange.endDate) {
            // Parse the custom date range and set to start/end of day
            const startDate = new Date(dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);

            // Check if the item's start date falls within the selected range
            const isStartDateInRange =
              itemDateOnly >= startDate && itemDateOnly <= endDate;

            console.log("Custom filter check:", {
              itemDate: itemDateOnly.toISOString(),
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              isInRange: isStartDateInRange,
              item: item.executionName,
              itemDateOnly: itemDateOnly.toISOString(),
              startDateOnly: startDate.toISOString(),
              endDateOnly: endDate.toISOString(),
            });

            isInRange = isStartDateInRange;
          } else {
            isInRange = true;
          }
          break;

        default:
          isInRange = true;
      }

      return isInRange;
    });
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
    let data = [...executions];

    // Apply time filter first
    data = getFilteredDataByTime(data);

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
    globalSearchQuery,
    localSearchQuery,
    selectedFilters,
    sortOrder,
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleExport = () => {
    try {
      // Get the filtered and sorted data directly from the memoized value
      const filteredData = filteredAndSortedData || [];
      
      // Map the data to ensure all fields exist
      const exportData = filteredData.map(item => ({
        'Execution ID': item?.id || '',
        'Host Name': item?.hostName || '',
        'Host IP': item?.hostIP || '',
        'Execution Name': item?.executionName || '',
        'Start Date': item?.startDate || '',
        'Execution State': item?.executionState || '',
        'Type': item?.type || '',
        'Executed by': item?.executedBy || ''
      }));

      // Export as Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
      XLSX.writeFile(workbook, `reports-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
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
      if (!dateRange.startDate || !dateRange.endDate) {
        alert("Please select both start and end dates");
        return;
      }

      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      if (endDate < startDate) {
        alert("End date cannot be before start date");
        return;
      }

      // Set the time filter to Custom and close the modal
      setTimeFilter("Custom");
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
                  onChange={(e) =>
                    onDateChange({ ...dateRange, startDate: e.target.value })
                  }
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
                  onChange={(e) =>
                    onDateChange({ ...dateRange, endDate: e.target.value })
                  }
                  min={dateRange.startDate || minDate}
                  max={today}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDateRange({ startDate: "", endDate: "" });
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
    <div className="min-h-screen bg-gray-50">
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
      <div className="w-full bg-gray-50">
        <div className="w-full bg-gray-50">
          {/* Top row - Back button and Tabs */}
          <div className="flex flex-col w-full mb-4 px-4">
            <div className="flex items-center justify-left mb-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-50 rounded-md bg-white"
              >
                <img src={arrowLeftIcon} alt="Back" className="w-6 h-6" />
              </button>
              <div className="text-lg font-medium text-black ml-2">Reports</div>
            </div>
            <div className="text-black -mt-16 p-10">
              View reports for hosts and projects scans
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <div className="flex space-x-4 min-w-fit">
                <div
                  onClick={() => setActiveTab("hosts")}
                  className={`px-2 py-1 text-sm font-medium whitespace-nowrap cursor-pointer ${
                    activeTab === "hosts"
                      ? "bg-gray-300 rounded-lg text-black"
                      : "text-black hover:text-gray-700 bg-gray-50"
                  }`}
                >
                  Hosts
                </div>
                <div
                  onClick={() => setActiveTab("projects")}
                  className={`px-2 py-1 text-sm font-medium whitespace-nowrap cursor-pointer ${
                    activeTab === "projects"
                      ? "bg-gray-300 rounded-lg text-black"
                      : "text-black hover:text-gray-700 bg-gray-50"
                  }`}
                >
                  Projects
                </div>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="space-y-4">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                {/* Removing the Reports text here */}
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="grid grid-cols-12 gap-4 mb-4 px-4 bg-white">
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
                      onClick={() => setTimeFilter("Weekly")}
                      className={`text-sm font-medium whitespace-nowrap text-black bg-white`}
                    >
                      <p
                        className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                          timeFilter === "Weekly"
                            ? "bg-gray-300 rounded-l-[8px] text-black"
                            : "hover:text-gray-700 bg-gray-50"
                        }`}
                      >
                        Weekly
                      </p>
                    </div>
                    <div
                      onClick={() => setTimeFilter("Monthly")}
                      className={`px-2 text-sm font-medium whitespace-nowrap text-black bg-white cursor-pointer`}
                    >
                      <p
                        className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                          timeFilter === "Monthly"
                            ? "bg-gray-300 text-black"
                            : "hover:text-gray-700 bg-gray-50"
                        }`}
                      >
                        Monthly
                      </p>
                    </div>
                    <div
                      onClick={() => setTimeFilter("Yearly")}
                      className={`px-2 text-sm font-medium whitespace-nowrap text-black bg-white cursor-pointer`}
                    >
                      <p
                        className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                          timeFilter === "Yearly"
                            ? "bg-gray-300 text-black"
                            : "hover:text-gray-700 bg-gray-50"
                        }`}
                      >
                        Yearly
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        setShowDatePickerModal(true);
                        setTimeFilter("Custom");
                      }}
                      className={` text-sm font-medium whitespace-nowrap text-black bg-white cursor-pointer`}
                    >
                      <p
                        className={`px-3 py-1 text-sm font-medium whitespace-nowrap text-black cursor-pointer ${
                          timeFilter === "Custom"
                            ? "bg-gray-300 rounded-r-[8px] text-black"
                            : "hover:text-gray-700 bg-gray-50 rounded-r-[8px]"
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
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 whitespace-nowrap"
                >
                  Filter
                  <img src={filterIcon} alt="Filter" className="w-5 h-5" />
                </button>

                {/* Sort Button */}
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 whitespace-nowrap"
                >
                  Sort
                  <img src={sortIcon} alt="Sort" className="w-5 h-5" />
                </button>

                {/* Search Input - moved before Export Button and set bg to white */}
                <div className="w-full md:w-64 relative order-1 md:order-none">
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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

                {/* Export Button - now after Search Input */}
                <button
                  onClick={handleExport}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 whitespace-nowrap"
                >
                  <img src={exportIcon} alt="Export" className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="px-4">
            <div className="overflow-x-auto bg-white rounded-lg">
              <table className="w-full table-fixed min-w-[1024px]">
                <thead className="bg-gray-50">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-[90px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap">
                      Execution ID
                    </th>
                    <th
                      scope="col"
                      className="w-[100px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Host Name
                    </th>
                    <th
                      scope="col"
                      className="w-[100px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Host IP
                    </th>
                    <th
                      scope="col"
                      className="w-[100px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Execution Name
                    </th>
                    <th
                      scope="col"
                      className="w-[120px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="w-[200px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Execution State
                    </th>
                    <th
                      scope="col"
                      className="w-[90px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="w-[90px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Executed by
                    </th>
                    <th
                      scope="col"
                      className="w-[100px] px-3 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap"
                    >
                      Logs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedData.length === 0 ? (
                    <tr className="h-24">
                      <td
                        colSpan="9"
                        className="px-4 py-8 text-center text-sm text-gray-500 h-full"
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          No data available
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          <span className="text-[#005BD3] border-b-2 border-[#005BD3]">
                            {item.id}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          {item.hostName}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          {item.hostIP}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          {item.executionName}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          {item.startDate}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          <div className="flex items-center gap-2">
                            <div className="w-[160px] h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.progress <= 25
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
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          {item.type}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          <p className="bg-gray-200 rounded-[8px] py-[1px] px-2 items-center text-center">
                            {item.executedBy}
                          </p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-black">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewLogs(item.id)}
                              className="bg-white p-2 hover:bg-gray-50 rounded-lg"
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
                              className="bg-white p-2 hover:bg-gray-50 rounded-lg"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
