import { Telegraf, Context, Markup } from 'telegraf';
import { Update } from 'telegraf/types';
import { config } from './config';

const bot = new Telegraf<Context<Update>>(config.BotToken);

bot.start(async (ctx) => {
  try {
    const { chat } = ctx.message;

    if (chat.type === 'private') {
      ctx.sendMessage(
        `*Let's get started*\n\nAdd me to a group and follow the instructions to get started.`,
        {
          parse_mode: 'Markdown',
        }
      );
      return;
    }
  } catch (err) {
    console.log('An error occured when executing the start command', err);
  }
});

bot.launch();
console.log('Orbs Status Bot is up and running!');
