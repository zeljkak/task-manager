import EditSvg from "../../assets/icons/edit.svg?react";

function EditIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <EditSvg {...commonProps} />;

}

export default EditIcon;