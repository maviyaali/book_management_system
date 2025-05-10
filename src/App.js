import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Configure axios to use credentials if needed
  axios.defaults.withCredentials = process.env.REACT_APP_WITH_CREDENTIALS === 'true';

  // Add request interceptor for auth headers if using JWT
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Fetch books from cloud backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/books`);
        setBooks(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.response?.data?.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({
      ...newBook,
      [name]: value
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (newBook.title.trim() === '' || newBook.author.trim() === '') {
      setError('Title and Author are required fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/books`, newBook);
      setBooks([...books, response.data]);
      setNewBook({
        title: '',
        author: '',
        description: ''
      });
      setError('');
    } catch (err) {
      console.error('Error adding book:', err);
      setError(err.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/books/${id}`);
      setBooks(books.filter(book => book._id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Book Management System</h1>
      
      <div className="book-form">
        <h2>Add New Book</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleAddBook}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={newBook.title}
              onChange={handleInputChange}
              required
              placeholder="Enter book title"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Author:</label>
            <input
              type="text"
              name="author"
              value={newBook.author}
              onChange={handleInputChange}
              required
              placeholder="Enter author name"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={newBook.description}
              onChange={handleInputChange}
              placeholder="Enter book description (optional)"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="add-button"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>
      
      <div className="book-list">
        <h2>Your Books ({books.length})</h2>
        {loading && books.length === 0 ? (
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <p className="no-books">No books added yet. Add your first book above!</p>
        ) : (
          <div className="books-container">
            {books.map((book) => (
              <div key={book._id} className="book-card">
                <h3>{book.title}</h3>
                <p className="author">By: {book.author}</p>
                {book.description && (
                  <p className="description">{book.description}</p>
                )}
                <button 
                  onClick={() => handleDeleteBook(book._id)}
                  className="delete-button"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;