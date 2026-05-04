import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import MyPosts from "./pages/MyPosts";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminTags from "./pages/admin/AdminTags";
import AdminAddEditUser from "./pages/admin/AdminAddEditUser";
import EditProfile from "./pages/EditProfile";
import Matches from "./pages/Matches";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute><EditProfile /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute><Feed /></ProtectedRoute>
        } />
        <Route path="/posts" element={
          <ProtectedRoute><MyPosts /></ProtectedRoute>
        } />
        <Route path="/posts/new" element={
          <ProtectedRoute><Posts /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="/messages/:id" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/users" element={
          <AdminRoute><AdminUsers /></AdminRoute>
        } />
        <Route path="/admin/posts" element={
          <AdminRoute><AdminPosts /></AdminRoute>
        } />
        <Route path="/admin/tags" element={
          <AdminRoute><AdminTags /></AdminRoute>
        } />
        <Route path="/admin/users/new" element={
          <AdminRoute><AdminAddEditUser /></AdminRoute>
        } />
        <Route path="/admin/users/edit/:id" element={
          <AdminRoute><AdminAddEditUser /></AdminRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute><Matches /></ProtectedRoute>
        } />
        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;