import { useState, useEffect } from "react";
import {useNavigate, useOutletContext} from "react-router-dom";
import { useNotifications } from "../context/NotificationContext.jsx";

export default function Inbox() {
  const { isMobile } = useOutletContext();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    connected,
    error,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();

  const [actionError, setActionError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  // restore scroll target once notifications have loaded, but only if returning from a task
  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const targetId = sessionStorage.getItem("notification-scroll-target");

      if (targetId) {
        // clear it so it doesn't keep scrolling on subsequent re-renders/refreshes
        sessionStorage.removeItem("notification-scroll-target");

        // small timeout to ensure the DOM elements are fully rendered
        setTimeout(() => {
          const element = document.getElementById(`notification-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else {
        // clear out if they opened the inbox from the sidebar or fresh
        sessionStorage.removeItem("notification-scroll-target");
      }
    }
  }, [loading, notifications]);

  const renderEmphasizedQuotes = (text) => {
    // split by quotes while keeping the quotes in the array
    const parts = text.split(/(".*?")/g);

    return parts.map((part, index) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        // remove the quotes
        const innerText = part.slice(1, -1);
        return <strong key={index} className={"emphasized-text"}>{innerText}</strong>;
      }
      return part;
    });
  };

  const handleItemClick = async (e, notification) => {
    const taskId = notification.task?.id;

    if (taskId) {
      e.preventDefault();
      // save to session storage immediately before any async gap
      sessionStorage.setItem("notification-scroll-target", notification.id);

      // mark as read if unread, but don't let it block the navigation flow abruptly
      if (!notification.isRead) {
        markRead(notification.id).catch(err => {
          setActionError(err.response?.data?.message || "Failed to mark as read.");
        });
      }

      navigate(`/tasks/${taskId}`);
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    try {
      setActionError("");
      setMarkingAll(true);
      await markAllRead();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div id="inbox-page" className={isMobile ? "mobile" : ""}>
      <div className="inbox-header">
        <div>
          <h2>Inbox</h2>
          <p className="inbox-subtitle">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
            {" · "}
            <span className={connected ? "inbox-status online" : "inbox-status offline"}>
              {connected ? "Live" : "Reconnecting…"}
            </span>
          </p>
        </div>
        <div className="inbox-actions">
          <button type="button" className="secondary-btn" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? "Marking…" : "Mark all read"}
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="error-message">
          <p className="error">{actionError || error}</p>
        </div>
      )}

      {loading ? (
        <div className="spinner">
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="inbox-empty">
          <p>No notifications yet.</p>
          <p className="inbox-empty-hint">
            You'll see updates here when tasks you're involved in change.
          </p>
        </div>
      ) : (
        <ul className="inbox-list">
          {notifications.map((notification) => {
            const actorName = notification.actor
              ? `${notification.actor.firstName || ""} ${notification.actor.lastName || ""}`.trim()
              : "Someone";

            return (
              <li
                key={notification.id} id={`notification-${notification.id}`}
                className={`inbox-item${notification.isRead ? "" : " unread"}`}
                onClick={(e) => handleItemClick(e, notification)}
              >
                <div className="inbox-item-body">
                  <div className="inbox-item-title-row">
                    {!notification.isRead && <span className="inbox-dot" aria-hidden="true" />}
                    <h2>{notification.title}</h2>
                  </div>
                  <p className="inbox-item-message">{renderEmphasizedQuotes(notification.message)}</p>
                </div>
                <div className="inbox-item-meta">
                  <span>by {actorName}</span>
                  <span>
                    {new Date(notification.createdAt)
                      .toLocaleString("en-GB")
                      .replaceAll("/", ".")
                      .replaceAll(",", ".")
                      .concat(".")
                      .slice(0, -4)
                    }
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
