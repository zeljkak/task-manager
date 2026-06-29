import StatusIcon from "./icons/StatusIcon.jsx";

function TaskStatusComponent({ status, length, children }) {
    return (
        <div className={"task-status"} id={status.status.replace("_", "-")}>
            <div className={"fixed-status"}>
                <h4>
                    <StatusIcon status={status.status} size={26} />
                    {status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </h4>
                <p>{length}</p>
            </div><br />
            {children}
        </div>
    );
}

export default TaskStatusComponent;