import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService.js";
import TaskCard from "../components/TaskCard.jsx";

export default function Home() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState([]);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    getTasks({assignedToId: userId})
      .then((res) => setTasks(res.data.tasks))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}

      {message && (
        <p style={{ color: "green", marginTop: "10px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  )
}