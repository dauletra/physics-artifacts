import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute } from './components/admin/AdminRoute';

import { ShowcasePage } from './pages/ShowcasePage';
import { ArtifactDetailPage } from './pages/ArtifactDetailPage';
import { LoginPage } from './pages/LoginPage';
import { ArtifactsListPage } from './pages/admin/ArtifactsListPage';
import { ArtifactEditPage } from './pages/admin/ArtifactEditPage';
import { SectionsPage } from './pages/admin/SectionsPage';
import { TagsPage } from './pages/admin/TagsPage';
import { AdminsPage } from './pages/admin/AdminsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ShowcasePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<ArtifactsListPage />} />
            <Route path="/admin/artifacts/new" element={<ArtifactEditPage />} />
            <Route path="/admin/artifacts/:id" element={<ArtifactEditPage />} />
            <Route path="/admin/sections" element={<SectionsPage />} />
            <Route path="/admin/tags" element={<TagsPage />} />
            <Route path="/admin/admins" element={<AdminsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
