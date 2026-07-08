import { useState, useEffect, useRef } from 'react';
import DatePickerComponent from "./DatePickerComponent.jsx";
import BackIcon from "./icons/BackIcon.jsx";

function TaskFilterComponent({ text, users, statuses, priorities, projects,
        selectedCreatedBefore, selectedCreatedAfter, selectedDueBefore,
        selectedDueAfter, selectedOverdue, selectedAssigneeId,
        selectedFollowerId, selectedStatusId, selectedPriorityId,
        selectedProjectId, selectedHasProject, onChange,
        onAssigneeSelect, onFollowerSelect, onStatusSelect, onPrioritySelect,
        onProjectSelect, onHasProjectSelect, onCreatedBeforeSelect,
        onCreatedAfterSelect, onDueBeforeSelect, onDueAfterSelect, onOverdueSelect,
        selectedHasDueDate, onHasDueDateSelect, isMobile }) {

    const [isMainOpen, setIsMainOpen] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState(null);

    const filterRef = useRef(null);

    const selectedBeforeDate = selectedCreatedBefore ? new Date(selectedCreatedBefore) : null;
    const selectedAfterDate = selectedCreatedAfter ? new Date(selectedCreatedAfter) : null;
    const selectedBeforeDue = selectedDueBefore ? new Date(selectedDueBefore) : null;
    const selectedAfterDue = selectedDueAfter ? new Date(selectedDueAfter) : null;

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

    return (
        <div className={"tasks-filter"} ref={filterRef}>
            <div className={`filter-button-container ${isMainOpen ? 'open' : ''}`}>
                <button type={"button"} className={"filter-button"} onClick={toggleMainFilter}>
                    Filter
                </button>
                <div className={"filter-options"}>
                    <div className={`assigned-to-container ${activeSubMenu === 'assignee' ? 'open' : ''}`}>
                        <button type="button" className={"assigned-to-filter"}
                            onClick={() => toggleSubMenu('assignee')}>
                            Assignees
                        </button>
                        <div className={"assigned-to-options"}>
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"assigned-to-option no-option"}
                                onClick={() => onAssigneeSelect("")}>
                                All assignees
                            </button>
                            {users.map(user => (
                                <button key={user.id} type="button"
                                        className={user.id === selectedAssigneeId
                                        ? "assigned-to-option active"
                                        : "assigned-to-option"}
                                        onClick={() => onAssigneeSelect(user.id)}>
                                    {user.firstName} {user.lastName}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`followed-by-container ${activeSubMenu === 'follower' ? 'open' : ''}`}>
                        <button type="button" className={"followed-by-filter"}
                            onClick={() => toggleSubMenu('follower')}>
                            Followers
                        </button>
                        <div className={"followed-by-options"}>
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"followed-by-option no-option"}
                                onClick={() => onFollowerSelect("")}>
                                Clear
                            </button>
                            {users.map(user => (
                                <button key={user.id} type="button"
                                        className={user.id === selectedFollowerId
                                        ? "followed-by-option active"
                                        : "followed-by-option"}
                                        onClick={() => onFollowerSelect(user.id)}>
                                    {user.firstName} {user.lastName}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`status-container ${activeSubMenu === 'status' ? 'open' : ''}`}>
                        <button type="button" className={"status-filter"}
                            onClick={() => toggleSubMenu('status')}>
                            Status
                        </button>
                        <div className={"status-options"}>
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"status-option no-option"}
                                onClick={() => onStatusSelect("")}>
                                Clear
                            </button>
                            {statuses.map(status => (
                                <button key={status.id} type="button"
                                        className={status.id === selectedStatusId
                                        ? "status-option active"
                                        : "status-option"}
                                        onClick={() => onStatusSelect(status.id)}>
                                    {status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`priority-container ${activeSubMenu === 'priority' ? 'open' : ''}`}>
                        <button type="button" className={"priority-filter"}
                            onClick={() => toggleSubMenu('priority')}>
                            Priority
                        </button>
                        <div className={"priority-options"}>
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"priority-option no-option"}
                                onClick={() => onPrioritySelect("")}>
                                Clear
                            </button>
                            {priorities.map(priority => (
                                <button key={priority.id} type="button"
                                        className={priority.id === selectedPriorityId
                                        ? "priority-option active"
                                        : "priority-option"}
                                        onClick={() => onPrioritySelect(priority.id)}>
                                    {priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`project-container ${activeSubMenu === 'project' ? 'open' : ''}`}>
                        <button type="button" className={"project-filter"}
                            onClick={() => toggleSubMenu('project')}>
                            Project
                        </button>
                        <div className={"project-options"}>
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"project-option no-option"}
                                onClick={() => { onProjectSelect(""); onHasProjectSelect(""); }}>
                                Clear
                            </button>
                            <button key={null} type="button"
                                className={selectedHasProject === false ? "project-option active" : "project-option"}
                                onClick={() => { onProjectSelect(""); onHasProjectSelect(false); }}>
                                No project
                            </button>
                            {projects.map(project => (
                                <button key={project.id} type="button"
                                        className={project.id === selectedProjectId
                                        ? "project-option active"
                                        : "project-option"}
                                        onClick={() =>
                                        { onProjectSelect(project.id); onHasProjectSelect("") }}>
                                    {project.projectName}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`created-date-container ${activeSubMenu === 'createdDate' ? 'open' : ''}`}>
                        <button type="button"
                            className="created-date-filter"
                            onClick={() => toggleSubMenu('createdDate')}>
                            Created
                        </button>
                        <div className="created-date-options">
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"created-date-option no-option"}
                                onClick={() => [onCreatedBeforeSelect(""), onCreatedAfterSelect("")]}>
                                Clear
                            </button>
                            <DatePickerComponent label={"created-before"}
                                 selected={selectedBeforeDate && !isNaN(selectedBeforeDate.getTime()) ? selectedBeforeDate : null}
                                 onChange={(date) => onCreatedBeforeSelect(date)}
                            />
                            <DatePickerComponent label={"created-after"}
                                 selected={selectedAfterDate && !isNaN(selectedAfterDate.getTime()) ? selectedAfterDate : null}
                                 onChange={(date) => onCreatedAfterSelect(date)}
                            />
                        </div>
                    </div>
                    <div className={`due-date-container ${activeSubMenu === 'dueDate' ? 'open' : ''}`}>
                        <button type="button" className="due-date-filter"
                            onClick={() => toggleSubMenu('dueDate')}>
                            Due
                        </button>
                        <div className="due-date-options">
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                className={"due-date-option no-option"}
                                onClick={() => [onDueBeforeSelect(""), onDueAfterSelect(""), onOverdueSelect(""), onHasDueDateSelect("")]}>
                                Clear
                            </button>
                            <button key={"overdue"} type="button"
                                className={selectedOverdue === true ? "overdue-option active" : "overdue-option"}
                                onClick={() => [onOverdueSelect(true), onHasDueDateSelect("")]}>
                                Overdue
                            </button>
                            <button key={null} type="button"
                                className={selectedHasDueDate === false ? "overdue-option active" : "overdue-option"}
                                onClick={() => { onDueBeforeSelect(""); onDueAfterSelect(""); onOverdueSelect(""); onHasDueDateSelect(false); }}>
                                No due date
                            </button>
                            <DatePickerComponent label={"due-before"}
                                 selected={selectedBeforeDue && !isNaN(selectedBeforeDue.getTime()) ? selectedBeforeDue : null}
                                 onChange={(date) => [onDueBeforeSelect(date), onHasDueDateSelect("")]}
                            />
                            <DatePickerComponent label={"due-after"}
                                 selected={selectedAfterDue && !isNaN(selectedAfterDue.getTime()) ? selectedAfterDue : null}
                                 onChange={(date) => [onDueAfterSelect(date), onHasDueDateSelect("")]}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <input className={"text-filter"} name={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)}
            />
            <div className={"clear-all-container"}>
                <button key={"clear-all"} type="button"
                        className={"clear-filter"}
                        onClick={() => [onChange(""), onAssigneeSelect(""), onFollowerSelect(""),
                            onStatusSelect(""), onPrioritySelect(""), onProjectSelect(""),
                            onCreatedBeforeSelect(""), onCreatedAfterSelect(""),
                            onDueBeforeSelect(""), onDueAfterSelect(""), onOverdueSelect(""),
                            onHasDueDateSelect(""), onHasProjectSelect("")
                        ]}>
                        Clear All
                </button>
            </div>
        </div>
    );
}

export default TaskFilterComponent;