import LowPrioritySvg from "../../assets/icons/low-priority.svg?react";
import MediumPrioritySvg from "../../assets/icons/medium-priority.svg?react";
import HighPrioritySvg from "../../assets/icons/high-priority.svg?react";

function PriorityIcon({ level, size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    if (level === "low") {
        return <LowPrioritySvg {...commonProps} />;
    }

    if (level === "medium") {
        return <MediumPrioritySvg {...commonProps} />;
    }

    if (level === "high") {
        return <HighPrioritySvg {...commonProps} />;
    }

    return null;

}

export default PriorityIcon;