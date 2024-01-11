import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  BotToken: process.env.BOT_TOKEN,
  StatusGroupChatId: process.env.STATUS_GROUP_CHAT_ID,
  AlertGroupChatId: process.env.ALERT_GROUP_CHAT_ID,
  AsciiTableOpts: {
    border: {
      bodyLeft: '',
      bodyRight: '',
      joinLeft: '',
      joinRight: '',
      bottomLeft: '',
      bottomRight: '',
      topLeft: '',
      topRight: '',
    },
  },
};
