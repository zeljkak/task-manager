import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function TaskFilterComponent({ text, users, statuses, priorities, projects,
        selectedCreatedBefore, selectedCreatedAfter, selectedDueBefore,
        selectedDueAfter, selectedOverdue, selectedAssigneeId,
        selectedFollowerId, selectedStatusId, selectedPriorityId,
        selectedProjectId, selectedHasProject, onChange,
        onAssigneeSelect, onFollowerSelect, onStatusSelect, onPrioritySelect,
        onProjectSelect, onHasProjectSelect, onCreatedBeforeSelect,
        onCreatedAfterSelect, onDueBeforeSelect, onDueAfterSelect, onOverdueSelect,
        selectedHasDueDate, onHasDueDateSelect }) {

    const selectedBeforeDate = selectedCreatedBefore ? new Date(selectedCreatedBefore) : null;
    const selectedAfterDate = selectedCreatedAfter ? new Date(selectedCreatedAfter) : null;
    const selectedBeforeDue = selectedDueBefore ? new Date(selectedDueBefore) : null;
    const selectedAfterDue = selectedDueAfter ? new Date(selectedDueAfter) : null;

    return (
        <div className= {"task-filter"}>
            <input className={"text-filter"} name={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)} />
            <div className={"assigned-to-container"}>
                <button type="button" className={"assigned-to-filter"}>
                    Assignees
                </button>
                <div className={"assigned-to-options"}>
                    <button key={""} type="button"
                            className={"assigned-to-option no-option"}
                            onClick={() => onAssigneeSelect("")}>All assignees
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
            <div className={"followed-by-container"}>
                <button type="button" className={"followed-by-filter"}>
                    Followers
                </button>
                <div className={"followed-by-options"}>
                    <button key={""} type="button"
                            className={"followed-by-option no-option"}
                            onClick={() => onFollowerSelect("")}>Clear
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
            <div className={"status-container"}>
                <button type="button" className={"status-filter"}>
                    Status
                </button>
                <div className={"status-options"}>
                    <button key={""} type="button"
                            className={"status-option no-option"}
                            onClick={() => onStatusSelect("")}>Clear
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
            <div className={"priority-container"}>
                <button type="button" className={"priority-filter"}>
                    Priority
                </button>
                <div className={"priority-options"}>
                    <button key={""} type="button"
                            className={"priority-option no-option"}
                            onClick={() => onPrioritySelect("")}>Clear
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
            <div className={"project-container"}>
                <button type="button" className={"project-filter"}>
                    Project
                </button>
                <div className={"project-options"}>
                    <button key={""} type="button"
                            className={"project-option no-option"}
                            onClick={() =>
                            { onProjectSelect(""); onHasProjectSelect(""); }}>Clear
                    </button>
                    <button key={null} type="button"
                            className={selectedHasProject === false
                                ? "project-option active"
                                : "project-option"}
                            onClick={() =>
                            { onProjectSelect(""); onHasProjectSelect(false); }}>No project
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
            <div className={"created-date-container"}>
                <button type="button"
                    className="created-date-filter">
                Created
                </button>
                <div className="created-date-options">
                    <button key={""} type="button"
                            className={"created-date-option no-option"}
                            onClick={() => [onCreatedBeforeSelect(""), onCreatedAfterSelect("")]}>Clear
                    </button>
                    <div className={"date-grouped"}>
                        <label htmlFor={"created-before"}>Before</label>
                        <DatePicker className={"created-date-option"}
                            id={"created-before"}
                            selected={selectedBeforeDate && !isNaN(selectedBeforeDate) ? selectedBeforeDate : null}
                            onChange={(date) => onCreatedBeforeSelect(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-MM-dd"
                        />
                    </div>
                    <div className={"date-grouped"}>
                        <label htmlFor={"created-after"}>After</label>
                        <DatePicker className={"created-date-option"}
                            id={"created-after"}
                            selected={selectedAfterDate && !isNaN(selectedAfterDate) ? selectedAfterDate : null}
                            onChange={(date) => onCreatedAfterSelect(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-MM-dd"
                        />
                    </div>
                </div>
            </div>
            <div className={"due-date-container"}>
                <button type="button"
                    className="due-date-filter">
                Due
                </button>
                <div className="due-date-options">
                    <button key={""} type="button"
                            className={"due-date-option no-option"}
                            onClick={() => [onDueBeforeSelect(""), onDueAfterSelect(""), onOverdueSelect(""), onHasDueDateSelect("")]}>Clear
                    </button>
                    <button key={"overdue"} type="button"
                            className={selectedOverdue === true
                                ? "overdue-option active"
                                : "overdue-option"}
                            onClick={() => [onOverdueSelect(true), onHasDueDateSelect("")]}>Overdue
                    </button>
                    <button key={null} type="button"
                            className={selectedHasDueDate === false
                                ? "overdue-option active"
                                : "overdue-option"}
                            onClick={() =>
                            { onDueBeforeSelect(""); onDueAfterSelect(""); onOverdueSelect(""); onHasDueDateSelect(false); }}>No due date
                    </button>
                    <div className={"date-grouped"}>
                        <label htmlFor={"bue-before"}>Before</label>
                        <DatePicker className={"due-date-option"}
                            id={"due-before"}
                            selected={selectedBeforeDue && !isNaN(selectedBeforeDue) ? selectedBeforeDue : null}
                            onChange={(date) => [onDueBeforeSelect(date), onHasDueDateSelect("")]}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-MM-dd"
                        />
                    </div>
                    <div className={"date-grouped"}>
                        <label htmlFor={"due-after"}>After</label>
                        <DatePicker className={"due-date-option"}
                            id={"due-after"}
                            selected={selectedDueAfter && !isNaN(selectedDueAfter) ? selectedDueAfter : null}
                            onChange={(date) => [onDueAfterSelect(date), onHasDueDateSelect("")]}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-MM-dd"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskFilterComponent;