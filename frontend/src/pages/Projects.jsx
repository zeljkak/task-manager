import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import ProjectCardComponent from "../components/ProjectCardComponent.jsx";
import {getProjects} from "../services/projectService.js";
import ProjectStatusComponent from "../components/ProjectStatusComponent.jsx";
import FilterComponent from "../components/FilterComponent.jsx";

export default function Projects() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);

  const [filters, setFilters] = useState({
    projectText: "",
    createdById: "",
    createdBefore: "",
    createdAfter: ""
  });

  async function loadProjects() {
    const data = await getProjects(filters);
    setProjects(data.projects);
  }

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const activeProjects = projects.filter(project => !project.archived);
  const inactiveProjects = projects.filter(project => project.archived);
  return (
    <>
      <FilterComponent element={"project"}
                       text={filters.projectText}
                       onChange={(value) =>
                           setFilters(prev => ({
                               ...prev,
                               projectText: value
                           }))
                       }
      />
        <div className={"all-projects"}>
          <ProjectStatusComponent key={"unarchived"} status={"active"} length={activeProjects.length}>
            {activeProjects.map(project => (
                <ProjectCardComponent key={project.id} project={project} />
              ))}
          </ProjectStatusComponent>
          <ProjectStatusComponent key={"archived"} status={"archived"} length={inactiveProjects.length}>
            {inactiveProjects.map(project => (
              <ProjectCardComponent key={project.id} project={project} />
            ))}
          </ProjectStatusComponent>
        </div>

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