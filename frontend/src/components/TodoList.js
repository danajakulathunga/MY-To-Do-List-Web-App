import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoItem from './TodoItem';
import './TodoList.css';

const TodoList = ({ onEdit, refreshTrigger }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority

  useEffect(() => {
    fetchTodos();
  }, [refreshTrigger]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/api/todos`);
      setTodos(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch todos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.delete(`${apiUrl}/api/todos/${id}`);
      fetchTodos();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete todo. Please try again.');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.put(`${apiUrl}/api/todos/${todo._id}`, {
        ...todo,
        completed: !todo.completed
      });
      fetchTodos();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update todo. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/api/todos/download/pdf`, {
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-todo-list.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download PDF. Please try again.');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  if (loading) {
    return (
      <div className="todo-list-container">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <h2 className="todo-list-title">My Tasks</h2>
        <div className="todo-stats">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active:</span>
            <span className="stat-value active">{stats.active}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed:</span>
            <span className="stat-value completed">{stats.completed}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="error-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="todo-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <div className="controls-right">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
          </select>
          
          <button
            className="download-pdf-btn"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
        </div>
      </div>

      {sortedTodos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No todos found</h3>
          <p>
            {filter === 'all'
              ? "You don't have any todos yet. Create one to get started!"
              : filter === 'active'
              ? "You don't have any active todos. Great job!"
              : "You haven't completed any todos yet."}
          </p>
        </div>
      ) : (
        <div className="todo-items">
          {sortedTodos.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onEdit={onEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
