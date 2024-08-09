import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useFormFields } from "../lib/hooksLib";
import { Token, StripeError } from "@stripe/stripe-js";
import LoaderButton from "../components/LoaderButton";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./BillingForm.css";

export interface BillingFormType {
  isLoading: boolean;
  planName: string;
  isAnnual: boolean;
  onSubmit: (
    info: { token?: Token; error?: StripeError }
  ) => Promise<void>;
}

export function BillingForm({ isLoading, planName, isAnnual, onSubmit }: BillingFormType) {
  const stripe = useStripe();
  const elements = useElements();
  const [fields, handleFieldChange] = useFormFields({
    name: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);

  isLoading = isProcessing || isLoading;

  function validateForm() {
    const isValid = !!(
      stripe &&
      elements &&
      fields.name !== "" &&
      isCardComplete
    );
    return isValid;
  }

  async function handleSubmitClick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("CardElement not found");
      return;
    }

    setIsProcessing(true);

    try {
      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        console.error("Error creating Stripe token:", error);
        throw error;
      }

      await onSubmit({ token, error });
    } catch (e) {
      console.error("Error in form submission:", e);
      alert("An error occurred while processing your payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  // useEffect(() => {
  //   console.log("Form state changed:", {
  //     stripe: !!stripe,
  //     elements: !!elements,
  //     name: fields.name,
  //     isCardComplete
  //   });
  // }, [stripe, elements, fields.name, isCardComplete]);

  return (
    <Form className="BillingForm" onSubmit={handleSubmitClick}>
      <Stack gap={3}>
        <Form.Group controlId="name">
          <Form.Label>Cardholder's name</Form.Label>
          <Form.Control
            size="lg"
            type="text"
            value={fields.name}
            onChange={handleFieldChange}
            placeholder="Name on the card"
          />
        </Form.Group>
        <div>
          <Form.Label>Credit Card Info</Form.Label>
          <CardElement
            className="card-field"
            onChange={(e) => {
              setIsCardComplete(e.complete);
            }}
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#495057",
                  fontFamily: "'Open Sans', sans-serif",
                },
              },
            }}
          />
        </div>
        <LoaderButton
          size="lg"
          type="submit"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Subscribe to {planName} Plan ({isAnnual ? 'Annual' : 'Monthly'})
        </LoaderButton>
      </Stack>
    </Form>
  );
}