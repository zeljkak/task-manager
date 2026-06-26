import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import ProjectComponent from "../components/ProjectComponent.jsx";
import {getProjects} from "../services/projectService.js";
import TaskCardComponent from "../components/TaskCardComponent.jsx";

export default function Projects() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects()
        .then(res => setProjects(res.data.projects))
        .catch(err => console.error(err));
  }, []);

  return (
    <>
      {projects.map(project => (
          <ProjectComponent key={project.id} project={project} />
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
    </>
  );
}