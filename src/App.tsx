import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./features/admin/auth/AuthProvider";
import { ProtectedRoute } from "./features/admin/auth/ProtectedRoute";
import PortfolioPage from "./pages/PortfolioPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ExperienceFormPage from "./pages/admin/ExperienceFormPage";
import ExperiencesListPage from "./pages/admin/ExperiencesListPage";
import GalleryFormPage from "./pages/admin/GalleryFormPage";
import GalleryListPage from "./pages/admin/GalleryListPage";
import MessagesPage from "./pages/admin/MessagesPage";
import ProfilePage from "./pages/admin/ProfilePage";
import ProjectFormPage from "./pages/admin/ProjectFormPage";
import ProjectsListPage from "./pages/admin/ProjectsListPage";
import TechnologiesListPage from "./pages/admin/TechnologiesListPage";
import TechnologyFormPage from "./pages/admin/TechnologyFormPage";
import TestimonialFormPage from "./pages/admin/TestimonialFormPage";
import TestimonialsListPage from "./pages/admin/TestimonialsListPage";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/new" element={<ProjectFormPage />} />
          <Route path="projects/:id/edit" element={<ProjectFormPage />} />
          <Route path="gallery" element={<GalleryListPage />} />
          <Route path="gallery/new" element={<GalleryFormPage />} />
          <Route path="gallery/:id/edit" element={<GalleryFormPage />} />
          <Route path="experiences" element={<ExperiencesListPage />} />
          <Route path="experiences/new" element={<ExperienceFormPage />} />
          <Route
            path="experiences/:id/edit"
            element={<ExperienceFormPage />}
          />
          <Route path="technologies" element={<TechnologiesListPage />} />
          <Route
            path="technologies/new"
            element={<TechnologyFormPage />}
          />
          <Route
            path="technologies/:id/edit"
            element={<TechnologyFormPage />}
          />
          <Route path="testimonials" element={<TestimonialsListPage />} />
          <Route
            path="testimonials/new"
            element={<TestimonialFormPage />}
          />
          <Route
            path="testimonials/:id/edit"
            element={<TestimonialFormPage />}
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;
