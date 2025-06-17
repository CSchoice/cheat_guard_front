import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exams from './pages/Exams';
import ExamDetail from './pages/ExamDetail';
import Analyzer from './pages/Analyzer';
import Streaming from './pages/Streaming';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import TeacherRoute from './components/TeacherRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Box minH="100vh" bg="gray.50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/exams" element={<PrivateRoute><Exams /></PrivateRoute>} />
            <Route path="/exams/:id" element={<PrivateRoute><ExamDetail /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            
            {/* Teacher only routes */}
            <Route path="/analyzer" element={
              <TeacherRoute>
                <Analyzer />
              </TeacherRoute>
            } />
            <Route path="/streaming" element={
              <TeacherRoute>
                <Streaming />
              </TeacherRoute>
            } />
          </Route>
          
          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
