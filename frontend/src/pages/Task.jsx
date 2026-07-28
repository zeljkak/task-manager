import {useEffect, useState, useRef, useCallback} from "react";
import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import {createPortal} from "react-dom";
import {getTask, createTaskAttachment, updateTask} from "../services/taskService.js";
import {deleteAttachment} from "../services/attachmentService.js";
import BackIcon from "../components/icons/BackIcon.jsx";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import DeleteIcon from "../components/icons/DeleteIcon.jsx";
import DatePickerComponent from "../components/DatePickerComponent.jsx";
import FollowTaskComponent from "../components/FollowTaskComponent.jsx";


function Task ({}) {
    const { taskId } = useParams();
    const { triggerTaskRefresh, isMobile, users = [], statuses = [], priorities = [], projects = [], refreshDropdowns } = useOutletContext();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [noDueDate, setNoDueDate] = useState(true);
    const [attachments, setAttachments] = useState([]);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

    const iconSize = isMobile ? 30 : 24;

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        assignedToId: "",
        statusId: "",
        priorityId: null,
        projectId: null,
        estimatedHours: null,
        dueDate: "",
    });

    const dateTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (dateTimeoutRef.current) {
                clearTimeout(dateTimeoutRef.current);
            }
        };
    }, []);

    const fetchTask = useCallback(async () => {
        try {
            const response = await getTask(taskId);
            const fetchedTask = response.data?.task || response.task;

            setTask(fetchedTask);
            setTaskData({
                title: fetchedTask?.title || "",
                description: fetchedTask?.description || "",
                assignedToId: fetchedTask?.assignedTo?.id || "",
                statusId: fetchedTask?.statusId || "",
                priorityId: fetchedTask?.priority?.id || null,
                projectId: fetchedTask?.project?.id || null,
                estimatedHours: fetchedTask?.estimatedHours || null,
                dueDate: fetchedTask?.dueDate || "",
            });
            setNoDueDate(!fetchedTask?.dueDate);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch task details:", err);
            setError(err.response?.data?.error || "Failed to load task");
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        setLoading(true);
        fetchTask();
    }, [fetchTask]);

    // Synchronize Task view & Home view
    const syncUpdates = async () => {
        await fetchTask(); // Updates this page
        if (triggerTaskRefresh) triggerTaskRefresh(); // Updates Home page in background
        //if (refreshDropdowns) refreshDropdowns(); // Updates global layout dropdowns
    };

    if (loading) return <div className="spinner"><p className={"loading"}>Loading task details...</p></div>;
    if (error) return <div className="error-message"><p className={"error"}>{error}</p></div>;
    if (!task) return <div>Task not found.</div>;

    const createdByDiv = (
        <>
            <div className={"task-info-box"}>
                <p>Created by:</p>
                <a href={"#"} target="_blank" rel="noopener noreferrer">
                    {task?.createdBy?.firstName} {task?.createdBy?.lastName}
                </a>
            </div>
        </>
    );

    const followersDiv = (
        <>
            <div className={"task-info-box"}>
                <p>Followed by:</p>
                {task?.followers?.map(follower => (
                    <a href={"#"} target="_blank" rel="noopener noreferrer"
                    key={follower.id}>
                        {follower.firstName} {follower.lastName}
                    </a>
                ))}
            </div>
        </>
    );

    const relatedToDiv = (
        <>
            <div className={"task-info-box"}>
                <p>Related tasks:</p>
                <div>
                    {task?.related?.map(relatedTask => (
                        <a href={"#"} target="_blank" rel="noopener noreferrer"
                        key={relatedTask.id}>
                            {relatedTask.title}
                        </a>
                    ))}
                </div>

            </div>
        </>
    );

    const comments = (
        <div className={"task-comments"}>
        </div>
    );

    const renderMobileBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={() => navigate(-1)}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    const handleAttachmentDelete = async (attachmentId) => {
        try {
            await deleteAttachment(attachmentId);
            await syncUpdates();
        } catch (error) {
            console.log("Failed to delete attachment: ", error);
        }
    }

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
                await syncUpdates();
            } catch (error) {
                console.error("Failed to upload attachments: ", error);
            }
            return;
        }

        const value = (name.endsWith("Id") || name === "estimatedHours") && rawValue === "" ? null : rawValue;

        const updatedTaskData = {
            ...taskData,
            [name]: value
        };

        setTaskData(updatedTaskData);

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
            console.error("Failed to update task: ", error);
        }
    };

    return (
        <div className={"task-details"}>
                    <div className={"task-edit"}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className={"form-title"}>
                                {renderMobileBackButton()}
                                <h4>
                                    <input type={"text"} name={"title"}
                                        value={taskData.title} onChange={handleChange}
                                    />
                                </h4>
                                <FollowTaskComponent task={task} size={iconSize} onFollowChange={syncUpdates} />
                            </div>
                            <div id={"form-message"}>

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
                                        {statuses?.map(status => {
                                          return (
                                              <option value={status.id} key={status.id}>{status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</option>
                                          );
                                        })}
                                    </select>
                                </div>
                                <div className={"form-element inline-form-element"}>
                                    <label htmlFor={`priority-task-${task.id}`}>Priority:</label>
                                    <select name={"priorityId"} id={`priority-task-${task.id}`}
                                        value={taskData.priorityId ?? ""} onChange={handleChange}
                                    >
                                        <option value={""}>Choose priority</option>
                                        {priorities?.map(priority => {
                                          return (
                                              <option value={priority.id} key={priority.id}>{priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}</option>
                                          );
                                        })}
                                    </select>
                                </div>
                                <div className={"form-element inline-form-element"}>
                                    <label htmlFor={`project-task-${task.id}`}>Project:</label>
                                    <select name={"projectId"} id={`project-task-${task.id}`}
                                        value={taskData.projectId ?? ""} onChange={handleChange}
                                    >
                                        <option value={""}>Choose project</option>
                                        {projects?.filter(project => !project.archived).map(project => {
                                          return (
                                              <option value={project.id} key={project.id}>{project.projectName}</option>
                                          );
                                        })}
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
                                <div className={"form-element inline-form-element"}>
                                    <label htmlFor={`estimated-hours-task-${task.id}`}>Estimated hours:</label>
                                    <select name={"estimatedHours"} id={`estimated-hours-task-${task.id}`}
                                        value={taskData.estimatedHours ?? ""} onChange={handleChange}
                                    >
                                        <option value="">Choose estimated hours</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                            <option value={num} key={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={"form-element inline-form-element"}>
                                    <div>
                                        <p className={"due-date-text"}>Due date:</p>
                                        <input type={"checkbox"} id={"new-task-no-due-date"} name={"no-due-date"}
                                            checked={!noDueDate} onChange={handleCheckboxChange}
                                        />
                                    </div>
                                    <div className={"inline-due-date"}>
                                        <label htmlFor={"new-task-no-due-date"}>{noDueDate ? "Not set" : ""}</label>
                                        {!noDueDate && (
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
                                        )}
                                    </div>
                                </div>
                                <div className={"form-element attach"}>
                                    <div className={"inline-form-element"}>
                                        <p className="attachments-title">Attachments:</p>
                                        <label htmlFor={`task-${task.id}-attachment`} className={"attachment-label"}>
                                            <AttachmentIcon size={iconSize} />
                                        </label>
                                        <input type={"file"} name={"attachments"} id={`task-${task.id}-attachment`} multiple
                                            onChange={handleChange} style={{display: "none"}}
                                        />
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
                                                                            handleAttachmentDelete(file.id); setDeletingAttachmentId(null); }}>
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
                    <div className={'task-info'}>
                        <h4>Info</h4>
                        {task?.assignedTo?.id !== task?.createdBy?.id ? createdByDiv : ""}
                        <div className={"task-info-box"}>
                            <p>Created date:</p>
                            <p>{new Date(task.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</p>
                        </div>
                        {task?.related?.length > 0 ? relatedToDiv : ""}
                        {task?.followers?.length > 0 ? followersDiv : ""}
                    </div>
                </div>
    );
}

export default Task;