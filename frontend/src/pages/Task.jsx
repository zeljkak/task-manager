import {useEffect, useState, useRef, useCallback} from "react";
import {useNavigate, useOutletContext, useParams, Link} from "react-router-dom";
import {createPortal} from "react-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {getTask, createTaskAttachment, updateTask, getTaskComments, createTaskComment} from "../services/taskService.js";
import {createCommentAttachment, updateComment, deleteComment} from "../services/commentService.js";
import {deleteAttachment} from "../services/attachmentService.js";
import BackIcon from "../components/icons/BackIcon.jsx";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import DeleteIcon from "../components/icons/DeleteIcon.jsx";
import DatePickerComponent from "../components/DatePickerComponent.jsx";
import FollowTaskComponent from "../components/FollowTaskComponent.jsx";

function Task ({}) {
    const { taskId } = useParams();
    const { user } = useAuth();
    const { triggerTaskRefresh, isMobile, users = [], statuses = [], priorities = [], projects = [], refreshDropdowns } = useOutletContext();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [task, setTask] = useState(null);
    const [noDueDate, setNoDueDate] = useState(true);
    const [taskAttachments, setTaskAttachments] = useState([]);
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [commentError, setCommentError] = useState("");
    const [commentItemErrors, setCommentItemErrors] = useState({});

    const dateTimeoutRef = useRef(null);
    const lastValidTitleRef = useRef("");
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
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

    useEffect(() => {
        return () => {
            if (dateTimeoutRef.current) {
                clearTimeout(dateTimeoutRef.current);
            }
        };
    }, []);

    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        try {
            const response = await getTaskComments(taskId);
            const fetchedComments = response.data?.comments || [];
            setComments(fetchedComments);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setCommentsLoading(false);
        }
    }, [taskId]);

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
            lastValidTitleRef.current = fetchedTask?.title || "";
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
        fetchComments();
    }, [fetchTask, fetchComments]);

    useEffect(() => {
        if (errorMessage) {
            requestAnimationFrame(() => {
                const scrollContainer = document.querySelector(".task-details");

                if (scrollContainer) {
                    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
                }
            });
        }
    }, [errorMessage]);

    // Synchronize Task view & Home view
    const syncUpdates = async () => {
        await fetchTask(); // Updates this page
        await fetchComments();
        if (triggerTaskRefresh) triggerTaskRefresh(); // Updates Home page in background
        //if (refreshDropdowns) refreshDropdowns(); // Updates global layout dropdowns
    };

    const handleNewCommentFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setCommentAttachments(prev => [...prev, ...files]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeNewCommentAttachment = (indexToRemove) => {
        setCommentAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleEditCommentFileChange = async (e, commentId) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            const commentAttachmentData = new FormData();
            files.forEach(file => {
                commentAttachmentData.append("file", file);
            });

            await createCommentAttachment(commentId, commentAttachmentData);
            await syncUpdates();
        } catch (err) {
            console.error("Failed to add attachment to existing comment:", err);
        } finally {
            if (editFileInputRef.current) {
                editFileInputRef.current.value = "";
            }
        }
    };

    const handleEditCommentTextChange = async (commentId, newText) => {
        const currentComment = comments.find(c => c.id === commentId);
        if (!currentComment) return;

        const previousText = currentComment.comment || "";
        const hasExistingAttachments = currentComment?.attachments && currentComment.attachments.length > 0;

        setComments(prevComments =>
            prevComments.map(c =>
                c.id === commentId ? { ...c, comment: newText } : c
            )
        );

        try {
            await updateComment(commentId, { comment: newText, hasAttachments: hasExistingAttachments });
            setCommentItemErrors(prev => ({ ...prev, [commentId]: "" }));
        } catch (err) {
            setComments(prevComments =>
                prevComments.map(c =>
                    c.id === commentId ? { ...c, comment: previousText } : c
                )
            );

            const errorMsg = err.response?.data?.error || "Failed to update comment.";
            setCommentItemErrors(prev => ({ ...prev, [commentId]: errorMsg }));

            setTimeout(() => {
                setCommentItemErrors(prev => ({ ...prev, [commentId]: "" }));
            }, 3000);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        const hasText = newCommentText.trim().length > 0;
        const hasAttachments = commentAttachments.length > 0;

        if (!hasText && !hasAttachments) return;

        setIsSubmittingComment(true);
        setCommentError("");

        try {
            const payload = {
                comment: newCommentText,
                hasAttachments: hasAttachments
            };

            const commentResponse = await createTaskComment(taskId, payload);
            const createdComment = commentResponse.data?.comment;

            if(hasAttachments && createdComment?.id) {
                const commentAttachmentData = new FormData();
                commentAttachments.forEach(file => {
                    commentAttachmentData.append("file", file);
                });

                await createCommentAttachment(
                    createdComment.id,
                    commentAttachmentData
                );
            }
            setNewCommentText("");
            setCommentAttachments([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await syncUpdates();
        } catch (err) {
            console.error("Failed to post comment:", err);
            setCommentError(err.response?.data?.error || "Failed to post comment.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            await deleteComment(commentId);
            await syncUpdates();
        } catch (error) {
            console.error("Failed to delete comment: ", error);
            const errorMsg = error.response?.data?.error || "Failed to delete comment.";
            setCommentItemErrors(prev => ({ ...prev, [commentId]: errorMsg }));
            setTimeout(() => {
                setCommentItemErrors(prev => ({ ...prev, [commentId]: "" }));
            }, 3000);
        } finally {
            setDeletingCommentId(null);
        }
    };

    if (loading) return <div className="spinner"><p className={"loading"}>Loading task details...</p></div>;
    if (error) return <div className="error-message"><p className={"error"}>{error}</p></div>;
    if (!task) return <div>Task not found.</div>;

    const canEdit = Boolean(
        user &&
        (
            task?.createdBy?.id === user.id ||
            task?.assignedTo?.id === user.id ||
            user.roleId === 1
        )
    );

    const handleAttachmentDelete = async (attachmentId) => {
        try {
            await deleteAttachment(attachmentId);
            await syncUpdates();
        } catch (error) {
            console.error("Failed to delete attachment: ", error);
        }
    }

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
                        <Link to={`/tasks/${relatedTask.id}`} key={relatedTask.id}>
                            {relatedTask.title}
                        </Link>
                    ))}
                </div>

            </div>
        </>
    );

    const commentsDiv = (
        <div className={"task-comments"}>
            <h4>Comments</h4>

            {commentsLoading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="no-comments">No comments yet.</p>
            ) : (
                <div className="comments-list">
                    {comments.map((c) => {
                        const isAuthor = c.user?.id === user.id;
                        return (
                            <div key={c.id} className="comment-item">
                                <div className="comment-header">
                                    <strong>{c.user ? `${c.user.firstName} ${c.user.lastName}` : "User"}</strong>
                                    {c.createdAt && (
                                        <span className="comment-date">
                                            {new Date(c.createdAt).toLocaleString("en-GB")
                                                .replaceAll("/", ".")
                                                .replaceAll(",", ".")
                                                .concat(".").slice(0, -1)}
                                        </span>
                                    )}
                                    {isAuthor && (
                                        <button type="button" className="delete-comment-btn"
                                            onClick={() => setDeletingCommentId(c.id)}>
                                            <DeleteIcon size={iconSize} />
                                        </button>
                                    )}
                                </div>
                                {deletingCommentId === c.id && (
                                    createPortal(
                                        <div className="confirmation-overlay">
                                            <div className="confirmation-div">
                                                <p>Are you sure you want to delete this comment?</p>
                                                <div className="confirmation-actions">
                                                    <button type="button" className="positive"
                                                        onClick={() => handleCommentDelete(c.id)}>
                                                        Yes
                                                    </button>
                                                    <button type="button" className="negative"
                                                        onClick={() => setDeletingCommentId(null)}>
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        </div>,
                                        document.getElementById("content") || document.body
                                    )
                                )}
                                {isAuthor ? (
                                    <>
                                        <div className={"textarea-wrapper"}>
                                            <textarea className="comment-text-input" value={c.comment || ""}
                                                onChange={(e) => handleEditCommentTextChange(c.id, e.target.value)}
                                            />
                                            {c.attachments && c.attachments.length > 0 && (
                                                <div className={"comment-attachments"}>
                                                    {c.attachments.map((a) => (
                                                        <div key={a.id} className={"attachment-chip"}>
                                                            {deletingAttachmentId === a.id ? (
                                                                createPortal(
                                                                    <div className={"confirmation-overlay"}>
                                                                        <div className="confirmation-div">
                                                                            <p>Delete <a href={a.fileUrl} target="_blank"
                                                                                         rel="noopener noreferrer"
                                                                                         className="file-name">{a.fileName}</a>?</p>
                                                                            <div className={"confirmation-actions"}>
                                                                                <button type="button" className={"positive"}
                                                                                        onClick={() => {
                                                                                            handleAttachmentDelete(a.id);
                                                                                            setDeletingAttachmentId(null);
                                                                                        }}>
                                                                                    Yes
                                                                                </button>
                                                                                <button type="button" className={"negative"}
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
                                                                    <button type="button" onClick={() => setDeletingAttachmentId(a.id)}>
                                                                        <DeleteIcon size={iconSize}/>
                                                                    </button>
                                                                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                                                                       className="file-name">
                                                                        {a.fileName}
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <label htmlFor={`edit-comment-attachment-${c.id}`} className={"attachment-label"}>
                                                <AttachmentIcon size={iconSize} />
                                            </label>
                                            <input type={"file"} name={`edit-comment-attachment-${c.id}`}
                                                className={"attachment-input"} id={`edit-comment-attachment-${c.id}`}
                                                multiple ref={editFileInputRef}
                                                onChange={(e) => handleEditCommentFileChange(e, c.id)}
                                            />
                                        </div>
                                        {commentItemErrors[c.id] && (
                                            <p className="error comment-item-error">{commentItemErrors[c.id]}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="comment-text">{c.comment ? c.comment : ""}</p>
                                        {c.attachments && c.attachments.length > 0 && (
                                            <div className={"comment-attachments"}>
                                                {c.attachments.map((a) => (
                                                    <div key={a.id} className={"attachment-chip"}>
                                                        <AttachmentIcon size={iconSize}/>
                                                        <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                                                           className="file-name">
                                                            {a.fileName}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                <hr/>
                            </div>
                        )
                    })}
                </div>
            )}

            {commentError && <p className="error">{commentError}</p>}

            <form onSubmit={handleCommentSubmit} className="add-comment-form">
                <div className={"textarea-wrapper"}>
                    <textarea placeholder="Write a comment..."
                        value={newCommentText} rows={3} name={"new-comment-text"}
                        onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    {commentAttachments.length > 0 && (
                        <div className="selected-comment-attachments">
                            {commentAttachments.map((file, idx) => (
                                <div key={idx} className={"attachment-chip"}>
                                    <button type="button" onClick={() => removeNewCommentAttachment(idx)}>
                                        <DeleteIcon size={iconSize} />
                                    </button>
                                    <a href={"#"} target="_blank" rel="noopener noreferrer" className="file-name">
                                        {file.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                    <label htmlFor={"new-comment-attachment"} className={"attachment-label"}>
                        <AttachmentIcon size={iconSize} />
                    </label>
                </div>
                <input type={"file"} name={"comment-attachments"} className={"attachment-input"}
                   id={"new-comment-attachment"} multiple ref={fileInputRef} onChange={handleNewCommentFileChange} />
                <button type="submit" id={"submit-new-comment-button"}
                    disabled={isSubmittingComment || (!newCommentText.trim() && commentAttachments.length === 0)}>
                    {isSubmittingComment ? "Commenting..." : "Comment"}
                </button>

            </form>
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
                setErrorMessage("Title is required.");

                // Revert back to the last valid title
                setTaskData(prev => ({
                    ...prev,
                    title: lastValidTitleRef.current
                }));

                // Clear error after 3 seconds
                setTimeout(() => {
                    setErrorMessage("");
                }, 3000);

                return;
            }

            // Keep track of valid title entries
            lastValidTitleRef.current = rawValue;
            setErrorMessage("");
        }

        if (name === "attachments") {
            const fileList = [...files];
            if (fileList.length === 0) return;

            setTaskAttachments(fileList);

            try {
                const attachmentData = new FormData();
                fileList.forEach(file => {
                    attachmentData.append("file", file);
                });

                await createTaskAttachment(task.id, attachmentData);
                setTaskAttachments([]);
                await syncUpdates();
            } catch (error) {
                console.error("Failed to upload attachments: ", error);
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

    const selectedStatus = statuses.find(s => s.id === taskData.statusId);
    const selectedPriority = priorities.find(p => p.id === taskData.priorityId);
    const selectedProject = projects.find(p => p.id === taskData.projectId);

    return (
        <div className={"task-details"}>
            {canEdit ? (
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
                        {errorMessage && (
                            <div className={"error-message"}>
                                <p className={"error"}>{errorMessage}</p>
                            </div>
                        )}
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
                                    <input type={"file"} name={"attachments"}
                                       className={"attachment-input"} id={`task-${task.id}-attachment`} multiple
                                        onChange={handleChange}
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
                    {commentsDiv}
                </div>
            ) : (
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
                            <p><strong>Assignee:</strong></p>
                            <p>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "Unassigned"}</p>
                        </div>
                        <div className={"display-element inline-display-element"}>
                            <p><strong>Task status:</strong></p>
                            <p>{selectedStatus?.status ? selectedStatus.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Not set"}</p>
                        </div>
                        <div className={"display-element inline-display-element"}>
                            <p><strong>Priority:</strong></p>
                            <p>{selectedPriority?.level ? selectedPriority.level.charAt(0).toUpperCase() + selectedPriority.level.slice(1) : "None"}</p>
                        </div>
                        <div className={"display-element inline-display-element"}>
                            <p><strong>Project:</strong></p>
                            <p>{selectedProject?.projectName || task.project?.projectName || "None"}</p>
                        </div>
                        <div className={"display-element inline-display-element"}>
                            <p><strong>Estimated hours:</strong></p>
                            <p>{task.estimatedHours || "Not set"}</p>
                        </div>
                        <div className={"display-element inline-display-element"}>
                            <p><strong>Due date:</strong></p>
                            <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".") : "Not set"}</p>
                        </div>
                        {task?.attachments && task?.attachments.length > 0 && (
                            <div className={"display-element attach"}>
                                <p className="attachments-title"><strong>Attachments:</strong></p>
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
                    {commentsDiv}
                </div>
            )}
            <div className={"task-info"}>
                <div className={"task-info-header"}>
                    <h4>Info</h4>
                </div>
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