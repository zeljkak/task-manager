import ProjectSvg from "../../assets/icons/project.svg?react";
function ProjectIcon() {
    const commonProps = {
        width: 18,
        height: 18,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <ProjectSvg {...commonProps} />;

}

export default ProjectIcon;