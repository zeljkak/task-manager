function ProjectData({ project }) {
    {project.attachments.map(attachment => (
                <p>{project.attachment}</p>
        ))}
    return (
        <div className={"project-data"}>
            <p className={"project-description"}>Description</p>
            <p>{project.projectDescription}</p><br />
            <p className={"project-created-at"}>Date Created</p>
            <p>{new Date(project.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</p><br />
            <p className={"project-created-by"}>Created By</p>
            <p><a href="#">{project.createdBy.firstName} {project.createdBy.lastName}</a></p><br/>
            <p className={"project-attachments"}>Attachments</p>
            {project.attachments.map(attachment => (
                <a href={attachment.fileUrl} key={attachment.id}>{attachment.id ? attachment.fileName : ""}</a>
             ))}
        </div>
    );
}

function ProjectCardComponent({ project }) {
    return (
        <div className="card">
            <div className="card-body">
                <h5 className="project-title">{project.projectName}</h5><br />
                <ProjectData project={project} />
            </div>
        </div>
    );
}

export default ProjectCardComponent;