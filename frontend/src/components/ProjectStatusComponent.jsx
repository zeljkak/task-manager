import ArchivedProjectIcon from "./icons/ArchivedProjectIcon.jsx";
import { Droppable } from "@hello-pangea/dnd";

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
            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`status-droppable-area ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                        style={{ minHeight: "100px" }}
                    >
                        {children}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}

export default ProjectStatusComponent;