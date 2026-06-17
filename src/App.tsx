/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { LiveMatch } from './components/LiveMatch';
import { Library } from './components/Library';
import { Player } from './components/Player';
import { Profile } from './components/Profile';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* User Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live" element={<LiveMatch />} />
          <Route path="/library" element={<Library />} />
          <Route path="/watch/:id" element={<Player />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminAuth />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
