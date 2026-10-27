import { Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";

function ProjectData({ project }) {
    return (
        <div className={"project-data"}>
            <p className={"project-description"}>Description:</p>
            <p>{project.projectDescription || "No description provided"}</p><br />
            <p className={"project-created-at"}>Date Created:</p>
            <p>{new Date(project.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</p><br />
            <p className={"project-created-by"}>Created By:</p>
            <p><a href="#" onClick={(e) => e.stopPropagation()}>{project.createdBy.firstName} {project.createdBy.lastName}</a></p>
            {project.attachments?.length > 0 ? <><br/><p className={"project-attachments"}>Attachments:</p></> : ""}
            {project.attachments.map(attachment => (
                <a href={attachment.fileUrl} key={attachment.id}
                target="_blank" rel="noopener noreferrer" className="file-name project-attachment"
                onClick={(e) => e.stopPropagation()}>
                    {attachment.id ? attachment.fileName : ""}
                </a>
             ))}
        </div>
    );
}

function ProjectCardComponent({ project, index = 0, canEdit, isMobile, iconSize, user, syncUpdates }) {
    const isDragDisabled = !canEdit || isMobile;
    const navigate = useNavigate();
    const handleClick = (e) => {
        // Prevent card navigation if clicking inner interactive elements
        if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return;

        // Check if the current user is an admin
        const isAdmin = user?.roleId === 1;

        if (isAdmin) {
            navigate(`/projects/${project.id}`);
        }
    };

    return (
        <Draggable draggableId={String(project.id)} index={index} isDragDisabled={isDragDisabled}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`card ${snapshot.isDragging ? "dragging" : ""}`}
            id={`project-card-${project.id}`}
            data-scroll-target={`project-card-${project.id}`} onClick={handleClick}
            style={{ userSelect: "none", marginBottom: "8px",
              ...provided.draggableProps.style }}>

              <div className="card-body">
                <h5 className="project-title">{project.projectName}</h5><br />
                <ProjectData project={project} />
              </div>
            </div>
          )}
        </Draggable>
    );
}

export default ProjectCardComponent;