import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { BillingForm } from "./BillingForm";
import { Token } from "@stripe/stripe-js";
import config from "../config";
import "./PlanPicker.css";
import { Plan } from "../types/plan";

const stripePromise = loadStripe(config.STRIPE_KEY);

export default function PlanPicker() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    async function loadPlans() {
      try {
        const fetchedPlans = await API.get("users", "/plans", {});
        // Sort plans from least expensive to most expensive based on monthly price
        const sortedPlans = fetchedPlans.sort((a: Plan, b: Plan) => a.monthlyPrice - b.monthlyPrice);
        setPlans(sortedPlans);
        if (sortedPlans.length > 0) {
          setSelectedPlan(sortedPlans[0]);
        }
      } catch (e) {
        onError(e);
      }
    }

    loadPlans();
  }, []);

  const handlePlanChange = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleBillingCycleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnnual(event.target.checked);
  };

  const handleFormSubmit: BillingFormType["onSubmit"] = async ({ token, error }: { token: Token | null; error: any }) => {
    if (error) {
      onError(error);
      return;
    }

    setIsLoading(true);

    try {
      // Add the payment method to the customer
      await API.post("users", "/users/add-payment-method", {
        body: { token: token?.id },
      });

      // Create the subscription
      await API.post("users", "/users/create-subscription", {
        body: { 
          priceId: isAnnual ? selectedPlan?.annualPriceId : selectedPlan?.monthlyPriceId,
          planName: selectedPlan?.name,
          isAnnual,
        },
      });

      alert("Your subscription has been created successfully!");
      nav("/");
    } catch (e) {
      onError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="PlanPicker">
      <h2>Choose Your Plan</h2>
      <div className="billing-cycle">
        <label>
          <input
            type="checkbox"
            checked={isAnnual}
            onChange={handleBillingCycleChange}
          />
          Bill annually (save up to 17%)
        </label>
      </div>
      <div className="plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan ${selectedPlan?.id === plan.id ? "selected" : ""}`}
            onClick={() => handlePlanChange(plan)}
          >
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <p>
              {isAnnual
                ? `$${plan.annualPrice}/year`
                : `$${plan.monthlyPrice}/month`}
            </p>
          </div>
        ))}
      </div>
      {selectedPlan && (
        <Elements
          stripe={stripePromise}
          options={{
            fonts: [
              {
                cssSrc:
                  "https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800",
              },
            ],
          }}
        >
          <BillingForm 
            isLoading={isLoading}
            planName={selectedPlan.name}
            isAnnual={isAnnual}
            onSubmit={handleFormSubmit}
          />
        </Elements>
      )}
    </div>
  );
}