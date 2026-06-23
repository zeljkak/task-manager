import PriorityIcon from "./icons/PriorityIcon.jsx";
import EstimatedHoursIcon from "./icons/EstimatedHoursIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import DueDateIcon from "./icons/DueDateIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";

function TaskData({ task }) {
    return (
        <div className={"task-data"}>
            <p style={{display: 'inline-block', paddingRight: '20pt'}}>Properties</p>
            <p className={"task-priority"} style={{display: 'inline-block', paddingRight: '10pt'}}>
                <PriorityIcon level={task.priority.level} />
                {task.priority.level}
            </p>
            <p className={"task-assignee"} style={{display: 'inline-block', paddingRight: '10pt'}}>
                <UserIcon />
                {task.assignedTo.firstName}
            </p>
            <p className={"task-due-date"} style={{display: 'inline-block', paddingRight: '10pt'}}>
                <DueDateIcon />
                {task.dueDate ?? "No due date"}
            </p>
            <p className={"task-project"} style={{display: 'inline-block', paddingRight: '10pt'}}>
                <ProjectIcon />
                {task.project?.projectName ?? "No project"}
            </p>
            <p className={"task-estimated-hours"} style={{display: 'inline-block'}}>
                <EstimatedHoursIcon />
                {task.estimatedHours}
            </p>
        </div>
    );
}

function TaskCard({ task }) {
    return (
    <div className="card">
        <div className="card-body">
            <h5 className="task-title">{task.title}</h5>
            <TaskData task={task} />
            <p>Description</p>
            <p className="task-description">
                {task.description}
            </p>
        </div>
    </div>
    );
}

export default TaskCard;