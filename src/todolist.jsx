import React, { useState, useEffect } from "react";
import {  FaMoon } from "react-icons/fa"; // 🌞🌙 Icons imported here
import { FaSun } from "react-icons/fa6";

import "./index.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [completionMessage, setCompletionMessage] = useState();
  const [deleteMessage, setDeleteMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const API_URL = "https://fastapi-todolist-backend.onrender.com/api/todos/";

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTask, completed: false }),
        });
        if (response.ok) {
          fetchTasks();
          setNewTask("");
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          completed: !task.completed,
        }),
      });
      if (response.ok) {
        fetchTasks();
        setCompletionMessage("Task status updated!");
        setTimeout(() => setCompletionMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
      if (response.ok) {
        fetchTasks();
        setDeleteMessage("Task deleted successfully!");
        setTimeout(() => setDeleteMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const startEditing = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, isEditing: true } : task));
  };

  const saveTask = async (id, newTitle) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        fetchTasks();
        setEditMessage("Task saved successfully!");
        setTimeout(() => setEditMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleFilterChange = (filterType) => setFilter(filterType);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">Mat</div>
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {darkMode ? (
            <>
              <FaSun style={{ marginRight: "8px", color: "#ffd900" }} /> Light Mode
            </>
          ) : (
            <>
              <FaMoon style={{ marginRight: "8px", color: "#0069d2" }} /> Dark Mode
            </>
          )}
        </button>
      </header>

      <div className="todo-wrapper">
        <div className="todo-title-box">
          <h1 className="todo-title">TO DO <br /> LIST</h1>
        </div>

        <div className="todo-container">
          <div className="task-input">
            <input
              type="text"
              placeholder="Enter task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button onClick={addTask}>Add Task</button>
          </div>

          <div className="filters">
            {["View All", "active", "completed"].map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={filter === type ? "filter-button active" : "filter-button"}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <ul className="task-list">
            {filter === "active" && filteredTasks.length === 0 && (
              <p className="no-tasks-message">No active tasks</p>
            )}

            {filteredTasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                {task.isEditing ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      defaultValue={task.title}
                      className="edit-input"
                      onBlur={(e) => saveTask(task.id, e.target.value)}
                      autoFocus
                    />
                    <button
                      className="save-button"
                      onClick={(e) => {
                        const input = e.target.parentNode.querySelector(".edit-input");
                        saveTask(task.id, input.value);
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <span onClick={() => toggleComplete(task)}>{task.title}</span>
                    <div className="task-buttons">
                      <button onClick={() => toggleComplete(task)}>
                        {task.completed ? "Uncomplete" : "Complete"}
                      </button>
                      <button onClick={() => startEditing(task.id)}>Edit</button>
                      <button onClick={() => deleteTask(task.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {deleteMessage && <p className="status-message">{deleteMessage}</p>}
          {editMessage && <p className="status-message">{editMessage}</p>}
          {completionMessage && <p className="completion-message">{completionMessage}</p>}
        </div>
      </div>

      <footer className="app-footer">
        <div className="footer-left">
          <p>by Matheo Jay Fabre</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
