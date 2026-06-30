import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import TaskCardComponent from "../components/TaskCardComponent.jsx";
import TaskStatusComponent from "../components/TaskStatusComponent.jsx";
import TaskFilterComponent from "../components/TaskFilterComponent.jsx";
import {getTaskStatuses} from "../services/taskStatusService.js";
import {getTasks} from "../services/taskService.js";

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  const [taskStatuses, setTaskStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [filters, setFilters] = useState({
    text: "",
    assignedToId: userId,
    statusId: "",
    priorityId: "",
    projectId: "",
    dueBefore: "",
    dueAfter: "",
    createdBefore: "",
    createdAfter: "",
    overdue: "",
    followedById: ""
  });

  async function loadTasks() {
    const data = await getTasks(filters);
    setTasks(data.tasks);
  }

  useEffect(() => {
    loadTasks();
  }, [filters]);

  useEffect(() => {
    getTaskStatuses({})
      .then((res) => setTaskStatuses(res.data.taskStatuses))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <TaskFilterComponent text={filters.text}
                           onChange={(value) =>
                             setFilters(prev => ({
                               ...prev,
                               text: value
                             }))
                           }
      />
      <div className={"all-tasks"}>
        {taskStatuses.map(taskStatus => {
          const filteredTasks = tasks.filter(
            task => task.statusId === taskStatus.id
          );

          return (
            <TaskStatusComponent
              key={taskStatus.id}
              status={taskStatus}
              length={filteredTasks.length}
            >
              {filteredTasks.map(task => (
                <TaskCardComponent key={task.id} task={task} />
              ))}
            </TaskStatusComponent>
          );
        })}
      </div>

      {message && <p className="message">{message}</p>}

      {error && <p className="error">{error}</p>}
    </>
  );
}