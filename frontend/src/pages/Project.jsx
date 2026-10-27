import {useEffect, useState, useCallback} from "react";
import {useNavigate, useOutletContext, useParams, Link} from "react-router-dom";
import {useAuth} from "../context/useAuth.js";
import {getProject} from "../services/projectService.js";
import BackIcon from "../components/icons/BackIcon.jsx";
import ProjectEditComponent from "../components/ProjectEditComponent.jsx";

function Project ({}) {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { isMobile, refreshDropdowns } = useOutletContext();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [project, setProject] = useState(null);
    const iconSize = isMobile ? 30 : 24;

    const fetchProject = useCallback(async () => {
        try {
            const response = await getProject(projectId);
            const fetchedProject = response.data?.project || response.project;

            setProject(fetchedProject);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch project details:", err);
            setError(err.response?.data?.error || "Failed to load project");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        setLoading(true);
        fetchProject();
    }, [fetchProject]);

    // Synchronize Project view & Projects view
    const syncUpdates = async () => {
        await fetchProject(); // Updates this page
        if (refreshDropdowns) refreshDropdowns(); // Updates global layout dropdowns
    };

    if (loading) return <div className="spinner"><p className={"loading"}>Loading project details...</p></div>;
    if (error) return <div className="error-message"><p className={"error"}>{error}</p></div>;
    if (!project) return <div>Project not found.</div>;

    const canEdit = Boolean(user && user.roleId === 1);

    const createdByDiv = (
        <>
            <div className={"project-info-box"}>
                <p>Created by:</p>
                <a href={"#"} target="_blank" rel="noopener noreferrer">
                    {project?.createdBy?.firstName} {project?.createdBy?.lastName}
                </a>
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

    return (
        <div className={"project-details"}>
            {canEdit ? (
                <ProjectEditComponent project={project} renderMobileBackButton={renderMobileBackButton}
                                   iconSize={iconSize} syncUpdates={syncUpdates} user={user}
                />
            ) : ("")}
            <div className={"project-info"}>
                <div className={"project-info-header"}>
                    <h4>Info</h4>
                </div>
                {project?.createdBy?.id ? createdByDiv : ""}
                <div className={"project-info-box"}>
                    <p>Created date:</p>
                    <p>{new Date(project.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</p>
                </div>
            </div>
        </div>
    );
}

export default Project;