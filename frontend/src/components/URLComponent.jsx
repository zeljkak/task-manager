import { useState, useEffect } from "react";

const URL_REGEX = /(https?:\/\/(?:(?!https?:\/\/)[^\s])+|www\.[^\s]+)/g;
const URL_MATCH_REGEX = /^(https?:\/\/(?:(?!https?:\/\/)[^\s])+|www\.[^\s]+)$/;

export const formatLinksWithNewLines = (text) => {
    if (!text) return text;

    const parts = text.split(URL_REGEX);

    return parts
        .map((part, index) => {
            if (URL_MATCH_REGEX.test(part)) {
                let prevNonEmpty = "";
                for (let i = index - 1; i >= 0; i--) {
                    if (parts[i]) {
                        prevNonEmpty = parts[i];
                        break;
                    }
                }

                const needsNewLine = Boolean(prevNonEmpty) && !/\s$/.test(prevNonEmpty);
                return needsNewLine ? `\n${part}` : part;
            }
            return part;
        })
        .join("");
};

const toSafeHref = (rawPart) => {
    const candidate = /^https?:\/\//i.test(rawPart) ? rawPart : `https://${rawPart}`;
    try {
        const parsed = new URL(candidate);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.toString();
        }
        return null;
    } catch {
        return null;
    }
};

const getHostname = (url) => {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
};

function URLComponent({ text, placeholder = "Enter description", mobile }) {
    const [hoveredLink, setHoveredLink] = useState(null);

    useEffect(() => {
        const clearHover = () => setHoveredLink(null);
        window.addEventListener("scroll", clearHover, true);
        return () => window.removeEventListener("scroll", clearHover, true);
    }, []);

    if (!text) {
        return <span className="placeholder-text">{placeholder}</span>;
    }

    const handleLinkMouseEnter = (e, href, label) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredLink({
            href,
            label,
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
        });
    };

    const handleLinkMouseLeave = () => {
        setHoveredLink(null);
    };

    const parts = text.split(URL_REGEX);

    return (
        <>
            {parts.map((part, index) => {
                if (URL_MATCH_REGEX.test(part)) {
                    const href = toSafeHref(part);
                    if (!href) {
                        return part;
                    }

                    return (
                        <a key={index} href={href} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => handleLinkMouseEnter(e, href, part)}
                            onMouseLeave={handleLinkMouseLeave}
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}

            {hoveredLink && (
                <div
                    className={`link-hover-preview${mobile ? " mobile" : ""}`}
                    style={{
                        position: "absolute",
                        top: `${hoveredLink.top}px`,
                        left: `${hoveredLink.left}px`,
                        zIndex: 1000,
                    }}
                >
                    <div className="link-hover-domain">
                        <strong>{getHostname(hoveredLink.href)}</strong>
                    </div>
                    <div className="link-hover-url">{hoveredLink.href}</div>
                    <div className="link-hover-hint">Click to open in new tab</div>
                </div>
            )}
        </>
    );
}

export default URLComponent;