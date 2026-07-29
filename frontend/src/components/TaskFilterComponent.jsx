import { useState, useEffect, useRef } from 'react';
import DatePickerComponent from "./DatePickerComponent.jsx";
import BackIcon from "./icons/BackIcon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import CreateButtonComponent from "./CreateButtonComponent.jsx";

export default function TaskFilterComponent({ filters, onFilterChange,
    onClearAll, options = {}, isMobile, buttonOnCreated }) {

    const { users = [], statuses = [], priorities = [], projects = [] } = options;

    const [isMainOpen, setIsMainOpen] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState(null);

    const filterRef = useRef(null);
    const { user: currentUser } = useAuth();

    const iconSize = isMobile ? 34 : 24;

    const formatDate = (dateStr) => {
        return dateStr && !isNaN(new Date(dateStr)) ? new Date(dateStr).toISOString() : dateStr;
    };

    const isUserSelected = (userId) => {
        if (filters.assignedToId === "me") {
            return currentUser?.id === userId;
        }
        return filters.assignedToId === userId;
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const parsed = new Date(dateStr);
        return !isNaN(parsed.getTime()) ? parsed : null;
    };

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

    const formatStatus = (str) => {
        if (!str) return "";
        return str.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    const filterOptionsContent = (
        <div className="filter-options card">
            {/* Assignees */}
            <div className={`assigned-to-container ${activeSubMenu === 'assignee' ? 'open' : ''}`}>
                <button type="button" className="assigned-to-filter"
                    onClick={() => toggleSubMenu('assignee')}>
                    Assignees
                </button>
                <div className="assigned-to-options">
                    {renderMobileBackButton()}
                    <button type="button"
                        className={`assigned-to-option no-option ${filters.assignedToId === "" ? "active" : ""}`}
                        onClick={() => onFilterChange({ assignedToId: "" })}>
                        All assignees
                    </button>
                    {users.map(user => (
                        <button key={user.id} type="button"
                            className={`assigned-to-option ${isUserSelected(user.id) ? "active" : ""}`}
                            onClick={() => onFilterChange({ assignedToId: user.id })}>
                            {user.firstName} {user.lastName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Followers */}
            <div className={`followed-by-container ${activeSubMenu === 'follower' ? 'open' : ''}`}>
                <button type="button" className="followed-by-filter"
                    onClick={() => toggleSubMenu('follower')}>
                    Followers
                </button>
                <div className="followed-by-options">
                    {renderMobileBackButton()}
                    <button type="button" className="followed-by-option no-option"
                        onClick={() => onFilterChange({ followedById: "" })}>
                        Clear
                    </button>
                    {users.map(user => (
                        <button key={user.id} type="button"
                            className={`followed-by-option ${user.id === filters.followedById ? "active" : ""}`}
                            onClick={() => onFilterChange({ followedById: user.id })}>
                            {user.firstName} {user.lastName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status */}
            <div className={`status-container ${activeSubMenu === 'status' ? 'open' : ''}`}>
                <button type="button" className="status-filter"
                    onClick={() => toggleSubMenu('status')}>
                    Status
                </button>
                <div className="status-options">
                    {renderMobileBackButton()}
                    <button type="button" className="status-option no-option"
                        onClick={() => onFilterChange({ statusId: "" })}>
                        Clear
                    </button>
                    {statuses.map(status => (
                        <button key={status.id} type="button"
                            className={`status-option ${status.id === filters.statusId ? "active" : ""}`}
                            onClick={() => onFilterChange({ statusId: status.id })}>
                            {formatStatus(status.status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Priority */}
            <div className={`priority-container ${activeSubMenu === 'priority' ? 'open' : ''}`}>
                <button type="button" className="priority-filter"
                    onClick={() => toggleSubMenu('priority')}>
                    Priority
                </button>
                <div className="priority-options">
                    {renderMobileBackButton()}
                    <button type="button" className="priority-option no-option"
                        onClick={() => onFilterChange({ priorityId: "" })}>
                        Clear
                    </button>
                    {priorities.map(priority => (
                        <button key={priority.id} type="button"
                            className={`priority-option ${priority.id === filters.priorityId ? "active" : ""}`}
                            onClick={() => onFilterChange({ priorityId: priority.id })}>
                            {priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project */}
            <div className={`project-container ${activeSubMenu === 'project' ? 'open' : ''}`}>
                <button type="button" className="project-filter"
                    onClick={() => toggleSubMenu('project')}>
                    Project
                </button>
                <div className="project-options">
                    {renderMobileBackButton()}
                    <button type="button" className="project-option no-option"
                        onClick={() => onFilterChange({ projectId: "", hasProject: "" })}>
                        Clear
                    </button>
                    <button type="button"
                        className={`project-option ${filters.hasProject === false || filters.hasProject === "false" ? "active" : ""}`}
                        onClick={() => onFilterChange({ projectId: "", hasProject: false })}>
                        No project
                    </button>
                    {projects.map(project => (
                        <button key={project.id} type="button"
                            className={`project-option ${project.id === filters.projectId ? "active" : ""}`}
                            onClick={() => onFilterChange({ projectId: project.id, hasProject: "" })}>
                            {project.projectName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Created Date */}
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
                    <DatePickerComponent label="created-before" selected={parseDate(filters.createdBefore)}
                        onChange={(date) => onFilterChange({ createdBefore: formatDate(date) })}
                    />
                    <DatePickerComponent label="created-after" selected={parseDate(filters.createdAfter)}
                        onChange={(date) => onFilterChange({ createdAfter: formatDate(date) })}
                    />
                </div>
            </div>

            {/* Due Date */}
            <div className={`due-date-container ${activeSubMenu === 'dueDate' ? 'open' : ''}`}>
                <button type="button" className="due-date-filter"
                    onClick={() => toggleSubMenu('dueDate')}>
                    Due
                </button>
                <div className="due-date-options">
                    {renderMobileBackButton()}
                    <button type="button" className="due-date-option no-option"
                        onClick={() => onFilterChange({ dueBefore: "", dueAfter: "", overdue: "", hasDueDate: "" })}>
                        Clear
                    </button>
                    <button type="button"
                        className={`overdue-option ${filters.overdue === true ? "active" : ""}`}
                        onClick={() => onFilterChange({ overdue: true, hasDueDate: "" })}>
                        Overdue
                    </button>
                    <button type="button"
                        className={`overdue-option ${filters.hasDueDate === false ? "active" : ""}`}
                        onClick={() => onFilterChange({ dueBefore: "", dueAfter: "", overdue: "", hasDueDate: false })}>
                        No due date
                    </button>
                    <DatePickerComponent label="due-before" selected={parseDate(filters.dueBefore)}
                        onChange={(date) => onFilterChange({ dueBefore: formatDate(date), hasDueDate: "" })}
                    />
                    <DatePickerComponent label="due-after" selected={parseDate(filters.dueAfter)}
                        onChange={(date) => onFilterChange({ dueAfter: formatDate(date), hasDueDate: "" })}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="tasks-filter" ref={filterRef}>
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
                    placeholder="Search" value={filters.text || ""}
                    onChange={(e) => onFilterChange({ text: e.target.value })}
                />

                <div className="clear-all-container">
                    <button type="button" className="clear-filter" onClick={onClearAll}>
                        Clear All
                    </button>
                </div>
            </div>

            <CreateButtonComponent isMobile={isMobile}
                type="task" onCreated={buttonOnCreated}
            />
        </div>
    );
}