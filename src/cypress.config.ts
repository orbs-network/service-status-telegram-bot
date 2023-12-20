import { defineConfig } from 'cypress';
import axios, { AxiosError } from 'axios';
import { getBorderCharacters, table } from 'table';
import { bot, db } from '.';
import { NotificationType } from './types';
import { wait } from './utils';

type TestResults = {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  totalSkipped: number;
  runs: {
    tests: {
      title: string[];
      state: string;
    }[];
  }[];
};

async function postResults(results: TestResults) {
  try {
    await axios.post('https://bi.orbs.network/putes/twap-e2e', JSON.stringify(results), {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('Results posted to Kibana successfully ✅');
  } catch (err) {
    console.error('Error posting results to Kibana:', (err as AxiosError).message, err);
  }

  try {
    const data: string[][] = [];

    results.runs.forEach((run) => {
      run.tests.forEach((test) => {
        let emoji = '';
        switch (test.state) {
          case 'passed':
            emoji = '✅';
            break;
          case 'failed':
            emoji = '❌';
            break;
          case 'pending':
            emoji = '⏸️';
            break;
          case 'skipped':
            emoji = '⚠️';
            break;
        }
        data.push([test.title[0], emoji]);
      });
    });

    let message = `*📊 TEST RESULTS*\n\n\`\`\`\n${table(data, {
      border: getBorderCharacters('void'),
    })}\`\`\`\n\nTotal tests: ${results.totalTests}\nTotal passed: ${
      results.totalPassed
    }\nTotal failed: ${results.totalFailed}\nTotal skipped: ${
      results.totalSkipped
    }\nTotal paused: ${results.totalPending}`;
    console.log(message);

    const notifications = await db.getByNotificationType(NotificationType.TWAP);
    for (const { chatId } of notifications) {
      try {
        await bot.telegram.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
        });
        await wait(1000);
      } catch (err) {
        console.log('An error occurred when sending TWAP e2e results', err);
        // Handle the error (retry, notify user, etc.)
      }
    }

    console.log('Results posted to Telegram successfully ✅');
  } catch (err) {
    console.error('Error posting results to Telegram:', (err as AxiosError).message, err);
  }
}

export default defineConfig({
  e2e: {
    specPattern: 'src/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      on('after:run', async (results) => {
        if ('totalTests' in results) {
          const output = {
            totalTests: results.totalTests,
            totalPassed: results.totalPassed,
            totalFailed: results.totalFailed,
            totalPending: results.totalPending,
            totalSkipped: results.totalSkipped,
            runs: results.runs.map((run) => {
              return {
                tests: run.tests.map((test) => {
                  return {
                    title: test.title,
                    state: test.state,
                  };
                }),
              };
            }),
          };

          await postResults(output);
        }
      });
    },
    supportFile: false,
  },
});
