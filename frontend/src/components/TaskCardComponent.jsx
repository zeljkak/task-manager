import { useNavigate } from "react-router-dom";
import PriorityIcon from "./icons/PriorityIcon.jsx";
import EstimatedHoursIcon from "./icons/EstimatedHoursIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import DueDateIcon from "./icons/DueDateIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";
import {useState} from "react";
import TaskDetails from "./TaskDetails.jsx";

function TaskData({ task }) {
    return (
        <div className={"task-data"}>
            <p className={"task-priority"}>
                <PriorityIcon level={task.priority?.level} size={18} />
                {task.priority?.level ?? "No priority"}
            </p>
            <p className={"task-assignee"}>
                <UserIcon size={18} />
                {task.assignedTo?.firstName}
            </p>
            <p className={"task-due-date"}>
                <DueDateIcon size={18} />
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".") ?? "No due date" : "No due date"}
            </p>
            <p className={"task-project"}>
                <ProjectIcon size={18} />
                {task.project?.projectName ?? "No project"}
            </p>
            <p className={"task-estimated-hours"}>
                <EstimatedHoursIcon size={18} />
                {task.estimatedHours ?? "No estimate"}
            </p>
        </div>
    );
}

function TaskCardComponent({ task, statuses, projects, priorities, users, isMobile, onChange }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="card" key={task.id}
                onClick={() => setOpen(true)}>
                <div className="card-body">
                    <h5 className="task-title">{task.title}</h5>
                    <TaskData task={task} />
                </div>
            </div>
            {open && (
                <TaskDetails onClose={() => setOpen(false)} onChange={onChange}
                    users={users} statuses={statuses} projects={projects}
                    priorities={priorities} task={task} isMobile={isMobile} />
            )}
        </>
    );
}

export default TaskCardComponent;