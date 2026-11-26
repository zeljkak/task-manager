import { useNavigate } from "react-router-dom";
import { Draggable } from "@hello-pangea/dnd";
import PriorityIcon from "./icons/PriorityIcon.jsx";
import EstimatedHoursIcon from "./icons/EstimatedHoursIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import DueDateIcon from "./icons/DueDateIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";

function TaskData({ task }) {
    let capitalize = task.priority?.level.charAt(0).toUpperCase() + task.priority?.level.slice(1).toLowerCase();

    return (
        <div className={"task-data"}>
            <p className={"task-priority"}>
                <PriorityIcon level={task.priority?.level} size={18} />
                {task.priority?.level ? capitalize : "No priority"}
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

function TaskCardComponent({ task, index, canEdit }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/tasks/${task.id}`);
    };

    return (
        <Draggable draggableId={String(task.id)} index={index} isDragDisabled={!canEdit}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`card ${snapshot.isDragging ? "dragging" : ""}`}
              id={`task-card-${task.id}`}
              data-scroll-target={`task-card-${task.id}`}
              onClick={handleClick}
              style={{ userSelect: "none", marginBottom: "8px", ...provided.draggableProps.style }}>

                <div className="card-body">
                  <h5 className="task-title">{task.title}</h5>
                  <TaskData task={task} />
                </div>
            </div>
          )}
        </Draggable>
    );
}

export default TaskCardComponent;