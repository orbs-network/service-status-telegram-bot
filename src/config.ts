import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  BotToken: process.env.BOT_TOKEN,
  WalletManagerEndpoint: process.env.WALLET_MANAGER_ENDPOINT,
};
