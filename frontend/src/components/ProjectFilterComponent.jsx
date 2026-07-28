import { useEffect, useRef, useState } from "react";
import DatePickerComponent from "./DatePickerComponent.jsx";
import BackIcon from "./icons/BackIcon.jsx";
import CreateButtonComponent from "./CreateButtonComponent.jsx";

function ProjectFilterComponent({ filters = {}, onFilterChange,
  onClearAll, options = {}, isMobile, buttonOnCreated}) {

  const { users = [] } = options;

  const [isMainOpen, setIsMainOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const filterRef = useRef(null);

  const selectedBeforeDate = filters.createdBefore ? new Date(filters.createdBefore) : null;
  const selectedAfterDate = filters.createdAfter ? new Date(filters.createdAfter) : null;

  const iconSize = isMobile ? 34 : 24;

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideMenu = event.target.closest('.filter-options');
      const clickedFilterButton = event.target.closest('.filter-button');

      if (!clickedInsideMenu && !clickedFilterButton) {
        setIsMainOpen(false);
        setActiveSubMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMainFilter = () => {
    setIsMainOpen(!isMainOpen);
    if (isMainOpen) setActiveSubMenu(null);
  };

  const toggleSubMenu = (menuName) => {
    setActiveSubMenu(activeSubMenu === menuName ? null : menuName);
  };

  const renderMobileBackButton = () => {
    if (!isMobile) return null;
    return (
      <button type="button" className="submenu-back-button"
        onClick={() => setActiveSubMenu(null)}>
        <BackIcon size={iconSize} />
      </button>
    );
  };

  const filterOptionsContent = (
    <div className="filter-options card">
      <div className={`created-by-container ${activeSubMenu === 'creator' ? 'open' : ''}`}>
        <button type="button" className="created-by-filter"
          onClick={() => toggleSubMenu('creator')}>
          Creator
        </button>
        <div className="created-by-options">
          {renderMobileBackButton()}
          <button type="button" className="created-by-option no-option"
            onClick={() => onFilterChange({ createdById: "" })}>
            Clear
          </button>
          {users.map(user => (
            <button key={user.id} type="button"
              className={user.id === filters.createdById ? "created-by-option active" : "created-by-option"}
              onClick={() => onFilterChange({ createdById: user.id })}>
              {user.firstName} {user.lastName}
            </button>
          ))}
        </div>
      </div>

      <div className={`created-date-container ${activeSubMenu === 'createdDate' ? 'open' : ''}`}>
        <button type="button" className="created-date-filter"
          onClick={() => toggleSubMenu('createdDate')}>
          Created
        </button>
        <div className="created-date-options">
          {renderMobileBackButton()}
          <button type="button" className="created-date-option no-option"
            onClick={() => onFilterChange({ createdBefore: "", createdAfter: "" })}>
            Clear
          </button>
          <DatePickerComponent label="created-before"
            selected={selectedBeforeDate && !isNaN(selectedBeforeDate.getTime()) ? selectedBeforeDate : null}
            onChange={(date) => onFilterChange({ createdBefore: date ? date.toISOString() : "" })}
          />
          <DatePickerComponent label="created-after"
            selected={selectedAfterDate && !isNaN(selectedAfterDate.getTime()) ? selectedAfterDate : null}
            onChange={(date) => onFilterChange({ createdAfter: date ? date.toISOString() : "" })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="projects-filter" ref={filterRef}>
      <div className="separate-filters">
        <div className={`filter-button-container ${isMainOpen ? 'open' : ''}`}>
          <button type="button" className="filter-button" onClick={toggleMainFilter}>
            Filter
          </button>
          {isMainOpen && (
            isMobile ? (
              <div className="modal-overlay">
                {filterOptionsContent}
              </div>
            ) : (
              filterOptionsContent
            )
          )}
        </div>

        <input className="text-filter" name="text-filter"
          placeholder="Search" value={filters.projectText || ""}
          onChange={(e) => onFilterChange({ projectText: e.target.value })}
        />

        <div className="clear-all-container">
          <button type="button" className="clear-filter"
            onClick={onClearAll}>
            Clear All
          </button>
        </div>
      </div>

      <CreateButtonComponent isMobile={isMobile}
        type="project" onCreated={buttonOnCreated}
      />
    </div>
  );
}

export default ProjectFilterComponent;