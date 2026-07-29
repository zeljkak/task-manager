import StatusIcon from "./icons/StatusIcon.jsx";
import { Droppable } from "@hello-pangea/dnd";

function TaskStatusComponent({ status, filter, length, children, size }) {
    const hidden = filter && filter !== status.id;

    return (
        <div className={`task-status ${hidden ? "hidden" : ""}`}
            id={status.status.replace("_", "-")}
            style={{ minHeight: "200px" }}>
            <div className={"fixed-status"}>
                <h4>
                    <StatusIcon status={status.status} size={size} />
                    {status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </h4>
                <p>{length}</p>
            </div><br />
            <Droppable droppableId={String(status.id)}>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`task-list-dropzone ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                      style={{ minHeight: "150px", flexGrow: 1,
                        transition: "background-color 0.2s ease" }}>
                      {children}
                      {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}

export default TaskStatusComponent;