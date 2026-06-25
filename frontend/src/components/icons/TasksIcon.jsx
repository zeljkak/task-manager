import TasksSvg from "../../assets/icons/tasks.svg?react";

function TasksIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <TasksSvg {...commonProps} />;

}

export default TasksIcon;