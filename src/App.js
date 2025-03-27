import React, { useState } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import router from "./router";

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
