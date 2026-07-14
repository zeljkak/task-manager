import {useEffect, useState, useRef} from "react";
import {createPortal} from "react-dom";
import DatePickerComponent from "./DatePickerComponent.jsx";
import {createTaskAttachment, updateTask} from "../services/taskService.js";
import {deleteAttachment} from "../services/attachmentService.js";
import BackIcon from "./icons/BackIcon.jsx";
import AttachmentIcon from "./icons/AttachmentIcon.jsx";
import DeleteIcon from "./icons/DeleteIcon.jsx";

function TaskDetails ({onClose, onChange, task, statuses, projects, priorities, users, isMobile}) {
    const [taskData, setTaskData] = useState({
        title: task?.title || "",
        description: task?.description || "",
        assignedToId: task?.assignedTo.id || "",
        statusId: task?.statusId || "",
        priorityId: task?.priority?.id || "",
        projectId: task?.project?.id || "",
        estimatedHours: task?.estimatedHours || "",
        dueDate: task?.dueDate || "",
    });

    const dateTimeoutRef = useRef(null);

    const iconSize = isMobile ? 30 : 24;
    const [attachments, setAttachments] = useState([]);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

    const renderMobileBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={onClose}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    useEffect(() => {
        function handleClickOutside(event) {
            const clickedConfirmation = event.target.closest('.confirmation-overlay');

            if (clickedConfirmation) {
                return
            }

            const clickedInsideTask = event.target.closest('.task-details');

            if (!clickedInsideTask) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);

            if (dateTimeoutRef.current) {
                clearTimeout(dateTimeoutRef.current);
            }
        };
    }, [onClose]);

    const handleAttachmentDelete = async (attachmentId) => {
        try {
            const response = await deleteAttachment(attachmentId);
            onChange();
        } catch (error) {
            console.log(error);
        }
    }

    const handleChange = async (e) => {
        const { name, value, files } = e.target;

        if (name === "attachments") {
            const fileList = [...files];
            if (fileList.length === 0) return;

            setAttachments(fileList);

            try {
                const attachmentData = new FormData();
                fileList.forEach(file => {
                    attachmentData.append("file", file);
                });

                await createTaskAttachment(task.id, attachmentData);
                setAttachments([]);
                onChange();
            } catch (error) {
                console.error("Failed to upload attachments:", error);
            }
            return;
        }

        const updatedTaskData = {
            ...taskData,
            [name]: value
        };

        setTaskData(updatedTaskData);

        try {
            await updateTask(task.id, updatedTaskData);
            onChange();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={"modal-overlay"}>
            <div className={"task-details card"}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className={"form-title"}>
                        {renderMobileBackButton()}
                        <h4>
                            <input type={"text"} name={"title"}
                                value={taskData.title} onChange={handleChange} />
                        </h4>
                    </div>
                    <div className={"form-input"}>
                        <div className={"form-element"}>
                            <textarea name={"description"} className={"inline-form-element"}
                                placeholder={"Enter description"} value={taskData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={"form-element inline-form-element"}>
                            <label htmlFor={`assignee-task-${task.id}`}>Assignee:</label>
                            <select name={"assignedToId"} id={`assignee-task-${task.id}`}
                                value={taskData.assignedToId} onChange={handleChange}
                            >
                                {users.map(user => {
                                  return (
                                      <option value={user.id} key={user.id}>{user.firstName} {user.lastName}</option>
                                  );
                                })}
                            </select>
                        </div>
                        <div className={"form-element inline-form-element"}>
                            <label htmlFor={`task-status-task-${task.id}`}>Task status:</label>
                            <select name={"statusId"} id={`task-status-task-${task.id}`}
                                value={taskData.statusId} onChange={handleChange}
                            >
                                {statuses.map(status => {
                                  return (
                                      <option value={status.id} key={status.id}>{status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</option>
                                  );
                                })}
                            </select>
                        </div>
                        <div className={"form-element inline-form-element"}>
                            <label htmlFor={`priority-task-${task.id}`}>Priority:</label>
                            <select name={"priorityId"} id={`priority-task-${task.id}`}
                                value={taskData.priorityId} onChange={handleChange}
                            >
                                <option value={""}>Choose priority</option>
                                {priorities.map(priority => {
                                  return (
                                      <option value={priority.id} key={priority.id}>{priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}</option>
                                  );
                                })}
                            </select>
                        </div>
                        <div className={"form-element inline-form-element"}>
                            <label htmlFor={`project-task-${task.id}`}>Project:</label>
                            <select name={"projectId"} id={`project-task-${task.id}`}
                                value={taskData.projectId} onChange={handleChange}
                            >
                                <option value={""}>Choose project</option>
                                {projects.map(project => {
                                  return (
                                      <option value={project.id} key={project.id}>{project.projectName}</option>
                                  );
                                })}
                            </select>
                        </div>
                        <div className={"form-element inline-form-element"}>
                            <label htmlFor={`estimated-hours-task-${task.id}`}>Estimated hours:</label>
                            <select name={"estimatedHours"} id={`estimated-hours-task-${task.id}`}
                                value={taskData.estimatedHours} onChange={handleChange}
                            >
                                <option value={""}>Choose estimated hours</option>
                                <option value={1} key={1}>1</option>
                                <option value={2} key={2}>2</option>
                                <option value={3} key={3}>3</option>
                                <option value={4} key={4}>4</option>
                                <option value={5} key={5}>5</option>
                                <option value={6} key={6}>6</option>
                                <option value={7} key={7}>7</option>
                                <option value={8} key={8}>8</option>
                            </select>
                        </div>
                        <div className={"form-element inline-form-element"}>
                            <p>Due date:</p>
                            <DatePickerComponent label={"due-before"}
                                selected={taskData.dueDate}
                                onChange={(date) => {
                                    if (!date) return;
                                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                                    setTaskData(prev => ({
                                        ...prev,
                                        dueDate: formattedDate
                                    }));
                                    if (dateTimeoutRef.current) {
                                        clearTimeout(dateTimeoutRef.current);
                                    }
                                    dateTimeoutRef.current = setTimeout(() => {
                                        handleChange({ target: { name: "dueDate", value: formattedDate } });
                                    }, 200);
                                }}
                            />
                        </div>
                        <div className={"form-element attach"}>
                            <div className={"inline-form-element"}>
                                <p className="attachments-title">Attachments:</p>
                                <label htmlFor={`task-${task.id}-attachment`} className={"attachment-label"}><AttachmentIcon size={iconSize} /></label>
                                <input type={"file"} name={"attachments"} id={`task-${task.id}-attachment`} multiple
                                onChange={handleChange} style={{display: "none"}} />
                            </div>
                            {task?.attachments && task?.attachments.length > 0 && (
                                <div className={"listed-attachments"}>
                                    {task.attachments.map((file) => (
                                        <div key={file.id} className="attachment-chip">
                                            {deletingAttachmentId === file.id ? (
                                                createPortal(
                                                    <div className={"confirmation-overlay"}>
                                                        <div className="confirmation-div">
                                                            <p>Delete <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                                                                   className="file-name">{file.fileName}</a>?
                                                            </p>
                                                            <div className={"confirmation-actions"}>
                                                                <button type="button" className={"positive"} onClick={() => {
                                                                    handleAttachmentDelete(file.id);
                                                                    setDeletingAttachmentId(null);
                                                                }}>
                                                                    Yes
                                                                </button>
                                                                <button type="button" className={"negative"} onClick={() => setDeletingAttachmentId(null)}>
                                                                    No
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>,
                                                    document.getElementById("content") || document.body
                                                )
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => setDeletingAttachmentId(file.id)}>
                                                        <DeleteIcon size={iconSize} />
                                                    </button>
                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                                        {file.fileName}
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>)
                            }
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskDetails;