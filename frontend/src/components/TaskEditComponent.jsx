import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { isFileAllowed } from "../utils/fileValidation.js";
import { createTaskAttachment, updateTask } from "../services/taskService.js";
import { deleteAttachment } from "../services/attachmentService.js";
import TaskCommentsComponent from "./TaskCommentsComponent.jsx";
import FollowTaskComponent from "../components/FollowTaskComponent.jsx";
import DatePickerComponent from "../components/DatePickerComponent.jsx";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import DeleteIcon from "../components/icons/DeleteIcon.jsx";

function TaskEditComponent({ task, renderMobileBackButton, iconSize, user,
    syncUpdates, users = [], statuses = [],
    priorities = [], projects = [] }) {

    const [titleError, setTitleError] = useState("");
    const [attachmentError, setAttachmentError] = useState("");
    const [noDueDate, setNoDueDate] = useState(!task?.dueDate);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

    const titleErrorRef = useRef(null);
    const attachmentErrorRef = useRef(null);

    const [taskData, setTaskData] = useState({
        title: task?.title || "",
        description: task?.description || "",
        assignedToId: task?.assignedTo?.id || "",
        statusId: task?.statusId || "",
        priorityId: task?.priority?.id || null,
        projectId: task?.project?.id || null,
        estimatedHours: task?.estimatedHours || null,
        dueDate: task?.dueDate || "",
    });

    const dateTimeoutRef = useRef(null);
    const lastValidTitleRef = useRef(task?.title || "");

    useEffect(() => {
        setTaskData({
            title: task?.title || "",
            description: task?.description || "",
            assignedToId: task?.assignedTo?.id || "",
            statusId: task?.statusId || "",
            priorityId: task?.priority?.id || null,
            projectId: task?.project?.id || null,
            estimatedHours: task?.estimatedHours || null,
            dueDate: task?.dueDate || "",
        });
        setNoDueDate(!task?.dueDate);
        lastValidTitleRef.current = task?.title || "";
    }, [task]);

    useEffect(() => {
        return () => {
            if (dateTimeoutRef.current) {
                clearTimeout(dateTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (titleError && titleErrorRef.current) {
            requestAnimationFrame(() => {
                titleErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }
    }, [titleError]);

    useEffect(() => {
        if (attachmentError && attachmentErrorRef.current) {
            requestAnimationFrame(() => {
                attachmentErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }
    }, [attachmentError]);

    const handleCheckboxChange = async (e) => {
        const isChecked = e.target.checked;
        const newNoDueDateStatus = !isChecked;
        setNoDueDate(newNoDueDateStatus);

        let finalDate = "";

        if (!newNoDueDateStatus) {
            const today = new Date();
            finalDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        } else {
            finalDate = null;
        }

        const updatedTaskData = {
            ...taskData,
            dueDate: finalDate
        };
        setTaskData(updatedTaskData);

        if (dateTimeoutRef.current) {
            clearTimeout(dateTimeoutRef.current);
        }

        try {
            const payload = { ...updatedTaskData };

            const isArchivedProjectSelected = payload.projectId && projects.some(
                project => project.archived && project.id === Number(payload.projectId)
            );
            if (isArchivedProjectSelected) {
                delete payload.projectId;
            }

            await updateTask(task.id, payload);
            await syncUpdates();
        } catch (error) {
            console.error("Failed to update due date: ", error);
        }
    };

    const handleChange = async (e) => {
        const { name, value: rawValue, files } = e.target;

        if (name === "title") {
            if (!rawValue.trim()) {
                setTitleError("Title is required.");

                setTaskData(prev => ({
                    ...prev,
                    title: lastValidTitleRef.current
                }));

                setTimeout(() => {
                    setTitleError("");
                }, 3000);

                return;
            }

            lastValidTitleRef.current = rawValue;
            setTitleError("");
        }

        if (name === "attachments") {
            const fileList = [...files];
            if (fileList.length === 0) return;

            const MAX_SIZE = 10 * 1024 * 1024;
            const oversizedFile = fileList.find(file => file.size > MAX_SIZE);
            const invalidFile = fileList.find(file => !isFileAllowed(file));

            if (invalidFile) {
                setAttachmentError(`"${invalidFile.name}" has an invalid file type.`);
                setTimeout(() => setAttachmentError(""), 4000);
                e.target.value = "";
                return;
            }

            if (oversizedFile) {
                setAttachmentError(`"${oversizedFile.name}" exceeds the 10 MB limit.`);
                setTimeout(() => setAttachmentError(""), 4000);
                e.target.value = ""; // Reset input
                return;
            }

            try {
                const attachmentData = new FormData();
                fileList.forEach(file => {
                    attachmentData.append("file", file);
                });

                await createTaskAttachment(task.id, attachmentData);
                setAttachmentError("");
                await syncUpdates();
            } catch (error) {
                console.error("Failed to upload attachments: ", error);
                const serverError = error.response?.data?.message || error.response?.data?.error || "Failed to upload file.";
                setAttachmentError(serverError);
                setTimeout(() => setAttachmentError(""), 4000);
            } finally {
                e.target.value = ""; // Reset input so re-selecting same file works
            }
            return;
        }

        const value = (name.endsWith("Id") || name === "estimatedHours" || name === "dueDate") && rawValue === "" ? null : rawValue;

        const updatedTaskData = {
            ...taskData,
            [name]: value
        };

        setTaskData(updatedTaskData);

        try {
            const payload = { ...updatedTaskData };

            if (!payload.dueDate) {
                payload.dueDate = null;
            }

            const isArchivedProjectSelected = payload.projectId && projects.some(
                project => project.archived && project.id === Number(payload.projectId)
            );

            if (isArchivedProjectSelected) {
                delete payload.projectId;
            }

            await updateTask(task.id, payload);
            await syncUpdates();

        } catch (error) {
            console.error("Failed to update task: ", error);
        }
    };

    const handleAttachmentDelete = async (attachmentId) => {
        try {
            await deleteAttachment(attachmentId);
            await syncUpdates();
        } catch (error) {
            console.error("Failed to delete attachment: ", error);
        }
    };

    return (
        <div className="task-edit">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-title">
                    {renderMobileBackButton()}
                    <h4>
                        <input type="text" name="title"
                            value={taskData.title} onChange={handleChange}
                        />
                    </h4>
                    <FollowTaskComponent task={task} size={iconSize} onFollowChange={syncUpdates} />
                </div>
                {titleError && (
                    <div className="error-message" ref={titleErrorRef}>
                        <p className="error">{titleError}</p>
                    </div>
                )}
                <div className="form-input">
                    <div className="form-element">
                        <textarea name="description" className="inline-form-element"
                            placeholder="Enter description" value={taskData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-element inline-form-element">
                        <label htmlFor={`assignee-task-${task.id}`}>Assignee:</label>
                        <select name="assignedToId" id={`assignee-task-${task.id}`}
                            value={taskData.assignedToId} onChange={handleChange}
                        >
                            {users.map(u => (
                                <option value={u.id} key={u.id}>{u.firstName} {u.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-element inline-form-element">
                        <label htmlFor={`task-status-task-${task.id}`}>Task status:</label>
                        <select name="statusId" id={`task-status-task-${task.id}`}
                            value={taskData.statusId} onChange={handleChange}
                        >
                            {statuses?.map(status => (
                                <option value={status.id} key={status.id}>
                                    {status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-element inline-form-element">
                        <label htmlFor={`priority-task-${task.id}`}>Priority:</label>
                        <select name="priorityId" id={`priority-task-${task.id}`}
                            value={taskData.priorityId ?? ""} onChange={handleChange}
                        >
                            <option value="">Choose priority</option>
                            {priorities?.map(priority => (
                                <option value={priority.id} key={priority.id}>
                                    {priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-element inline-form-element">
                        <label htmlFor={`project-task-${task.id}`}>Project:</label>
                        <select name="projectId" id={`project-task-${task.id}`}
                            value={taskData.projectId ?? ""} onChange={handleChange}
                        >
                            <option value="">Choose project</option>
                            {projects?.filter(project => !project.archived).map(project => (
                                <option value={project.id} key={project.id}>{project.projectName}</option>
                            ))}
                            {(() => {
                                const archivedProject = projects.find(
                                    project => project.archived && project.id === task.project?.id
                                );

                                return archivedProject ? (
                                    <option value={archivedProject.id} key={archivedProject.id}>
                                        {archivedProject.projectName} (Archived)
                                    </option>
                                ) : null;
                            })()}
                        </select>
                    </div>
                    <div className="form-element inline-form-element">
                        <label htmlFor={`estimated-hours-task-${task.id}`}>Estimated hours:</label>
                        <select name="estimatedHours" id={`estimated-hours-task-${task.id}`}
                            value={taskData.estimatedHours ?? ""} onChange={handleChange}
                        >
                            <option value="">Choose estimated hours</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option value={num} key={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-element inline-form-element">
                        <div>
                            <p className="due-date-text">Due date:</p>
                            <input type="checkbox" id="new-task-no-due-date" name="no-due-date"
                                checked={!noDueDate} onChange={handleCheckboxChange}
                            />
                        </div>
                        <div className="inline-due-date">
                            <label htmlFor="new-task-no-due-date">{noDueDate ? "Not set" : ""}</label>
                            {!noDueDate && (
                                <DatePickerComponent label="due-before"
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
                            )}
                        </div>
                    </div>
                    <div className="form-element attach">
                        <div className="inline-form-element">
                            <p className="attachments-title">Attachments:</p>
                            <label htmlFor={`task-${task.id}-attachment`} className="attachment-label">
                                <AttachmentIcon size={iconSize} />
                            </label>
                            <input type="file" name="attachments" className="attachment-input"
                                accept=".png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.docx,.txt,.csv,.xlsx,.xls,.pptx"
                                id={`task-${task.id}-attachment`} multiple onChange={handleChange}
                            />
                        </div>
                        {task?.attachments && task?.attachments.length > 0 && (
                            <div className="listed-attachments">
                                {task.attachments.map((file) => {
                                    const isAuthor = Boolean(
                                        user?.id && (
                                            file.createdBy?.id === user.id
                                        )
                                    );
                                    return (
                                        <div key={file.id} className="attachment-chip">
                                            {isAuthor ? (
                                                deletingAttachmentId === file.id ? (
                                                    createPortal(
                                                        <div className="confirmation-overlay">
                                                            <div className="confirmation-div">
                                                                <p>
                                                                    Delete <a href={file.fileUrl} target="_blank"
                                                                              rel="noopener noreferrer"
                                                                              className="file-name">{file.fileName}</a>?
                                                                </p>
                                                                <div className="confirmation-actions">
                                                                    <button type="button" className="positive"
                                                                            onClick={() => {
                                                                                handleAttachmentDelete(file.id);
                                                                                setDeletingAttachmentId(null);
                                                                            }}>
                                                                        Yes
                                                                    </button>
                                                                    <button type="button" className="negative"
                                                                            onClick={() => setDeletingAttachmentId(null)}>
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>,
                                                        document.getElementById("content") || document.body
                                                    )
                                                ) : (
                                                    <>
                                                        <button type="button"
                                                                onClick={() => setDeletingAttachmentId(file.id)}>
                                                            <DeleteIcon size={iconSize}/>
                                                        </button>
                                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                                                           className="file-name">
                                                            {file.fileName}
                                                        </a>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <span className={"attachment-icon-wrapper"}><AttachmentIcon size={iconSize}/></span>
                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                                                       className="file-name">
                                                        {file.fileName}
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {attachmentError && (
                            <div className="error-message" ref={attachmentErrorRef}>
                                <p className="error">{attachmentError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
            <TaskCommentsComponent taskId={task.id} user={user} iconSize={iconSize} onCommentUpdated={syncUpdates} />
        </div>
    );
}

export default TaskEditComponent;