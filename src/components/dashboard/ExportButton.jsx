import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import { formatDataForExport, createExportFilename, DATE_FORMATS } from '../../utils/formatters';

export default function ExportButton({ data, columns }) {
  const exportToExcel = (format) => {
    // Convert columns array to columnConfig object
    const columnConfig = columns.reduce((config, column) => {
      if (column.accessorKey) {
        config[column.accessorKey] = {
          header: column.header,
          type: column.accessorKey === 'date' ? 'date' : 
                column.accessorKey === 'amount' ? 'number' : 'string',
          format: column.accessorKey === 'date' ? DATE_FORMATS.DISPLAY :
                 column.accessorKey === 'amount' ? { style: 'currency', currency: 'USD' } : undefined
        };
      }
      return config;
    }, {});

    const exportData = formatDataForExport(data, columnConfig);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, createExportFilename('dashboard-export', format));
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