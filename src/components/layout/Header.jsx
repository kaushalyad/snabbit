import { FiMenu, FiSearch, FiBell, FiAlertCircle } from "react-icons/fi";
import profileSvg from "../../assets/profile.svg";

export default function Header({
  onMenuClick,
  searchQuery = "",
  setSearchQuery,
  isMobile
}) {
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  const handleClearSearch = () => {
    if (setSearchQuery) {
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A] border-b border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="text-[#B5B5B5] hover:text-gray-300"
              aria-label="Toggle menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-[#FFFFFF] ml-4">
            HASS
          </h1>
        </div>

        {/* Center section - Search bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="h-5 w-5 text-[#B5B5B5]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search"
              className="block w-full rounded-lg border-0 bg-[#303030] py-2 pl-10 pr-20 text-[#E3E3E3] placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full"
                aria-label="Clear search"
              >
                <svg
                  className="w-4 h-4 text-[#B5B5B5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="inline-flex items-center justify-center w-[22px] h-[20px] font-['Inter'] font-[450] text-[14px] leading-[20px] tracking-[0px] text-[#B5B5B5] translate-y-[1px]">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <button className="text-[#FFFFFF] hover:text-gray-300 p-2 rounded-lg bg-[#303030] h-10">
            <FiAlertCircle className="h-6 w-6" />
          </button>
          <button className="text-[#FFFFFF] hover:text-gray-300 relative p-2 rounded-lg bg-[#303030] h-10">
            <div className="relative">
              <FiBell className="h-6 w-6" />
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-xs text-[#E3E3E3] flex items-center justify-center border-2 border-[#1A1A1A]">
                2
              </span>
            </div>
          </button>

          <div className="flex items-center w-[140px] h-10 rounded-lg bg-[#303030]">
            <div className="flex items-center justify-between w-full h-full gap-2">
              <div className="flex items-center justify-center flex-1 h-full">
                <p className="text-sm font-medium text-[#E3E3E3] truncate translate-y-[0.5px]">
                  John Doe
                </p>
              </div>
              <div className="h-full w-10 rounded-lg bg-[#303030] flex items-center justify-center flex-shrink-0 py-[2px] pr-[2px]">
                <img
                  src={profileSvg}
                  alt="Profile"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
