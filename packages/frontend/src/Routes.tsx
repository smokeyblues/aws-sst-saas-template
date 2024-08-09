import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home.tsx";
import Login from "./containers/Login.tsx";
import Signup from "./containers/Signup.tsx";
import NewNote from "./containers/NewNote.tsx";
import Notes from "./containers/Notes.tsx";
import Settings from "./containers/Settings.tsx";
import PlanPicker from "./components/PlanPicker.tsx";
import NotFound from "./containers/NotFound.tsx";

import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import SubscribedRoute from "./components/SubscribedRoute.tsx";

import UserProfile from "./containers/UserProfile";
import SubscriptionManagement from "./containers/SubscriptionManagement";
import SubscriptionConfirmed from "./containers/SubscriptionConfirmed";

export default function Links() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
    <Route
      path="/login"
      element={
          <UnauthenticatedRoute>
          <Login />
          </UnauthenticatedRoute>
    }
    />
    <Route
      path="/signup"
      element={
          <UnauthenticatedRoute>
          <Signup />
          </UnauthenticatedRoute>
    }
    />
    <Route
      path="/settings"
      element={
          <AuthenticatedRoute>
          <Settings />
          </AuthenticatedRoute>
    }
    />
    <Route
      path="/profile"
      element={
        <AuthenticatedRoute>
          <UserProfile />
        </AuthenticatedRoute>
      }
    />
    <Route
      path="/manage-subscription"
      element={
        <AuthenticatedRoute>
          <SubscriptionManagement />
        </AuthenticatedRoute>
      }
    />
    <Route
      path="/subscription-confirmed"
      element={
        <AuthenticatedRoute>
          <SubscriptionConfirmed />
        </AuthenticatedRoute>
      }
    />
    <Route
      path="/notes/new"
      element={
          <AuthenticatedRoute>
              <SubscribedRoute>
          <NewNote />
              </SubscribedRoute>
          </AuthenticatedRoute>
    }
    />

    <Route
      path="/notes/:id"
      element={
          <AuthenticatedRoute>
          <SubscribedRoute>
              <Notes />
          </SubscribedRoute>
          </AuthenticatedRoute>
    }
    />

    <Route
      path="/choose-plan"
      element={
          <AuthenticatedRoute>
          <PlanPicker />
          </AuthenticatedRoute>
    }
    />

      {/* Finally, catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />;
    </Routes>
  );
}