import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

export default function ExportButton({ data, columns }) {
  const exportToExcel = (format) => {
    // Prepare data for export
    const exportData = data.map(row => {
      const newRow = {};
      columns.forEach(column => {
        if (column.accessorKey) {
          // Handle special cases for formatted cells
          if (column.accessorKey === 'date') {
            newRow[column.header] = new Date(row[column.accessorKey]).toLocaleDateString();
          } else if (column.accessorKey === 'amount') {
            newRow[column.header] = `$${row[column.accessorKey].toLocaleString()}`;
          } else {
            newRow[column.header] = row[column.accessorKey];
          }
        }
      });
      return newRow;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate file
    const fileName = `dashboard-export-${new Date().toISOString().split('T')[0]}`;
    if (format === 'csv') {
      XLSX.writeFile(wb, `${fileName}.csv`);
    } else {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="btn btn-primary inline-flex items-center gap-x-1.5">
        <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
        Export
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => exportToExcel('excel')}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block w-full px-4 py-2 text-left text-sm`}
                >
                  Export as Excel
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => exportToExcel('csv')}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block w-full px-4 py-2 text-left text-sm`}
                >
                  Export as CSV
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 