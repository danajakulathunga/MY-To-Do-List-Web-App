import React, { useState } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  const [editingTodo, setEditingTodo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSave = () => {
    setEditingTodo(null);
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setEditingTodo(null);
    setShowForm(false);
  };

  const handleCreateNew = () => {
    setEditingTodo(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">To-Do List App</h1>
          <p className="app-subtitle">Manage your tasks efficiently Now</p>
        </div>
      </header>

      <main className="app-main">
        <div className="app-container">
          {showForm && (
            <div className="form-section">
              <TodoForm
                todo={editingTodo}
                onSave={handleFormSave}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          <div className="list-section">
            {!showForm && (
              <div className="create-button-container">
                <button
                  className="create-todo-btn"
                  onClick={handleCreateNew}
                >
                  <span className="btn-icon">+</span>
                  Create New Task
                </button>
              </div>
            )}

            <TodoList
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© To-do List App - Developed By Dhanaja V. Kulathunga</p>
      </footer>
    </div>
  );
}

export default App;
