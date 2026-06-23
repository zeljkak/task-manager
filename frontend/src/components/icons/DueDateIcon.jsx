import DueDateSvg from "../../assets/icons/due-date.svg?react";
function DueDateIcon() {
    const commonProps = {
        width: 18,
        height: 18,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <DueDateSvg {...commonProps} />;

}

export default DueDateIcon;