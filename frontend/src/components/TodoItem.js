import React, { useState } from 'react';
import './TodoItem.css';

const TodoItem = ({ todo, onEdit, onDelete, onToggleComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleDelete = () => {
    onDelete(todo._id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="todo-item-main">
        <div className="todo-item-left">
          <button
            className="todo-checkbox"
            onClick={() => onToggleComplete(todo)}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed ? (
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="check-circle"></div>
            )}
          </button>

          <div className="todo-content">
            <h3 className="todo-title">{todo.title}</h3>
            {todo.description && (
              <p className="todo-description-preview">
                {todo.description.length > 100
                  ? `${todo.description.substring(0, 100)}...`
                  : todo.description}
              </p>
            )}
            <div className="todo-meta">
              <span
                className="priority-badge"
                style={{ backgroundColor: `${getPriorityColor(todo.priority)}20`, color: getPriorityColor(todo.priority) }}
              >
                {getPriorityLabel(todo.priority)}
              </span>
              <span className="todo-date">{formatDate(todo.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="todo-item-actions">
          {todo.description && todo.description.length > 100 && (
            <button
              className="action-btn expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(todo)}
            aria-label="Edit todo"
          >
            ✏️
          </button>
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            aria-label="Delete todo"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && todo.description && (
        <div className="todo-item-expanded">
          <div className="expanded-content">
            <h4>Description:</h4>
            <p>{todo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
