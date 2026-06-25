import BacklogSvg from "../../assets/icons/backlog.svg?react";
import ToDoSvg from "../../assets/icons/to-do.svg?react";
import InProgressSvg from "../../assets/icons/in-progress.svg?react";
import DoneSvg from "../../assets/icons/done.svg?react";
import CancelledSvg from "../../assets/icons/cancelled.svg?react";

function StatusIcon({ size, status }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", verticalAlign: "middle" }
    };

    if (status === "backlog") {
        return <BacklogSvg {...commonProps} />
    }

    if (status === "to_do") {
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