// SubscriptionConfirmed.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API } from 'aws-amplify';
import { onError } from '../lib/errorLib';
import LoaderButton from '../components/LoaderButton';

export default function SubscriptionConfirmed() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const setupIntent = searchParams.get('setup_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (setupIntent && redirectStatus === 'succeeded') {
      completePaymentMethodUpdate(setupIntent);
    } else {
      setIsProcessing(false);
      onError(new Error('Payment method update failed'));
    }
  }, [location]);

  async function completePaymentMethodUpdate(setupIntent: string) {
    try {
      await API.post('users', '/users/complete-payment-update', {
        body: { setupIntent },
      });
      setIsComplete(true);
    } catch (e) {
      onError(e);
    } finally {
      setIsProcessing(false);
    }
  }

  if (isProcessing) {
    return <div>Processing your payment method update...</div>;
  }

  return (
    <div>
      {isComplete ? (
        <>
          <h2>Payment Method Updated Successfully</h2>
          <p>Your new payment method has been added to your account.</p>
        </>
      ) : (
        <>
          <h2>Payment Method Update Failed</h2>
          <p>There was an issue updating your payment method. Please try again.</p>
        </>
      )}
      <LoaderButton onClick={() => navigate('/manage-subscription')}>
        Back to Subscription Management
      </LoaderButton>
    </div>
  );
}