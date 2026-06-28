import ArchivedProjectSvg from "../../assets/icons/archived.svg?react";
import UnarchivedProjectSvg from "../../assets/icons/unarchived.svg?react";

function ArchivedProjectIcon({ size, status }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    if (status === "archived") {
        return <ArchivedProjectSvg {...commonProps} />
    }

    if (status === "active") {
        return <UnarchivedProjectSvg {...commonProps} />;
    }

    return null;

}

export default ArchivedProjectIcon;