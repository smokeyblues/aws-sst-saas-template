import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";

export default function SubscribedRoute({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { isSubscribed } = useAppContext();

  if (!isSubscribed) {
    return <Navigate to="/choose-plan" />;
  }

  return children;
}