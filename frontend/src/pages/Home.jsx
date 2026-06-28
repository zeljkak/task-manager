import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService.js";
import TaskCardComponent from "../components/TaskCardComponent.jsx";
import {getTaskStatuses} from "../services/taskStatusService.js";
import TaskStatusComponent from "../components/TaskStatusComponent.jsx";

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [taskStatuses, setTaskStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getTaskStatuses()
      .then((res) => setTaskStatuses(res.data.taskStatuses))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getTasks({ assignedToId: userId })
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
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

      {message && <p className="message">{message}</p>}

      {error && <p className="error">{error}</p>}
    </>
  );
}