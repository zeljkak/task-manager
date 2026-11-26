import { useEffect, useRef } from "react";
import FollowTaskComponent from "../components/FollowTaskComponent.jsx";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import TaskCommentsComponent from "./TaskCommentsComponent.jsx";
import URLComponent, { formatLinksWithNewLines } from "./URLComponent.jsx";

function TaskViewComponent({ task, renderMobileBackButton, iconSize, user,
    syncUpdates, selectedStatus, selectedPriority, selectedProject, deletedTask, relationError }) {

    const relationErrorRef = useRef(null);

    useEffect(() => {
        if (relationError && relationErrorRef.current) {
            requestAnimationFrame(() => {
                relationErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }
    }, [relationError]);

    return (
        <div className={"task-display"}>
            <div className={"display-title"}>
                {renderMobileBackButton()}
                <h4>{task.title}</h4>
                <FollowTaskComponent task={task} size={iconSize} onFollowChange={syncUpdates} />
            </div>
            {relationError && (
                <div className={"error-message"} ref={relationErrorRef}>
                    <p className="error">
                        {relationError}
                    </p>
                </div>
            )}
            <div className={"display-task-data"}>
                <div className={"display-element"}>
                    <div className={"description-text"}>
                        <URLComponent
                            text={formatLinksWithNewLines(task.description)}
                            placeholder="No description provided."
                        />
                    </div>
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
            <TaskCommentsComponent taskId={task.id} user={user} iconSize={iconSize} onCommentUpdated={syncUpdates} deletedTask={deletedTask} />
        </div>
    );
}

export default TaskViewComponent;