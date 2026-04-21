import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layout } from './components/Layout';
import { Landing } from './components/Landing';
import { Questionnaire } from './components/Questionnaire';
import { AdminDashboard } from './components/AdminDashboard';
import { Success } from './components/Success';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="step/:type" element={<Questionnaire />} />
          <Route path="success" element={<Success />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
