import StatusIcon from "./icons/StatusIcon.jsx";

function TaskStatusComponent({ status, filter, length, children, size }) {
    const hidden = filter && filter !== status.id;

    return (
        <div className={`task-status ${hidden ? "hidden" : ""}`} id={status.status.replace("_", "-")}>
            <div className={"fixed-status"}>
                <h4>
                    <StatusIcon status={status.status} size={size} />
                    {status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </h4>
                <p>{length}</p>
            </div><br />
            {children}
        </div>
    );
}

export default TaskStatusComponent;