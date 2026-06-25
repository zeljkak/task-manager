import PriorityIcon from "./icons/PriorityIcon.jsx";
import EstimatedHoursIcon from "./icons/EstimatedHoursIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import DueDateIcon from "./icons/DueDateIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";

function TaskData({ task }) {
    return (
        <div className={"task-data"}>
            <p className={"task-priority"}>
                <PriorityIcon level={task.priority.level} size={18} />
                {task.priority.level}
            </p>
            <p className={"task-assignee"}>
                <UserIcon size={18} />
                {task.assignedTo.firstName}
            </p>
            <p className={"task-due-date"}>
                <DueDateIcon size={18} />
                {task.dueDate ?? "No due date"}
            </p>
            <p className={"task-project"}>
                <ProjectIcon size={18} />
                {task.project?.projectName ?? "No project"}
            </p>
            <p className={"task-estimated-hours"}>
                <EstimatedHoursIcon size={18} />
                {task.estimatedHours}
            </p>
        </div>
    );
}

function TaskCardComponent({ task }) {
    return (
    <div className="card">
        <div className="card-body">
            <h5 className="task-title">{task.title}</h5>
            <TaskData task={task} />
        </div>
    </div>
    );
}

export default TaskCardComponent;