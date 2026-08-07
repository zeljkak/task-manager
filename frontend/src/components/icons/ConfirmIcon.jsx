import ConfirmSvg from "../../assets/icons/confirm.svg?react";

function ConfirmIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <ConfirmSvg {...commonProps} />;

}

export default ConfirmIcon;