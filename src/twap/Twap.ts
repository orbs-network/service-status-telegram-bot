import { getBorderCharacters, table } from 'table';
import { L3Status, TakerStatus } from './types';
import { truncate } from '../utils';

export class Twap {
  static async load() {
    try {
      const result = await fetch('https://status.orbs.network/json-full');
      const l3status = (await result.json()) as L3Status;

      const takers: TakerStatus[] = [];

      for (const committeeNode of Object.values(l3status.CommitteeNodes)) {
        const twapL3Status = committeeNode.NodeServices['vm-twap'];

        if (!twapL3Status) {
          continue;
        }

        const takerStatus = twapL3Status.VMStatusJson;

        if (!takerStatus) {
          continue;
        }

        takers.push({
          name: committeeNode.Name,
          status: takerStatus.Status.substring(9, takerStatus.Status.indexOf(',')).trim(),
          timestamp: Date.parse(takerStatus.Timestamp),
        });
      }

      return takers;
    } catch (err) {
      console.error('Error loading TWAP takers', err);
      return [];
    }
  }

  static async report() {
    let output = '📊 TWAP Takers\n\n';
    try {
      const takers = await Twap.load();
      const tableOutput = takers.map((taker) => [
        truncate(taker.name, 20),
        taker.status === 'OK' ? '✅' : taker.status,
      ]);
      output += `\`\`\`${table(tableOutput, {
        border: getBorderCharacters('void'),
      })}\`\`\``;
    } catch (err) {
      console.error('Error running TWAP report', err);
      output += '\n\nError running TWAP report';
    }
    return output;
  }
}
