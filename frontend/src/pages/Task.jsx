import {useEffect, useState, useRef, useCallback} from "react";
import {useNavigate, useOutletContext, useParams, Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {getTask} from "../services/taskService.js";
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
    const iconSize = isMobile ? 30 : 24;

    const fetchTask = useCallback(async () => {
        try {
            const response = await getTask(taskId);
            const fetchedTask = response.data?.task || response.task;

            setTask(fetchedTask);
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

    const canEdit = Boolean(
        user &&
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
                onClick={() => navigate(-1)}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    const selectedStatus = statuses.find(s => s.id === task.statusId);
    const selectedPriority = priorities.find(p => p.id === task.priority?.id);
    const selectedProject = projects.find(p => p.id === task.project?.id);

    return (
        <div className={"task-details"}>
            {canEdit ? (
                <TaskEditComponent task={task} renderMobileBackButton={renderMobileBackButton}
                                   iconSize={iconSize} syncUpdates={syncUpdates} users={users} user={user}
                                   statuses={statuses} priorities={priorities} projects={projects}
                />
            ) : (
                <TaskViewComponent task={task} renderMobileBackButton={renderMobileBackButton} user={user}
                                   iconSize={iconSize} syncUpdates={syncUpdates} selectedStatus={selectedStatus}
                                   selectedPriority={selectedPriority} selectedProject={selectedProject}
                />
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