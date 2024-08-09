// UserProfile.tsx
import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import { useAppContext } from "../lib/contextLib";
import "./UserProfile.css";

export default function UserProfile() {
  const { userHasAuthenticated } = useAppContext();
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const customerId = "cus_QayO7CQh4y12uQ";

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userData = await API.get("users", "/users", {});
        setId(userData.userId);
        setEmail(userData.email);
        setBio(userData.bio || "");
      } catch (e) {
        onError(e);
      }
    }
    loadUserProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await API.put("users", `/users/${id}`, {
        body: { email, bio, customerId },
      });
      userHasAuthenticated(true);
    } catch (e) {
      onError(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="UserProfile">
      <h2>User Profile</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="bio">
          <Form.Label>Bio</Form.Label>
          <Form.Control
            as="textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Form.Group>
        <LoaderButton type="submit" isLoading={isLoading}>
          Update Profile
        </LoaderButton>
      </Form>
    </div>
  );
}