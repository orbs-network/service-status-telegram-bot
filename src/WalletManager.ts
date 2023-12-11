import axios from 'axios';

async function report() {
  console.log('Starting Wallet Manager Status...');

  let output = '';

  try {
    const result = await axios.get('https://wallet-manager-1-a1922d7bed1d.herokuapp.com/health');
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

    if ('message' in error) {
      output += `\n\n*Error*: ${error.message}\n`;
    } else {
      output += `\n\n*Error*: Unknown error\n`;
    }
  }

  // post output to tg bot
  return output;
}

export default { report };
