import {useEffect, useState, useRef} from "react";
import { createPortal } from "react-dom";
import {followTask, unfollowTask} from "../services/taskService.js";
import {useAuth} from "../context/AuthContext.jsx";
import FollowIcon from "./icons/FollowIcon.jsx";
import tippy from "tippy.js";

function FollowTaskComponent ({task, isMobile, onFollowChange}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const {user} = useAuth();
    const isInitiallyFollowing = task?.followers?.some(
        follower => follower.id === user.id
    );
    const [allowedFollowing, setAllowedFollowing] = useState(task?.assignedTo?.id !== user.id);
    const [following, setFollowing] = useState(isInitiallyFollowing);
    const iconSize = isMobile ? 30 : 24;

    const buttonRef = useRef(null);
    const tippyInstanceRef = useRef(null);
    const messageElement = document.getElementById("form-message");

    useEffect(() => {
        setFollowing(task?.followers?.some(follower => follower.id === user?.id));
    }, [task, user]);

    useEffect(() => {
        if (buttonRef.current) {
            tippyInstanceRef.current = tippy(buttonRef.current, {
                placement: 'bottom',
                duration: 150,
                content: following ? "Unfollow" : "Follow",
            });
        }

        return () => {
            if (tippyInstanceRef.current) {
                tippyInstanceRef.current.destroy();
            }
        };
    }, [isMobile]);

    useEffect(() => {
        if (tippyInstanceRef.current) {
            tippyInstanceRef.current.setContent(following ? "Unfollow" : "Follow");
        }
    }, [following]);

    const toggleFollow = async () => {
        setError("");
        setLoading(true);

        const previousFollowing = following;
        setFollowing(!previousFollowing);

        try {
            if (previousFollowing) {
                await unfollowTask(task.id);
            } else {
                await followTask(task.id);
            }
            if (onFollowChange) {
                await onFollowChange();
            }
        } catch (error) {
            setFollowing(previousFollowing);
            setError(error.response?.data?.error || "Failed to update follow status.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {allowedFollowing &&
                <>
                    <button className={"follow-button"} onClick={toggleFollow}
                        ref={buttonRef} disabled={loading}>
                        <FollowIcon state={following} size={iconSize} />
                    </button>
                    {error && messageElement && createPortal(
                        <p className="error">{error}</p>,
                        messageElement
                    )}
                </>
            }
        </>
    );

}

export default FollowTaskComponent;
