import axios from 'axios';

export async function triggerDSToDeposit(bearerToken: string) {
  await axios
    .post('http://localhost:8000/yield/deposits/8453/auto_deposit_poller', undefined, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log(error);
      throw new Error('Auto deposit trigger failed!');
    });

  // wait for the system to finish depositing
  await new Promise(resolve => {
    setTimeout(resolve, 10_000);
  });
}
