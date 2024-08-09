// Settings.tsx
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import "./Settings.css";

export default function Settings() {
  const nav = useNavigate();

  return (
    <div className="Settings">
      <h2>Account Settings</h2>
      <LoaderButton onClick={() => nav(`/profile`)}>
        Update Profile
      </LoaderButton>
      <LoaderButton onClick={() => nav("/manage-subscription")}>
        Manage Subscription
      </LoaderButton>
    </div>
  );
}