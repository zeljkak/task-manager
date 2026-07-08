import CreateSvg from "../../assets/icons/create.svg?react";

function CreateIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <CreateSvg {...commonProps} />;

}

export default CreateIcon;