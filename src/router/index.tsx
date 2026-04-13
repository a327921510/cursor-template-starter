import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { Spin } from "antd";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

export function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
