import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import AppDetails from './pages/AppDetails';
import Terms from './pages/docs/Terms';
import Privacy from './pages/docs/Privacy';
import API from './pages/docs/API';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/app/:slug" element={<AppDetails />} />
              <Route path="/docs/terms" element={<Terms />} />
              <Route path="/docs/privacy" element={<Privacy />} />
          <Route path="/docs/api" element={<API />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
