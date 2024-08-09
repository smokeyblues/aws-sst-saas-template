import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { AppContext, AppContextType } from "./lib/contextLib";
import { onError } from "./lib/errorLib";
import Routes from "./Routes.tsx";
import "./App.css";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isSubscribed, userHasSubscribed] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    onLoad();
  }, []);

  async function checkSubscriptionStatus() {
    try {
      const response = await API.get("users", "/users/subscription", {});
      return response.isSubscribed;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }
  
  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
      const subscriptionStatus = await checkSubscriptionStatus();
      userHasSubscribed(subscriptionStatus);
    } catch (error) {
      if (error !== "No current user") {
        onError(error);
      }
    }
  
    setIsAuthenticating(false);
  }

  async function handleLogout() {
    await Auth.signOut();
  
    userHasAuthenticated(false);
    
    nav("/login");
  }

  return (
    !isAuthenticating && (
      <div className="App container py-3">
        <Navbar collapseOnSelect bg="light" expand="md" className="mb-3 px-3">
          <LinkContainer to="/">
            <Navbar.Brand className="fw-bold text-muted">Scratch</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav activeKey={window.location.pathname}>
            {isAuthenticated ? (
              <>
                <LinkContainer to="/settings">
                  <Nav.Link>Settings</Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/signup">
                  <Nav.Link>Signup</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
              </>
            )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <AppContext.Provider
          value={{
            isAuthenticated,
            userHasAuthenticated,
            isSubscribed,
            userHasSubscribed
          } as AppContextType}
        >
          <Routes />
        </AppContext.Provider>
      </div>
    )
  );
}

export default App;