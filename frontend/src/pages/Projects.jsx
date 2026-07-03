import {useEffect, useState, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import ProjectCardComponent from "../components/ProjectCardComponent.jsx";
import ProjectStatusComponent from "../components/ProjectStatusComponent.jsx";
import ProjectFilterComponent from "../components/ProjectFilterComponent.jsx";
import {getProjects} from "../services/projectService.js";
import {getUsers} from "../services/userService.js";

export default function Projects() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    projectText: "",
    createdById: "",
    createdBefore: "",
    createdAfter: ""
  });

  async function loadProjects() {
    const apiFilters = { ...filters };

    if (apiFilters.createdBefore && !isNaN(new Date(apiFilters.createdBefore))) {
      apiFilters.createdBefore = new Date(apiFilters.createdBefore).toISOString();
    }
    if (apiFilters.createdAfter && !isNaN(new Date(apiFilters.createdAfter))) {
      apiFilters.createdAfter = new Date(apiFilters.createdAfter).toISOString();
    }

    const data = await getProjects(apiFilters);
    setProjects(data.projects);
  }

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const grouped = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        const key = project.archived ? "archived" : "active";
        (acc[key]).push(project);
        return acc;
      },
      { active: [], archived: [] }
    );
  }, [projects]);

  useEffect(() => {
    getUsers()
    .then((res) => setUsers(res.data.users))
    .catch((err) => console.error(err));
  }, []);

  const sections = [
    { key: "active", status: "active" },
    { key: "archived", status: "archived" }
  ];

  return (
    <>
      <ProjectFilterComponent text={filters.projectText}
          users={users} selectedUserId={filters.createdById}
          onChange={(value) =>
            setFilters(prev => ({
              ...prev,
              projectText: value
            }))
          }
          onUserSelect={(userId) =>
            setFilters(prev => ({
              ...prev,
              createdById: userId
            }))
          }
          selectedCreatedBefore={filters.createdBefore}
          onCreatedBeforeSelect={(createdBefore) =>
            setFilters(prev => ({
                ...prev,
                createdBefore: createdBefore
            }))
          }
          selectedCreatedAfter={filters.createdAfter}
          onCreatedAfterSelect={(createdAfter) =>
            setFilters(prev => ({
                ...prev,
                createdAfter: createdAfter
            }))
          }
      />
      <div className={"all-projects"}>
        {sections.map(section => (
          <ProjectStatusComponent key={section.key}
            status={section.status}
            length={grouped[section.key].length}>
              {grouped[section.key].map(project => (
                <ProjectCardComponent key={project.id} project={project} />
              ))}
          </ProjectStatusComponent>
        ))}
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