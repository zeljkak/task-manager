import ArchivedProjectIcon from "./icons/ArchivedProjectIcon.jsx";

function ProjectStatusComponent({ status, length, children, size }) {
    return (
        <div className={"project-status"} id={status}>
            <div className={"fixed-status"}>
                <h4>
                    <ArchivedProjectIcon status={status} size={size} />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </h4>
                <p>{length}</p>
            </div><br />
            {children}
        </div>
    );
}

export default ProjectStatusComponent;