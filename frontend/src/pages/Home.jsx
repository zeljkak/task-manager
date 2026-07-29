import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import TaskCardComponent from "../components/TaskCardComponent.jsx";
import TaskStatusComponent from "../components/TaskStatusComponent.jsx";
import TaskFilterComponent from "../components/TaskFilterComponent.jsx";
import { getTasks, updateTask } from "../services/taskService.js";

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
  followedById: ""
};

const INT_KEYS = ["statusId", "priorityId", "projectId", "followedById"];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {resetMyTasksKey, isMobile, users = [], statuses = [], priorities = [], projects = []} = useOutletContext();
  const iconSize = isMobile ? 34 : 24;

  const prevResetKeyRef = useRef(resetMyTasksKey);

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

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiFilters = {
        ...filters,
        assignedToId: filters.assignedToId === "all" ? "" : filters.assignedToId
      };

      const data = await getTasks(apiFilters);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      loadTasks();
    }
  };

  useEffect(() => {
    if (resetMyTasksKey > 0 && resetMyTasksKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetMyTasksKey;
      setSearchParams({ assignedToId: "me" }, { replace: true });
    }
  }, [resetMyTasksKey, setSearchParams]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
      <>
        <TaskFilterComponent
            filters={filters}
            onFilterChange={updateFilters}
            onClearAll={clearAllFilters}
            isMobile={isMobile}
            options={{users, statuses, priorities, projects}}
            buttonOnCreated={loadTasks}
        />

        {loading ? (
            <div className="spinner">
              <p>Loading tasks...</p>
            </div>
        ) : error ? (
            <div className="error-message">
              <p className="error">{error}</p>
            </div>
        ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div id="all-tasks">
                {statuses.map(taskStatus => {
                  const filteredTasks = tasks.filter(task => task.statusId === taskStatus.id);

                  return (
                      <TaskStatusComponent
                          key={taskStatus.id}
                          status={taskStatus}
                          filter={filters.statusId}
                          length={filteredTasks.length}
                          size={iconSize}
                      >
                        {filteredTasks.map((task, index) => (
                            <TaskCardComponent
                                key={task.id}
                                task={task}
                                index={index}
                            />
                        ))}
                      </TaskStatusComponent>
                  );
                })}
              </div>
            </DragDropContext>
        )}
      </>
  );
};