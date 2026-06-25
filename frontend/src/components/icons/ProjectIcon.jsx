import ProjectSvg from "../../assets/icons/project.svg?react";

function ProjectIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <ProjectSvg {...commonProps} />;

}

export default ProjectIcon;