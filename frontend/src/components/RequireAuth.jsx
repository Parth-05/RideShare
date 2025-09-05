// src/components/RequireAuth.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { selectAuthReady } from '../redux/slices/authSlice';

export default function RequireAuth({ allowed = [], children }) {
  const ready = useSelector(selectAuthReady);
  const user  = useSelector((s) => s.auth.user);
  const location = useLocation();

  // While we don't know yet
  if (!ready) {
    return <div className="h-screen grid place-items-center text-slate-500">Loading…</div>;
  }

  // Not logged in -> go to login and remember where we came from
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but role not allowed -> send away (or to /unauthorized)
  if (allowed.length && !allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Works both with <RequireAuth><Child/></RequireAuth> and nested routes (Outlet)
  return children ?? <Outlet />;
}
