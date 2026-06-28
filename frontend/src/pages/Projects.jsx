import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import ProjectComponent from "../components/ProjectComponent.jsx";
import {getProjects} from "../services/projectService.js";
import ProjectStatusComponent from "../components/ProjectStatusComponent.jsx";

export default function Projects() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects({})
        .then(res => setProjects(res.data.projects))
        .catch(err => console.error(err));
  }, []);

  const activeProjects = projects.filter(project => !project.archived);
  const inactiveProjects = projects.filter(project => project.archived);
  return (
    <>
      <ProjectStatusComponent key={"unarchived"} status={"active"} length={activeProjects.length}>
        {activeProjects.map(project => (
            <ProjectComponent key={project.id} project={project} />
          ))}
      </ProjectStatusComponent>
      <ProjectStatusComponent key={"archived"} status={"archived"} length={inactiveProjects.length}>
        {inactiveProjects.map(project => (
          <ProjectComponent key={project.id} project={project} />
        ))}
      </ProjectStatusComponent>

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