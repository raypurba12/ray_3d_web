import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./features/admin/auth/AuthProvider";
import { ProtectedRoute } from "./features/admin/auth/ProtectedRoute";
import PortfolioPage from "./pages/PortfolioPage";

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AccountPage = lazy(() => import("./pages/admin/AccountPage"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const ExperienceFormPage = lazy(
  () => import("./pages/admin/ExperienceFormPage")
);
const ExperiencesListPage = lazy(
  () => import("./pages/admin/ExperiencesListPage")
);
const GalleryFormPage = lazy(() => import("./pages/admin/GalleryFormPage"));
const GalleryListPage = lazy(() => import("./pages/admin/GalleryListPage"));
const MessagesPage = lazy(() => import("./pages/admin/MessagesPage"));
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage"));
const ProjectFormPage = lazy(() => import("./pages/admin/ProjectFormPage"));
const ProjectsListPage = lazy(() => import("./pages/admin/ProjectsListPage"));
const TechnologiesListPage = lazy(
  () => import("./pages/admin/TechnologiesListPage")
);
const TechnologyFormPage = lazy(
  () => import("./pages/admin/TechnologyFormPage")
);
const TestimonialFormPage = lazy(
  () => import("./pages/admin/TestimonialFormPage")
);
const TestimonialsListPage = lazy(
  () => import("./pages/admin/TestimonialsListPage")
);

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
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;
