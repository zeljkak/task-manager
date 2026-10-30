import {useEffect, useState, useRef, useCallback} from "react";
import {useNavigate, useOutletContext, useParams, Link} from "react-router-dom";
import {useAuth} from "../context/useAuth.js";
import {getTask, getDeletedTask} from "../services/taskService.js";
import BackIcon from "../components/icons/BackIcon.jsx";
import TaskEditComponent from "../components/TaskEditComponent.jsx";
import TaskViewComponent from "../components/TaskViewComponent.jsx";

function Task ({}) {
    const { taskId } = useParams();
    const { user } = useAuth();
    const { triggerTaskRefresh, isMobile, users = [], statuses = [], priorities = [], projects = [], refreshDropdowns } = useOutletContext();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [task, setTask] = useState(null);
    const [deletedTask, setDeletedTask] = useState(false);
    const iconSize = isMobile ? 30 : 24;

    const fetchTask = useCallback(async () => {
        try {
            const response = await getTask(taskId);
            const fetchedTask = response.data?.task || response.task;

            setTask(fetchedTask);
            setDeletedTask(false);
            setError(null);
        } catch (err) {
            if (user?.roleId === 1) {
                try {
                    const resp = await getDeletedTask(taskId);
                    const deletedTask = resp.data?.task || resp.task;
                    setTask(deletedTask);
                    setDeletedTask(true);
                    setError(null);
                } catch (err1) {
                    console.error("Failed to fetch deleted task details:", err1);
                    setError(err1.response?.data?.error || "Failed to load deleted task");
                }
            } else {
                console.error("Failed to fetch task details:", err);
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

    // Synchronize Task view & Home view
    const syncUpdates = async () => {
        await fetchTask(); // Updates this page
        if (triggerTaskRefresh) triggerTaskRefresh(); // Updates Home page in background
        //if (refreshDropdowns) refreshDropdowns(); // Updates global layout dropdowns
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

    const renderMobileBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={() => navigate(-1) || navigate("/")}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    const selectedStatus = statuses.find(s => s.id === task.statusId);
    const selectedPriority = priorities.find(p => p.id === task.priority?.id);
    const selectedProject = projects.find(p => p.id === task.project?.id);

    return (
        <>
        {deletedTask && (
            <div className="error deleted"><p className="deleted-message">This task was DELETED.</p></div>
        )}
        <div className={"task-details"}>
            {canEdit ? (
                <TaskEditComponent task={task} renderMobileBackButton={renderMobileBackButton}
                                   iconSize={iconSize} syncUpdates={syncUpdates} users={users} user={user}
                                   statuses={statuses} priorities={priorities} projects={projects}
                />
            ) : (
                <TaskViewComponent task={task} renderMobileBackButton={renderMobileBackButton} user={user}
                                   iconSize={iconSize} syncUpdates={syncUpdates} selectedStatus={selectedStatus}
                                   selectedPriority={selectedPriority} selectedProject={selectedProject} deletedTask={deletedTask}
                />
            )}
            <div className={"task-info"}>
                <div className={"task-info-header"}>
                    <h4>Info</h4>
                </div>
                {user.roleId === 1 ? <p>Task ID: {task.id}</p> : ""}
                {task?.assignedTo?.id !== task?.createdBy?.id ? createdByDiv : ""}
                <div className={"task-info-box"}>
                    <p>Created date:</p>
                    <p>{new Date(task.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</p>
                </div>
                {task?.related?.length > 0 ? relatedToDiv : ""}
                {task?.followers?.length > 0 ? followersDiv : ""}
            </div>
        </div>
        </>
    );
}

export default Task;