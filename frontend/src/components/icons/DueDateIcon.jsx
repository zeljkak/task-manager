import DueDateSvg from "../../assets/icons/due-date.svg?react";

function DueDateIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <DueDateSvg {...commonProps} />;

}

export default DueDateIcon;