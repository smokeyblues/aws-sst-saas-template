// SubscriptionManagement.tsx
import { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import config from "../config";
import "./SubscriptionManagement.css";

const stripePromise = loadStripe(config.STRIPE_KEY);

function PaymentForm({ clientSecret, isLoading }) {
    const stripe = useStripe();
    const elements = useElements();
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!stripe || !elements) return;
  
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-confirmed`,
        },
      });
  
      if (result.error) {
        onError(result.error);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <LoaderButton type="submit" isLoading={isLoading}>
          Update Payment Method
        </LoaderButton>
      </form>
    );
  }

export default function SubscriptionManagement() {
  const nav = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSubscriptionData() {
      try {
        const subData = await API.get("users", "/users/subscription", {});
        setSubscription(subData);

        const setupIntent = await API.post("users", "/users/create-setup-intent", {}); 
        setClientSecret(setupIntent.clientSecret);
      } catch (e) {
        onError(e);
      }
    }
    loadSubscriptionData();
  }, []);

  async function handlePaymentUpdate() {
    setIsLoading(true);
    try {
      await API.post("users", "/users/update-payment-method", {});
      alert("Payment method updated successfully!");
      nav("/settings");
    } catch (e) {
      onError(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="SubscriptionManagement">
      <h2>Manage Subscription</h2>
      {subscription && subscription.isSubscribed && (
        <div>
          <p>Current Plan: {subscription.planName}</p>
          <p>Billing Cycle: {subscription.isAnnual ? "Annual" : "Monthly"}</p>
          <p>Next Billing Date: {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}</p>
        </div>
      )}
      <LoaderButton onClick={() => nav("/choose-plan")}>
        Change Plan
      </LoaderButton>
      <h3>Update Payment Method</h3>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm handleSubmit={clientSecret} isLoading={isLoading} />
        </Elements>
      )}
    </div>
  );
}