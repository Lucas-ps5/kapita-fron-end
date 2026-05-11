import { createBrowserRouter } from "react-router";
import AppLayout from "@/layout/AppLayout";
import Welcome from "@/pages/Welcome";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import AddTransaction from "@/pages/AddTransaction";
import History from "@/pages/History";
import Debts from "@/pages/Debts";
import Tontines from "@/pages/Tontines";
import Premium from "@/pages/Premium";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Welcome },
      {
        path: "/onboarding",
        Component: Onboarding,
      },
      {
        path: "/dashboard",
        Component: Dashboard,
      },
      {
        path: "/transaction/:type",
        Component: AddTransaction,
      },
      {
        path: "/history",
        Component: History,
      },
      {
        path: "/debts",
        Component: Debts,
      },
      {
        path: "/tontines",
        Component: Tontines,
      },
      {
        path: "/premium",
        Component: Premium,
      },
      {
        path: "/settings",
        Component: SettingsPage,
      },
    ],
  },
  {
    path: "/register",
    Component: Register
  },
  { path: "*", Component: NotFound },
]);
