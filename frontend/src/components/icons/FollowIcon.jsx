import FollowSvg from "../../assets/icons/following.svg?react";
import UnfollowSvg from "../../assets/icons/not-following.svg?react";

function FollowIcon({ state, size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    if (state) {
        return <UnfollowSvg {...commonProps} />;
    } else {
        return <FollowSvg {...commonProps} />;
    }
}

export default FollowIcon;