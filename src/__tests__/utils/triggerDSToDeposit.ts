import axios from 'axios';

export async function triggerDSToDeposit() {
  await axios.post('http://localhost:8000/yield/deposits/8453/auto_deposit_poller').catch(error => {
    // eslint-disable-next-line no-console
    console.log(error);
    throw new Error('Auto deposit trigger failed!');
  });

  // wait for the system to finish depositing
  await new Promise(resolve => {
    setTimeout(resolve, 15_000);
  });
}
