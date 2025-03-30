import React from "react";
import router from "@/router";
import { RouterProvider } from "react-router-dom";
import "@/styles/app.css";

export const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};
