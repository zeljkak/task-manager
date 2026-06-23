import ToDoSvg from "../../assets/icons/to-do.svg?react";
import InProgressSvg from "../../assets/icons/in-progress.svg?react"
import DoneSvg from "../../assets/icons/done.svg?react"
import CancelledSvg from "../../assets/icons/cancelled.svg?react"

function StatusIcon({ status }) {
    const commonProps = {
        width: 18,
        height: 18,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    if (status === "todo") {
        return <ToDoSvg {...commonProps} />;
    }

    if (status === "in_progress") {
        return <InProgressSvg {...commonProps} />;
    }

    if (status === "done") {
        return <DoneSvg {...commonProps} />;
    }

    if (status === "cancelled") {
        return <CancelledSvg {...commonProps} />;
    }

    return null;

}

export default StatusIcon;