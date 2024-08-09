import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";

export const main = Util.handler(async (event) => {
  const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2024-06-20",
  });

  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const prices = await stripe.prices.list({
      active: true,
    });

    const plans = products.data.map(product => {
      const productPrices = prices.data.filter(price => price.product === product.id);
      const monthlyPrice = productPrices.find(price => price.recurring?.interval === 'month');
      const annualPrice = productPrices.find(price => price.recurring?.interval === 'year');

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        monthlyPriceId: monthlyPrice?.id,
        annualPriceId: annualPrice?.id,
        monthlyPrice: monthlyPrice?.unit_amount ? monthlyPrice.unit_amount / 100 : null,
        annualPrice: annualPrice?.unit_amount ? annualPrice.unit_amount / 100 : null,
        currency: monthlyPrice?.currency || annualPrice?.currency,
      };
    });

    return JSON.stringify(plans);
  } catch (error) {
    console.error('Error fetching Stripe plans:', error);
    throw new Error('Failed to fetch plans from Stripe');
  }
});