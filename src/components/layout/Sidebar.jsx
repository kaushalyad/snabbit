import { Link, useLocation } from 'react-router-dom';
import dashboardIcon from '../../assets/dashboard.svg';
import environmentsIcon from '../../assets/environments.svg';
import executionsIcon from '../../assets/executions.svg';
import configurationIcon from '../../assets/configuration.svg';
import reportsIcon from '../../assets/reports.svg';
import administrationIcon from '../../assets/administration.svg';
import settingsIcon from '../../assets/settings.svg';
import dropdownArrowIcon from '../../assets/dropdown-arrow.svg';
import rightArrowIcon from '../../assets/right-arrow.svg';

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-16 flex flex-col h-[calc(100vh-4rem)] left-0 w-64 border-r border-gray-200 bg-[#E6EAF1] z-40">
      <nav className="flex flex-col h-full">
        {/* Main menu items */}
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/' ? 'bg-white' : ''}`}
              >
                <img src={dashboardIcon} alt="Dashboard" className="h-6 w-6 mr-3" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/environments"
                className={`flex items-center justify-between px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/environments' ? 'bg-white' : ''}`}
              >
                <div className="flex items-center">
                  <img src={environmentsIcon} alt="Environments" className="h-6 w-6 mr-3" />
                  <span className="text-sm font-medium">Environments</span>
                </div>
                <img src={dropdownArrowIcon} alt="Dropdown" className="h-6 w-6" />
              </Link>
            </li>
            <li>
              <Link 
                to="/executions"
                className={`flex items-center px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/executions' ? 'bg-white' : ''}`}
              >
                <img src={executionsIcon} alt="Executions" className="h-6 w-6 mr-3" />
                <span className="text-sm font-medium">Executions</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/configuration"
                className={`flex items-center px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/configuration' ? 'bg-white' : ''}`}
              >
                <img src={configurationIcon} alt="Configuration" className="h-6 w-6 mr-3" />
                <span className="text-sm font-medium">Configuration</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/reports"
                className={`flex items-center px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/reports' ? 'bg-white' : ''}`}
              >
                <img src={reportsIcon} alt="Reports" className="h-6 w-6 mr-3" />
                <span className="text-sm font-medium">Reports</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/administration"
                className={`flex items-center justify-between px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/administration' ? 'bg-white' : ''}`}
              >
                <div className="flex items-center">
                  <img src={administrationIcon} alt="Administration" className="h-6 w-6 mr-3" />
                  <span className="text-sm font-medium">Administration</span>
                </div>
                <img src={rightArrowIcon} alt="Right arrow" className="h-6 w-6" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Settings at bottom */}
        <div className="mt-auto border-t border-gray-200 bg-[#E6EAF1]">
          <ul className="px-2 py-4">
            <li>
              <Link 
                to="/settings"
                className={`flex  items-center px-4 py-2 text-black hover:text-gray-700 rounded ${location.pathname === '/settings' ? 'bg-white' : ''}`}
              >
                <img src={settingsIcon} alt="Settings" className="h-6 w-6 mr-3" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
} 