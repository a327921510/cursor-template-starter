import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";

const Home = lazy(() => import("@/pages/Home"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];
