import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService.js";
import TaskCardComponent from "../components/TaskCardComponent.jsx";
import {getTaskStatuses} from "../services/taskStatusService.js";
import StatusComponent from "../components/StatusComponent.jsx";

export default function Home() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [taskStatuses, setTaskStatuses] = useState([]);
  useEffect(() => {
    getTaskStatuses()
      .then((res) => setTaskStatuses(res.data.taskStatuses))
      .catch((err) => console.error(err));
  }, []);

  const [tasks, setTasks] = useState([]);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    getTasks({assignedToId: userId})
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div id={"all-tasks"}>
      {taskStatuses.map(taskStatus => (
        <StatusComponent key={taskStatus.id} status={taskStatus}>
          {tasks.filter(task => task.statusId === taskStatus.id)
            .map(task => (
              <TaskCardComponent key={task.id} task={task} />
            ))}
        </StatusComponent>
      ))}

      {message && (
        <p className={"message"}>
          {message}
        </p>
      )}

      {error && (
        <p className={"error"}>
          {error}
        </p>
      )}
    </div>
  )
}