import FollowTaskComponent from "../components/FollowTaskComponent.jsx";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import TaskCommentsComponent from "./TaskCommentsComponent.jsx";

function TaskViewComponent({ task, renderMobileBackButton, iconSize, user,
    syncUpdates, selectedStatus, selectedPriority, selectedProject }) {
    return (
        <div className={"task-display"}>
            <div className={"display-title"}>
                {renderMobileBackButton()}
                <h4>{task.title}</h4>
                <FollowTaskComponent task={task} size={iconSize} onFollowChange={syncUpdates} />
            </div>
            <div className={"display-task-data"}>
                <div className={"display-element"}>
                    <p className={"description-text"}>{task.description || "No description provided."}</p>
                </div>
                <div className={"display-element inline-display-element"}>
                    <p>Assignee:</p>
                    <p>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "Unassigned"}</p>
                </div>
                <div className={"display-element inline-display-element"}>
                    <p>Task status:</p>
                    <p>{selectedStatus?.status ? selectedStatus.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Not set"}</p>
                </div>
                <div className={"display-element inline-display-element"}>
                    <p>Priority:</p>
                    <p>{selectedPriority?.level ? selectedPriority.level.charAt(0).toUpperCase() + selectedPriority.level.slice(1) : "None"}</p>
                </div>
                <div className={"display-element inline-display-element"}>
                    <p>Project:</p>
                    <p>{selectedProject?.projectName || task.project?.projectName || "None"}</p>
                </div>
                <div className={"display-element inline-display-element"}>
                    <p>Estimated hours:</p>
                    <p>{task.estimatedHours || "Not set"}</p>
                </div>
                <div className={"display-element inline-display-element"}>
                    <p>Due date:</p>
                    <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".") : "Not set"}</p>
                </div>
                {task?.attachments && task?.attachments.length > 0 && (
                    <div className={"display-element attach"}>
                        <p className="attachments-title">Attachments:</p>
                        <div className={"listed-attachments"}>
                            {task.attachments.map((file) => (
                                <div key={file.id} className="attachment-chip">
                                    <AttachmentIcon size={iconSize} />
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                        {file.fileName}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <TaskCommentsComponent taskId={task.id} user={user} iconSize={iconSize} onCommentUpdated={syncUpdates} />
        </div>
    );
}

export default TaskViewComponent;