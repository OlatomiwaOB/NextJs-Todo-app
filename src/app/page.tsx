"use client"; // allows client-side interactivity

import { useState, useEffect } from "react";
import axios from "axios";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export default function Home() {
  // Auth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Todo state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [search, setSearch] = useState("");

  // Auth
  const login = () => {
    if (username === "Idowu" && password === "Olatomiwa") {
      setIsAuthenticated(true);
      setLoginError("");
      fetchTodos();
    } else {
      setLoginError("Invalid credentials. Try: Idowu/Olatomiwa");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setTodos([]);
  };

  // Fetch todos
  const fetchTodos = async () => {
    const res = await axios.get("https://jsonplaceholder.typicode.com/todos");
    setTodos(res.data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated]);

  // Filtering
  const filteredTodos = todos.filter((t) => {
    if (filter === "completed" && !t.completed) return false;
    if (filter === "pending" && t.completed) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  const currentTodos = filteredTodos.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handlers
  const handleAdd = () => {
    if (!text.trim()) return;
    setTodos([
      ...todos,
      { userId: 1, id: Date.now(), title: text, completed: false },
    ]);
    setText("");
  };

  const handleToggle = (id: number) => {
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDelete = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id));
    setShowModal(false);
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowModal(true);
  };

  const handleEdit = () => {
    if (!selectedTodo) return;
    setIsEditing(true);
    setEditTitle(selectedTodo.title);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle("");
  };

  const handleSave = () => {
    if (!selectedTodo) return;
    setTodos(
      todos.map((t) =>
        t.id === selectedTodo.id ? { ...t, title: editTitle } : t
      )
    );
    setSelectedTodo({ ...selectedTodo, title: editTitle });
    setIsEditing(false);
  };

  // Dynamic filter button styles
  const filterStyle = (type: "all" | "completed" | "pending") => ({
    fontWeight: filter === type ? "bold" : "normal",
    background: filter === type ? "#1976d2" : "#eee",
    color: filter === type ? "#fff" : "#333",
    margin: "0 8px",
    border: "none",
    borderRadius: "4px",
    padding: "12px 16px",
    cursor: "pointer",
  });

  // UI
  return (
    <div>
      {/* Login */}
      {!isAuthenticated ? (
        <div className="login-container">
          <h2>Login</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              type="text"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>
          {loginError && <div className="error">{loginError}</div>}
        </div>
      ) : (
        <div className="todo-container">
          <div className="header-with-logout">
            <h1 className="todo-title">To-Do List</h1>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>

          {/* Search */}
          <div className="todo-search-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              className="todo-search-input"
            />
            <button
              type="button"
              onClick={() => setSearch(search)}
              className="todo-search-button"
            >
              🔍
            </button>
          </div>

          {/* Filters */}
          <div className="todo-filters">
            <button onClick={() => setFilter("all")} style={filterStyle("all")}>
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              style={filterStyle("pending")}
            >
              Incomplete
            </button>
            <button
              onClick={() => setFilter("completed")}
              style={filterStyle("completed")}
            >
              Completed
            </button>
          </div>

          {/* Add Todo */}
          <div className="todo-add-row">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a to-do"
              className="todo-add-input"
            />
            <button onClick={handleAdd} className="todo-add-btn">
              ADD Todo
            </button>
          </div>

          {/* Todo List */}
          <ul className="todo-list">
            {currentTodos.map((todo) => (
              <li
                key={todo.id}
                onClick={() => handleTodoClick(todo)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderBottom: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id)}
                  />
                  <span>{todo.title}</span>
                </label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(todo.id);
                  }}
                  style={{ color: "red" }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="todo-pagination" style={{ margin: 16 }}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                style={{
                  fontWeight: page === idx ? "bold" : "normal",
                  background: page === idx ? "#ddd" : "#1976d2",
                  color: "white",
                  border: "4px solid #ccc",
                  borderRadius: "4px",
                  padding: "10px 20px",
                }}
              >
                {idx}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
            <span>
              page {page} of {totalPages}
            </span>
          </div>

          {/* Modal */}
          {showModal && selectedTodo && (
            <div
              role="dialog"
              aria-modal="true"
              className="modal-overlay"
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  &times;
                </button>
                <h2 id="modal-title">Todo Details</h2>

                {isEditing ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ width: "98%", marginBottom: 12 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleSave}
                        style={{
                          background: "#006400",
                          color: "#fff",
                          width: "50%",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          cursor: "pointer",
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{
                          background: "#ff0000",
                          color: "#fff",
                          width: "50%",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Title:</strong> {selectedTodo.title}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedTodo.completed
                        ? "✅ Completed"
                        : "❌ Not completed"}
                    </p>
                    <p>
                      <strong>Todo ID:</strong> {selectedTodo.id}
                    </p>
                    <p>
                      <strong>User ID:</strong> {selectedTodo.userId}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleEdit}
                        style={{
                          background: "#0000ff",
                          color: "#fff",
                          width: "50%",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selectedTodo.id)}
                        style={{
                          background: "#ff0000",
                          color: "#fff",
                          width: "50%",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          cursor: "pointer",
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

