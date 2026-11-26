import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import TaskCardComponent from "../components/TaskCardComponent.jsx";
import TaskStatusComponent from "../components/TaskStatusComponent.jsx";
import TaskFilterComponent from "../components/TaskFilterComponent.jsx";
import {getDeletedTasks, getTasks, updateTask} from "../services/taskService.js";
import { useAuth } from "../context/useAuth.js";

const DEFAULT_FILTERS = {
  text: "",
  assignedToId: "me",
  statusId: "",
  priorityId: "",
  projectId: "",
  hasProject: "",
  dueBefore: "",
  dueAfter: "",
  createdBefore: "",
  createdAfter: "",
  overdue: "",
  hasDueDate: "",
  followedById: "",
  isDeleted: ""
};

const INT_KEYS = ["statusId", "priorityId", "projectId", "followedById"];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [hasMoreByStatus, setHasMoreByStatus] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const fetchingRef = useRef(false);

  const {resetMyTasksKey, isMobile, users = [], statuses = [], priorities = [], projects = []} = useOutletContext();
  const iconSize = isMobile ? 34 : 24;

  const prevResetKeyRef = useRef(resetMyTasksKey);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const filters = useMemo(() => {
    const current = {...DEFAULT_FILTERS};

    for (const key of Object.keys(DEFAULT_FILTERS)) {
      if (!searchParams.has(key)) continue;

      const rawVal = searchParams.get(key);

      if (INT_KEYS.includes(key) && rawVal !== "" && !isNaN(rawVal)) {
        current[key] = parseInt(rawVal, 10);
      } else if (key === "assignedToId" && rawVal !== "me" && rawVal !== "all" && !isNaN(rawVal)) {
        current[key] = parseInt(rawVal, 10);
      } else if (rawVal === "true" || rawVal === "false") {
        current[key] = rawVal === "true";
      } else {
        current[key] = rawVal;
      }
    }
    return current;
  }, [searchParams]);

  const updateFilters = useCallback((updates) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, val]) => {
        if (key === "assignedToId" && (val === "" || val === "all")) {
          newParams.set("assignedToId", "all");
        } else if (val !== undefined && val !== null && val !== "") {
          newParams.set(key, String(val));
        } else {
          newParams.delete(key);
        }
      });

      return newParams;
    }, {replace: true});
  }, [setSearchParams]);

  const clearAllFilters = () => {
    setSearchParams({assignedToId: "all"}, {replace: true});
  };

  const fetchTasksPage = useCallback(async (pageNum = 1, isNewFilter = false) => {
    if (fetchingRef.current && !isNewFilter) return;
    fetchingRef.current = true;
    setError("");

    if (isNewFilter) {
      setInitialLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const apiFilters = {
        ...filters,
        assignedToId: filters.assignedToId === "all" ? "" : filters.assignedToId,
        page: pageNum,
        perPage: 75,
      };

      // call getDeletedTasks when isDeleted is active/true
      const data = filters.isDeleted
      ? await getDeletedTasks(apiFilters)
      : await getTasks(apiFilters);

      const newTasks = data.tasks || [];
      const more = Boolean(data.hasMore ?? data.has_more);
      const moreByStatus = data.hasMoreByStatus ?? data.has_more_by_status ?? {};

      setTasks((prev) => {
        if (isNewFilter || pageNum === 1) return newTasks;
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewTasks = newTasks.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNewTasks];
      });

      setHasMoreByStatus(moreByStatus);
      setHasMore(more);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.response?.data?.error || "Failed to load tasks");
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [filters]);

  const fetchTasksPageRef = useRef(fetchTasksPage);
  useEffect(() => {
    fetchTasksPageRef.current = fetchTasksPage;
  }, [fetchTasksPage]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable column or dropped in the same droppable column
    if (!destination) return;
    if (destination.droppableId === source.droppableId) {
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const newStatusId = parseInt(destination.droppableId, 10);

    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const canEdit = Boolean(
      user && (
        targetTask?.createdBy?.id === user.id ||
        targetTask?.assignedTo?.id === user.id ||
        user.roleId === 1
      )
    );
    if (!canEdit) return;

    const nowIso = new Date().toISOString();

    setTasks((prevTasks) => {
        const remainingTasks = prevTasks.filter((t) => t.id !== taskId);
        const updatedTask = {
            ...targetTask,
            statusId: newStatusId,
            updatedAt: nowIso,
        };

        return [updatedTask, ...remainingTasks];
    });

    try {
      await updateTask(taskId, {
        title: targetTask.title,
        statusId: newStatusId
      });
    } catch (err) {
      console.error("Failed to update status on drag drop:", err);
      fetchTasksPage(1, true);
    }
  };

  useEffect(() => {
    if (resetMyTasksKey > 0 && resetMyTasksKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetMyTasksKey;
      setSearchParams({ assignedToId: "me" }, { replace: true });
    }
  }, [resetMyTasksKey, setSearchParams]);

  useEffect(() => {
    fetchTasksPage(1, true);
  }, [fetchTasksPage]);

  useEffect(() => {
    const scrollContainer = document.getElementById("content") || window;

    const handleVerticalScroll = () => {
      const target =
        scrollContainer === window
          ? document.documentElement
          : scrollContainer;

      const { scrollTop, scrollHeight, clientHeight } = target;
      const isBottom = scrollHeight - scrollTop - clientHeight <= 150;

      if (isBottom && hasMoreRef.current && !fetchingRef.current) {
        const nextPage = pageRef.current + 1;
        fetchTasksPageRef.current(nextPage, false);
      }
    };

    scrollContainer.addEventListener("scroll", handleVerticalScroll);
    return () => scrollContainer.removeEventListener("scroll", handleVerticalScroll);
  }, []);

  return (
    <>
      <TaskFilterComponent filters={filters} onFilterChange={updateFilters}
        onClearAll={clearAllFilters} isMobile={isMobile}
        options={{users, statuses, priorities, projects}}
        buttonOnCreated={() => fetchTasksPage(1, true)}
      />

      {initialLoading ? (
        <div className="spinner">
          <p>Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p className="error">{error}</p>
        </div>
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div id="all-tasks">
              {statuses.map(taskStatus => {
                const filteredTasks = tasks.filter(task => task.statusId === taskStatus.id);

                return (
                  <TaskStatusComponent key={taskStatus.id} status={taskStatus}
                    filter={filters.statusId} length={filteredTasks.length}
                    hasMore={Boolean(hasMoreByStatus[taskStatus.id])} size={iconSize}
                  >
                    {filteredTasks.map((task, index) => {
                      const canEdit = Boolean(
                        user && (
                        task?.createdBy?.id === user.id ||
                          task?.assignedTo?.id === user.id ||
                          user.roleId === 1
                        )
                      );

                      return (
                        <TaskCardComponent key={task.id} task={task}
                          index={index} canEdit={canEdit}
                        />
                      );
                    })}
                  </TaskStatusComponent>
                );
              })}
            </div>
          </DragDropContext>
          {loadingMore && <p className="loading">Loading more tasks...</p>}
        </>
      )}
    </>
  );
};