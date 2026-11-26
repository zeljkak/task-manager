import SidebarCloseSvg from "../../assets/icons/sidebar-close.svg?react";
import SidebarOpenSvg from "../../assets/icons/sidebar-open.svg?react";

function SidebarIcon({ size, state }) {
    const commonProps = {
        width: size,
        height: size,
        style: { verticalAlign: "middle" }
    };

    return state ? <SidebarCloseSvg {...commonProps} /> : <SidebarOpenSvg {...commonProps} />
}

export default SidebarIcon;