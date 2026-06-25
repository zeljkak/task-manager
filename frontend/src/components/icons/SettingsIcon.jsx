import SettingSvg from "../../assets/icons/settings.svg?react";

function SettingsIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <SettingSvg {...commonProps} />;

}

export default SettingsIcon;