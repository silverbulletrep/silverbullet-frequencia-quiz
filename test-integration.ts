import axios from 'axios';

const API_URL = 'http://localhost:3005';

async function testIntegration() {
    console.log('Testing PayPal Integration...');
    try {
        const res = await axios.post(`${API_URL}/api/paypal/finalize-email`, {
            orderID: 'DEBUG_BYPASS',
            email: 'teste_integracao_paypal@teste.com'
        });
        console.log('PayPal Result:', res.data);
    } catch (e: any) {
        console.error('PayPal Error:', e.response?.data || e.message);
    }

    console.log('\nTesting Stripe Integration...');
    try {
        const res = await axios.post(`${API_URL}/api/stripe/finalize`, {
            payment_intent_id: 'DEBUG_BYPASS',
            email: 'teste_integracao_stripe@teste.com'
        });
        console.log('Stripe Result:', res.data);
    } catch (e: any) {
        console.error('Stripe Error:', e.response?.data || e.message);
    }
}

testIntegration();
