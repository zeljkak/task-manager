import {useEffect, useState} from "react";
import {useNavigate, useOutletContext} from "react-router-dom";
import TaskCardComponent from "../components/TaskCardComponent.jsx";
import TaskStatusComponent from "../components/TaskStatusComponent.jsx";
import TaskFilterComponent from "../components/TaskFilterComponent.jsx";
import CreateButtonComponent from "../components/CreateButtonComponent.jsx";
import {getTaskStatuses} from "../services/taskStatusService.js";
import {getTasks} from "../services/taskService.js";
import {getUsers} from "../services/userService.js";
import {getProjectsList} from "../services/projectService.js";
import {getPriorities} from "../services/priorityService.js";

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const userId = Number(localStorage.getItem("userId"));
  const { resetMyTasksKey, isMobile } = useOutletContext();
  const iconSize = isMobile ? 34 : 24;

  const getDefaultFilters = (userId) => ({
    text: "",
    assignedToId: userId,
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
});

  const [filters, setFilters] = useState(() => getDefaultFilters(userId));
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [projects, setProjects] = useState([]);

  const [refreshTasks, setRefreshTasks] = useState(0);

  useEffect(() => {
    setFilters(getDefaultFilters(userId));
  }, [resetMyTasksKey, userId]);

  async function loadTasks() {
    const apiFilters = { ...filters };
    if (apiFilters.createdBefore && !isNaN(new Date(apiFilters.createdBefore))) {
        apiFilters.createdBefore = new Date(apiFilters.createdBefore).toISOString();
    }
    if (apiFilters.createdAfter && !isNaN(new Date(apiFilters.createdAfter))) {
        apiFilters.createdAfter = new Date(apiFilters.createdAfter).toISOString();
    }
    if (apiFilters.dueBefore && !isNaN(new Date(apiFilters.dueBefore))) {
        apiFilters.dueBefore = new Date(apiFilters.dueBefore).toISOString();
    }
    if (apiFilters.dueAfter && !isNaN(new Date(apiFilters.dueAfter))) {
        apiFilters.dueAfter = new Date(apiFilters.dueAfter).toISOString();
    }

    const data = await getTasks(apiFilters);
    setTasks(data.tasks);
  }

  useEffect(() => {
    loadTasks();
  }, [filters, refreshTasks]);

  useEffect(() => {
    getTaskStatuses({})
      .then((res) => setTaskStatuses(res.data.taskStatuses))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getProjectsList({})
      .then((res) => setProjects(res.data.projects))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getPriorities({})
      .then((res) => setPriorities(res.data.priorities))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getUsers()
    .then((res) => setUsers(res.data.users))
    .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <TaskFilterComponent isMobile={isMobile}
          text={filters.text}
          onChange={(value) =>
              setFilters(prev => ({
                  ...prev,
                  text: value
              }))
          }
          users={users}
          selectedFollowerId={filters.followedById}
          selectedAssigneeId={filters.assignedToId}
          onAssigneeSelect={(assigneeId) =>
              setFilters(prev => ({
                  ...prev,
                  assignedToId: assigneeId
              }))
          }
          onFollowerSelect={(followerId) =>
              setFilters(prev =>({
                  ...prev,
                  followedById: followerId
              }))
          }
          statuses={taskStatuses}
          selectedStatusId={filters.statusId}
          onStatusSelect={(statusId) =>
              setFilters(prev => ({
                  ...prev,
                  statusId: statusId
              }))
          }
          priorities={priorities}
          selectedPriorityId={filters.priorityId}
          onPrioritySelect={(priorityId) =>
              setFilters(prev => ({
                  ...prev,
                  priorityId: priorityId
              }))
          }
          projects={projects}
          selectedProjectId={filters.projectId}
          onProjectSelect={(projectId) =>
              setFilters(prev => ({
                  ...prev,
                  projectId: projectId
              }))
          }
          selectedHasProject={filters.hasProject}
          onHasProjectSelect={(hasProject) =>
              setFilters(prev => ({
                  ...prev,
                  hasProject: hasProject
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
          selectedDueBefore={filters.dueBefore}
          onDueBeforeSelect={(dueBefore) =>
            setFilters(prev => ({
                ...prev,
                dueBefore: dueBefore
            }))
          }
          selectedDueAfter={filters.dueAfter}
          onDueAfterSelect={(dueAfter) =>
            setFilters(prev => ({
                ...prev,
                dueAfter: dueAfter
            }))
          }
          selectedOverdue={filters.overdue}
          onOverdueSelect={(overdue) =>
              setFilters(prev => ({
                  ...prev,
                  overdue: overdue
              }))
          }
          selectedHasDueDate={filters.hasDueDate}
          onHasDueDateSelect={(hasDueDate) =>
              setFilters(prev => ({
                  ...prev,
                  hasDueDate: hasDueDate
              }))
          }
      />
      <CreateButtonComponent isMobile={isMobile} type={"task"} users={users}
             projects={projects} statuses={taskStatuses} priorities={priorities}
             onCreated={() => setRefreshTasks(prev => prev + 1)} />
      <div className={"all-tasks"}>
        {taskStatuses.map(taskStatus => {
          const filteredTasks = tasks.filter(
            task => task.statusId === taskStatus.id
          );

          return (
            <TaskStatusComponent
              key={taskStatus.id}
              status={taskStatus}
              filter={filters.statusId}
              length={filteredTasks.length}
              size={iconSize}
            >
              {filteredTasks.map(task => (
                <TaskCardComponent key={task.id} task={task}
                   priorities={priorities} users={users} projects={projects}
                   statuses={taskStatuses} isMobile={isMobile}
                   onChange={() => setRefreshTasks(prev => prev + 1)}
                />
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