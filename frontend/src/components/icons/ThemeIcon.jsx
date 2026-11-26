import ThemeToLightSvg from "../../assets/icons/theme-to-light.svg?react";
import ThemeToDarkSvg from "../../assets/icons/theme-to-dark.svg?react";

function ThemeIcon({ currentTheme }) {
    const commonProps = {
        width: 60,
        height: 23,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    if (currentTheme === "dark") {
        return <ThemeToLightSvg {...commonProps} />;
    } else {
        return <ThemeToDarkSvg {...commonProps} />;
    }

}

export default ThemeIcon;