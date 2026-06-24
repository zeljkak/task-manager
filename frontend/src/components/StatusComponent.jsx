import StatusIcon from "./icons/StatusIcon.jsx";

function StatusComponent({ status, children }) {
    return (
        <div className={"task-status"} id={status.status.replace("_", "-")}>
            <h4>
                <StatusIcon status={status.status} />
                {status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
            </h4><br />
            {children}
        </div>
    );
}

export default StatusComponent;