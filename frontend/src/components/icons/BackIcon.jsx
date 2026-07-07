import BackSvg from "../../assets/icons/back.svg?react";

function BackIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <BackSvg {...commonProps} />;

}

export default BackIcon;