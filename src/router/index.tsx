import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts";
import { SigninPage } from "@/pages/SigninPage";
import { Homepage } from "@/pages/Homepage";
import { AnnouncementsPage } from "@/pages/AnnouncementsPage";
import { EventsPage } from "@/pages/EventsPage";
import { ForumsPage } from "@/pages/ForumsPage";
import { ToolkitsPage } from "@/pages/ToolkitsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" />,
  },
  {
    path: "/signin",
    element: <SigninPage />,
  },
  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        path: "/admin/home",
        element: <Homepage />,
      },
      {
        path: "/admin/announcements",
        element: <AnnouncementsPage />,
      },
      {
        path: "/admin/events",
        element: <EventsPage />,
      },
      {
        path: "/admin/forums",
        element: <ForumsPage />,
      },
      {
        path: "/admin/toolkits",
        element: <ToolkitsPage />,
      },
    ],
  },
]);

export default router;
