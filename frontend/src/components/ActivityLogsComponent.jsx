import {useEffect, useState, useRef, useCallback} from "react";
import { Link } from "react-router-dom";
import {getActivityLogs, getAllUsers} from "../services/adminService.js";

function ActivityLogsComponent ({ onCancel, isMobile }) {
  const [logsList, setLogsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [error, setError] = useState(null);

  const [taskId, setTaskId] = useState("");
  const [userId, setUserId] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ref to sync table head and body
  const headerRef = useRef(null);
  // refs to prevent stale closure in scroll listener
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // sync refs with state
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchLogs = useCallback(async (pageNum, isNewFilter = false) => {
    // hard lock check
    if (fetchingRef.current && !isNewFilter) return;

    fetchingRef.current = true;
    if (!initialLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const params = {
        page: pageNum,
        perPage: 50,
      };
      if (taskId) params.taskId = taskId;
      if (userId) params.userId = userId;

      const response = await getActivityLogs({ params });
      const newLogs = response.data.activities || [];
      const more = response.data.hasMore;

      setLogsList((prev) => {
        if (isNewFilter) return newLogs;
        // Deduplicate by item ID just in case
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewLogs = newLogs.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNewLogs];
      });

      setHasMore(more);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch logs.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [taskId, userId, initialLoading]);

  const fetchLogsRef = useRef(fetchLogs);
  useEffect(() => {
    fetchLogsRef.current = fetchLogs;
  }, [fetchLogs]);

  // initial fetch for logs and users in parallel
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const [logsResponse, usersResponse] = await Promise.all([
          getActivityLogs({ params: { page: 1, perPage: 50 } }),
          getAllUsers(),
        ]);

        setLogsList(logsResponse.data.activities || []);
        setHasMore(logsResponse.data.hasMore);
        setPage(1);
        setUsersList(usersResponse.data.users || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load activity logs.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // #content vertical scroll listener
  useEffect(() => {
    const scrollContainer = document.getElementById("content") || window;

    const handleVerticalScroll = () => {
      const target =
        scrollContainer === window
          ? document.documentElement
          : scrollContainer;

      const { scrollTop, scrollHeight, clientHeight } = target;

      // Check vertical position relative to #content
      const isBottom = scrollHeight - scrollTop - clientHeight <= 150;

      if (isBottom && hasMoreRef.current && !fetchingRef.current) {
        const nextPage = pageRef.current + 1;
        fetchLogsRef.current(nextPage, false);
      }
    };

    scrollContainer.addEventListener("scroll", handleVerticalScroll);
    return () => scrollContainer.removeEventListener("scroll", handleVerticalScroll);
  }, []);

  const handleHorizontalScroll = (e) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // filter submit handler
  const handleFilter = () => {
    fetchLogs(1, true);
  };

  return (
    <div id="activity-logs-div">
        <h5>Activity Logs</h5>
        {(initialLoading || error) &&
            <div className={"activity-logs-inline-div"}>
                {initialLoading && <p className="loading">Loading activity logs...</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        }
        {!initialLoading && (
            <>
                <div className={"activity-logs-inline-div"}>
                    <input type={"text"} name={"taskId"} value={taskId}
                       placeholder={isMobile ? "Task ID" : "Enter task ID"}
                       onChange={(e) => setTaskId(e.target.value)}
                    />
                    <select name={"userId"} value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    >
                        <option value="">{isMobile ? "User" : "Select user"}</option>
                        {usersList.map(u => (
                            <option value={u.id} key={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                    <button type="button" onClick={handleFilter}>Filter</button>
                    <button type="button" onClick={onCancel}>Close</button>
                </div>
                {logsList.length === 0 ? (
                    <p className={"centered-text"}>No records match the current filters</p>
                ) : (
                    <>
                        <div className="table-header-div" ref={headerRef}>
                            <table>
                                <colgroup>
                                    <col className="col-row"/>
                                    <col className="col-task" />
                                    <col className="col-user" />
                                    <col className="col-action" />
                                    <col className="col-field" />
                                    <col className="col-old-value" />
                                    <col className="col-new-value" />
                                    <col className="col-time" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Task</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Field</th>
                                        <th className={"shrink"}>Old Value</th>
                                        <th className={"shrink"}>New Value</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="table-body-div" onScroll={handleHorizontalScroll}>
                            <table>
                                <colgroup>
                                    <col className="col-row"/>
                                    <col className="col-task" />
                                    <col className="col-user" />
                                    <col className="col-action" />
                                    <col className="col-field" />
                                    <col className="col-old-value" />
                                    <col className="col-new-value" />
                                    <col className="col-time" />
                                </colgroup>
                                <tbody>
                                    {logsList.map((a) => {
                                        return (
                                            <tr key={a.id}>
                                                <td>{a.id}</td>
                                                <td style={{ color: a.task?.isDeleted ? "red" : "inherit" }}>
                                                    {a.task?.id ? (
                                                        <Link to={`/tasks/${a.task.id}`} target="_blank" rel="noopener noreferrer">
                                                          {a.task.id}
                                                        </Link>
                                                    ) : ( "" )}
                                                </td>
                                                <td>{a.user.firstName} {a.user.lastName}</td>
                                                <td>{a.action}</td>
                                                <td>{a.field}</td>
                                                <td className={"shrink"}>{a.oldValue}</td>
                                                <td className={"shrink"}>{a.newValue}</td>
                                                <td>{(() => {
                                                    const d = new Date(a.createdAt);
                                                    const dateStr = d.toLocaleDateString("en-GB").replaceAll("/", ".").concat(".");
                                                    const timeStr = d.toLocaleTimeString("en-GB", {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                      second: "2-digit",
                                                      hour12: false,
                                                    });
                                                    return `${dateStr} ${timeStr}`;
                                                  })()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {loading && <p className={"loading"}>Loading more logs...</p>}
                        </div>
                    </>
                )}
            </>
        )}
    </div>
  );
}

export default ActivityLogsComponent;