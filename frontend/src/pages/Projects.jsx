import {useEffect, useState, useMemo, useCallback} from "react";
import {useNavigate, useOutletContext, useSearchParams} from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import ProjectCardComponent from "../components/ProjectCardComponent.jsx";
import ProjectStatusComponent from "../components/ProjectStatusComponent.jsx";
import ProjectFilterComponent from "../components/ProjectFilterComponent.jsx";
import {getProjects, archiveProject, unarchiveProject} from "../services/projectService.js";
import {useAuth} from "../context/useAuth.js";

const DEFAULT_FILTERS = {
  projectText: "",
  createdById: "",
  createdBefore: "",
  createdAfter: ""
};

const INT_KEYS = ["createdById"];

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [filteredProjects, setFilteredProjects] = useState(null);

  const canEdit = Boolean(user && user.roleId === 1);

  const { isMobile, isDraggable, users = [], projects = [], refreshDropdowns } = useOutletContext();
  const iconSize = isMobile ? 34 : 24;

  const filters = useMemo(() => {
    const current = { ...DEFAULT_FILTERS };

    for (const key of Object.keys(DEFAULT_FILTERS)) {
      if (!searchParams.has(key)) continue;

      const rawVal = searchParams.get(key);

      if (INT_KEYS.includes(key) && rawVal !== "" && !isNaN(rawVal)) {
        current[key] = parseInt(rawVal, 10);
      } else {
        current[key] = rawVal;
      }
    }
    return current;
  }, [searchParams]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(DEFAULT_FILTERS).some((key) => {
      const val = filters[key];
      return val !== "" && val !== undefined && val !== null;
    });
  }, [filters]);

  const updateFilters = useCallback((updates) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          newParams.set(key, String(val));
        } else {
          newParams.delete(key);
        }
      });

      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const loadProjects = useCallback(async () => {
      if (!hasActiveFilters) {
          setFilteredProjects(null);
          setError("");
          return;
      }

      setLoading(true);
      setError("");

      try {
          const apiFilters = {...filters};

          if (apiFilters.createdBefore && !isNaN(new Date(apiFilters.createdBefore))) {
              apiFilters.createdBefore = new Date(apiFilters.createdBefore).toISOString();
          }
          if (apiFilters.createdAfter && !isNaN(new Date(apiFilters.createdAfter))) {
              apiFilters.createdAfter = new Date(apiFilters.createdAfter).toISOString();
          }

          const response = await getProjects(apiFilters);
          setFilteredProjects(response.projects || []);
      } catch (err) {
          console.error("Failed to fetch filtered projects:", err);
          setError(err.response?.data?.error || "Failed to load projects");
      } finally {
          setLoading(false);
      }
  }, [filters, hasActiveFilters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const activeProjectsList = hasActiveFilters ? (filteredProjects || []) : projects;

  const syncUpdates = async () => {
      if (hasActiveFilters) {
          await loadProjects();
      }
      if (refreshDropdowns) {
          await refreshDropdowns();
      }
  };

  const handleDragEnd = async (result) => {
    if (isDraggable) return;

    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    if (!canEdit) return;

    const projectId = parseInt(draggableId, 10);
    const targetProject = activeProjectsList.find((p) => p.id === projectId);
    if (!targetProject) return;

    const isArchiving = destination.droppableId === "archived";

    try {
      if (isArchiving) {
        await archiveProject(projectId);
      } else {
        await unarchiveProject(projectId);
      }

      if (hasActiveFilters) {
        await loadProjects();
      }
      if (refreshDropdowns) {
        await refreshDropdowns();
      }
    } catch (err) {
      console.error("Failed to update project archive state on drag drop:", err);
      if (hasActiveFilters) {
        loadProjects();
      }
    }
  };

  const grouped = useMemo(() => {
    return (activeProjectsList || []).reduce(
      (acc, project) => {
        const key = project.archived ? "archived" : "active";
        (acc[key]).push(project);
        return acc;
      },
      { active: [], archived: [] }
    );
  }, [activeProjectsList]);

  const sections = [
    { key: "active", status: "active" },
    { key: "archived", status: "archived" }
  ];

  return (
    <>
      <ProjectFilterComponent filters={filters}
        onFilterChange={updateFilters}
        onClearAll={clearAllFilters}
        isMobile={isMobile}
        options={{ users }}
        buttonOnCreated={syncUpdates}
        canEdit={canEdit}
      />

      {loading ? (
        <div className="spinner">
          <p className="loading">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p className="error">{error}</p>
        </div>
      ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div id={"all-projects"}>
              {sections.map(section => (
                <ProjectStatusComponent key={section.key}
                  status={section.status} size={iconSize}
                  length={grouped[section.key].length}>
                    {grouped[section.key].map((project, index) => (
                      <ProjectCardComponent key={project.id} project={project} syncUpdates={syncUpdates}
                        index={index} canEdit={canEdit} iconSize={iconSize} isMobile={isDraggable} user={user} />
                    ))}
                </ProjectStatusComponent>
              ))}
            </div>
          </DragDropContext>
      )}

      {message && (<p className={"message"}>{message}</p>)}
    </>
  );
}