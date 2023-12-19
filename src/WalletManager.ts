import axios from 'axios';

async function report(walletManagerEndpoint: string) {
  let output = '';

  try {
    const result = await axios.get(walletManagerEndpoint);
    console.log(result.data);

    if (!result.data.networks) {
      throw new Error('Networks not found. Something wrong with /health endpoint');
    }

    Object.entries(result.data.networks).forEach(([name, network]) => {
      const n = network as { status: string; wallets: any };
      output += `*${name}*: ${(n.status as string) === 'OK' ? '✅' : '❌'} | Unusable wallets: ${
        Object.entries(n.wallets.unusableWallets).length
      }\n`;
    });
  } catch (error) {
    console.error(error);

    const err = error as Error;

    if (err.message) {
      output += `\n\n*Error*: ${err.message}\n`;
    } else {
      output += `\n\n*Error*: Unknown error\n`;
    }
  }

  // post output to tg bot
  return output;
}

export default { report };
