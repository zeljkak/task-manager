import {useEffect, useState, useRef, useCallback} from "react";
import {createPortal} from "react-dom";
import {useNavigate, useOutletContext, useParams, Link} from "react-router-dom";
import {useAuth} from "../context/useAuth.js";
import {getTask, getDeletedTask, deleteTask, restoreTask, createRelation, deleteRelation} from "../services/taskService.js";
import BackIcon from "../components/icons/BackIcon.jsx";
import TaskEditComponent from "../components/TaskEditComponent.jsx";
import TaskViewComponent from "../components/TaskViewComponent.jsx";
import CreateTaskComponent from "../components/CreateTaskComponent.jsx";

function Task ({}) {
    const APP_URL = import.meta.env.VITE_APP_URL;
    const URLExample = `${APP_URL}/tasks/7`;

    const { taskId } = useParams();
    const { user } = useAuth();
    const { triggerTaskRefresh, isMobile, users = [], statuses = [], priorities = [], projects = [] } = useOutletContext();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relationError, setRelationError] = useState(null);


    const [task, setTask] = useState(null);
    const [deletedTask, setDeletedTask] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [showRelationModal, setShowRelationModal] = useState(false);
    const [showRelationSubmenu, setShowRelationSubmenu] = useState(false);
    const [relationUrl, setRelationUrl] = useState("");
    const [relationInputError, setRelationInputError] = useState("");

    const [isDeleting, setIsDeleting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isCreatingRelation, setIsCreatingRelation] = useState(false);
    const iconSize = isMobile ? 30 : 24;

    const submenuRef = useRef(null);

    const fetchTask = useCallback(async () => {
        try {
            const response = await getTask(taskId);
            const fetchedTask = response.data?.task || response.task;

            setTask(fetchedTask);
            setDeletedTask(false);
            setError(null);
        } catch (err) {
            if ( err.response?.status === 404 && user?.roleId === 1) {
                try {
                    const resp = await getDeletedTask(taskId);
                    const deletedTask = resp.data?.task || resp.task;
                    setTask(deletedTask);
                    setDeletedTask(true);
                    setError(null);
                    setRelationError(null);
                } catch (err1) {
                    setError(err1.response?.data?.error || "Failed to load deleted task");
                }
            } else {
                setError(err.response?.data?.error || "Failed to load task");
            }
        } finally {
            setLoading(false);
        }
    }, [taskId, user]);

    useEffect(() => {
        setLoading(true);
        fetchTask();
    }, [fetchTask]);

    // close submenu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideMenu = event.target.closest('.relation-options');
            const clickedToggleButton = event.target.closest('.create-relation-button');

            if (!clickedInsideMenu && !clickedToggleButton) {
                setShowRelationSubmenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // synchronize Task view & Home view
    const syncUpdates = async () => {
        await fetchTask(); // Updates this page
        if (triggerTaskRefresh) triggerTaskRefresh(); // Updates Home page in background
    };

    const handleDeleteTask = async () => {
        try {
            setIsDeleting(true);
            await deleteTask(task.id);
            setShowDeleteModal(false);
            await syncUpdates();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete task.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRestoreTask = async () => {
        try {
            setIsRestoring(true);
            await restoreTask(task.id);
            setShowRestoreModal(false);
            await syncUpdates();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to restore task.");
        } finally {
            setIsRestoring(false);
        }
    };

    const handleCreateRelation = async (e) => {
        if (e) e.preventDefault();
        setRelationError(null);
        setRelationInputError("");
        if (!relationUrl.trim()) {
            setRelationInputError("Please enter a valid URL.");
            return;
        }

        // regex to extract the ID following /tasks/
        const match = relationUrl.match(/\/tasks\/(\d+)/i);
        const targetTaskId = match ? match[1] : null;

        if (!targetTaskId) {
            setRelationInputError(`Invalid URL format. Example: ${URLExample}`);
            return;
        }

        if (String(targetTaskId) === String(task.id)) {
            setRelationInputError("Cannot relate a task to itself.");
            return;
        }
        try {
            setIsCreatingRelation(true);
            await createRelation(task.id, targetTaskId);
            setShowRelationModal(false);
            setRelationUrl("");
            setRelationError(null);
            await syncUpdates();
        } catch (err) {
            setShowRelationModal(false);
            setRelationError(err.response?.data?.error || "Failed to create relation.");
        } finally {
            setIsCreatingRelation(false);
        }
    };

    const handleOpenRelationModal = () => {
        setShowRelationSubmenu(false);
        setRelationInputError("");
        setRelationUrl("");
        setShowRelationModal(true);
    };

    const handleCreateNewTaskOption = () => {
        setShowRelationSubmenu(false);
        setShowCreateTaskModal(true);
    };

    const handleTaskCreated = async (createdTask) => {
        try {
            if (createdTask?.id) {
                // relate the current task to the newly created task
                await createRelation(task.id, createdTask.id);
                await syncUpdates();
            }
        } catch (err) {
            console.error("Failed to relate newly created task:", err);
            setRelationError(err.response?.data?.error || "Task created, but failed to link relation.");
            setShowCreateTaskModal(false);
            await syncUpdates();
        }
    };

    if (loading) return <div className="spinner"><p className={"loading"}>Loading task details...</p></div>;
    if (error) return <div className="error-message"><p className={"error"}>{error}</p></div>;
    if (!task) return <div>Task not found.</div>;

    const canEdit = Boolean(
        user && !deletedTask &&
        (
            task?.createdBy?.id === user.id ||
            task?.assignedTo?.id === user.id ||
            user.roleId === 1
        )
    );

    const isAllowedDelete = Boolean(
        user && !deletedTask &&
        (
            task?.createdBy?.id === user.id ||
            task?.assignedTo?.id === user.id ||
            user.roleId === 1
        )
    );

    const isAllowedRestore = Boolean(
        user && deletedTask && user.roleId === 1
    );

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
                            - {relatedTask.title}
                        </Link>
                    ))}
                </div>

            </div>
        </>
    );

    const renderMobileBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={() => navigate(-1) || navigate("/")}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    const renderMobileSubmenuBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={() => setShowRelationSubmenu(false)}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    const selectedStatus = statuses.find(s => s.id === task.statusId);
    const selectedPriority = priorities.find(p => p.id === task.priority?.id);
    const selectedProject = projects.find(p => p.id === task.project?.id);

    const relationOptionsContent = (
        <div className="relation-options card" onClick={(e) => e.stopPropagation()}>
            {renderMobileSubmenuBackButton()}
            <button type="button" className="relation-option"
                onClick={handleCreateNewTaskOption}
            >
                Create new task
            </button>
            <button type="button" className="relation-option"
                onClick={handleOpenRelationModal}
            >
                Relate existing task
            </button>
        </div>
    );

    return (
        <>
        {deletedTask && (
            <div className="error deleted"><p className="deleted-message">This task was DELETED.</p></div>
        )}
        <div className={"task-details"}>
            {canEdit ? (
                <TaskEditComponent task={task} renderMobileBackButton={renderMobileBackButton}
                                   iconSize={iconSize} syncUpdates={syncUpdates} users={users} user={user}
                                   statuses={statuses} priorities={priorities} projects={projects} relationError={relationError}
                />
            ) : (
                <TaskViewComponent task={task} renderMobileBackButton={renderMobileBackButton} user={user}
                                   iconSize={iconSize} syncUpdates={syncUpdates} selectedStatus={selectedStatus}
                                   selectedPriority={selectedPriority} selectedProject={selectedProject} deletedTask={deletedTask} relationError={relationError}
                />
            )}
            <div className={"task-info"}>
                <div className={"task-info-header"}>
                    <h4>Info</h4>
                </div>
                {user.roleId === 1 && (
                    <div className={"task-info-box"}>
                        <p>Task ID: {task.id}</p>
                    </div>
                )}
                {task?.assignedTo?.id !== task?.createdBy?.id ? createdByDiv : ""}
                <div className={"task-info-box"}>
                    <p>Created date:</p>
                    <p>{new Date(task.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</p>
                </div>
                {task?.related?.length > 0 ? relatedToDiv : ""}
                <div className={`task-info-box relation-container ${showRelationSubmenu ? "open" : ""}`} ref={submenuRef}>
                    <button type="button" className="create-relation-button"
                            onClick={() => setShowRelationSubmenu(prev => !prev)}
                        >
                            Add related task
                        </button>
                    {showRelationSubmenu && (
                        isMobile ? (
                            <div className="modal-overlay" onClick={() => setShowRelationSubmenu(false)}>
                                {relationOptionsContent}
                            </div>
                        ) : (
                            relationOptionsContent
                        )
                    )}
                </div>
                {task?.followers?.length > 0 ? followersDiv : ""}
                {isAllowedDelete && (
                    <div className={"task-info-box"}>
                        <button type="button" className="delete-task-button"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete Task
                        </button>
                    </div>
                )}
                {isAllowedRestore && (
                    <div className={"task-info-box"}>
                        <button type="button" className="restore-task-button"
                            onClick={() => setShowRestoreModal(true)}
                        >
                            Restore Task
                        </button>
                    </div>
                )}
            </div>
        </div>

        {showRelationModal && createPortal(
            <div className="confirmation-overlay">
                <div className="confirmation-div">
                    <p>Paste the link of the task you want to relate to this task:</p><br/>
                    <input type={"url"} name={"relatedTaskId"} id={"relation-input"} value={relationUrl}
                        placeholder={URLExample}
                        onChange={(e) => setRelationUrl(e.target.value)}/>
                    {relationInputError && <p className="error" style={{ color: "#ff6b6b", marginTop: "8px" }}>{relationInputError}</p>}
                    <div className="confirmation-actions">
                        <button type="button" className="positive"
                            onClick={handleCreateRelation}
                            disabled={isCreatingRelation}
                        >
                            {isCreatingRelation ? "Relating..." : "Relate"}
                        </button>
                        <button type="button" className="negative"
                            onClick={() => setShowRelationModal(false)}
                            disabled={isCreatingRelation}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>,
            document.getElementById("content") || document.body
        )}

        {showDeleteModal && createPortal(
            <div className="confirmation-overlay">
                <div className="confirmation-div">
                    <p>Are you sure you want to delete this task?</p>
                    <div className="confirmation-actions">
                        <button type="button" className="positive"
                            onClick={handleDeleteTask}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Yes"}
                        </button>
                        <button type="button" className="negative"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={isDeleting}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>,
            document.getElementById("content") || document.body
        )}

        {showRestoreModal && createPortal(
            <div className="confirmation-overlay">
                <div className="confirmation-div">
                    <p>Are you sure you want to restore this task?</p>
                    <div className="confirmation-actions">
                        <button type="button" className="positive"
                            onClick={handleRestoreTask}
                            disabled={isRestoring}
                        >
                            {isRestoring ? "Restoring..." : "Yes"}
                        </button>
                        <button type="button" className="negative"
                            onClick={() => setShowRestoreModal(false)}
                            disabled={isRestoring}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>,
            document.getElementById("content") || document.body
        )}

        {showCreateTaskModal && createPortal(
            <div className="modal-overlay">
                <CreateTaskComponent
                    onClose={() => setShowCreateTaskModal(false)}
                    onCreated={handleTaskCreated} isMobile={isMobile}
                />
            </div>,
            document.getElementById("content") || document.body
        )}

        </>
    );
}

export default Task;