import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TodoForm.css';

const TodoForm = ({ todo, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        priority: todo.priority || 'medium',
        completed: todo.completed || false
      });
    }
  }, [todo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (todo) {
        // Update existing todo
        await axios.put(`${apiUrl}/api/todos/${todo._id}`, formData);
      } else {
        // Create new todo
        await axios.post(`${apiUrl}/api/todos`, formData);
      }
      
      if (onSave) {
        onSave();
      }
      
      // Reset form if creating new todo
      if (!todo) {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          completed: false
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="todo-form-container">
      <form className="todo-form" onSubmit={handleSubmit}>
        <h2 className="todo-form-title">
          {todo ? 'Edit Task' : 'Create New Task'}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter todo title"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Enter todo description (optional)"
            maxLength={500}
            rows={4}
          />
          <div className="char-count">
            {formData.description.length}/500
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="form-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="completed"
              checked={formData.completed}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span className="checkbox-text">Mark as completed</span>
          </label>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {todo ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              todo ? 'Update Task' : 'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;
