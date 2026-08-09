// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, User, BarChart3, Shield, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PatientView from './pages/PatientView';
import Evaluation from './pages/Evaluation';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patient/:subjectId" element={<PatientView />} />
            <Route path="/evaluation" element={<Evaluation />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;