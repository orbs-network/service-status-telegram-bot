import { getBorderCharacters, table } from 'table';
import { L3Status, TakerStatus } from './types';

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
    let output = '';
    try {
      const takers = await Twap.load();
      const tableOutput = takers.map((taker) => [
        taker.name,
        taker.status === 'OK' ? '✅' : taker.status,
        new Date(taker.timestamp).toLocaleString(),
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
