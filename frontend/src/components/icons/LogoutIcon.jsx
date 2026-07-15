import LogoutSvg from "../../assets/icons/logout.svg?react";

function LogoutIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <LogoutSvg {...commonProps} />;

}

export default LogoutIcon;