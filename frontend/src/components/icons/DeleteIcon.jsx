import DeleteSvg from "../../assets/icons/delete.svg?react";

function DeleteIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <DeleteSvg {...commonProps} />;

}

export default DeleteIcon;