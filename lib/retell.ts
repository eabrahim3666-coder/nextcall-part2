import Retell from 'retell-sdk';

// Initialize the Retell client with your API key
const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

export default retellClient;