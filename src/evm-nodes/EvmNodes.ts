import { table } from 'table';
import { truncate } from '../utils';
import { EvmNodeAlert, EvmNodeStatus } from './types';
import { config } from '../config';
import { Alert, NotificationType } from '../types';

const evmNodes = [
  { url: 'http://107.6.163.146:3000/', name: 'Ethereum' },
  { url: 'http://198.20.99.86:3000/', name: 'Bsc' },
  { url: 'http://198.20.96.246:3000/', name: 'Polygon' },
  { url: 'http://198.20.104.2:3000/', name: 'Fantom' },
  { url: 'http://107.6.181.166:3000/', name: 'Avalanche' },
  { url: 'http://107.6.176.54:3000/', name: 'Arbitrum' },
];

export class EvmNodes {
  static async loadEvmNodes() {
    const statuses: EvmNodeStatus[] = [];

    const results = await Promise.allSettled(
      evmNodes.map(async (node) => {
        try {
          const response = await fetch(node.url);

          const data = (await response.json()) as EvmNodeStatus;
          return { ...data, name: node.name };
        } catch (err) {
          console.error('Error loading EVM nodes', err);
          return { name: node.name, status: 'ERROR: fetching node status' };
        }
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        continue;
      }

      statuses.push(result.value);
    }
    return statuses;
  }

  static async report() {
    let output = '📊 *EVM Nodes*\n\n';
    try {
      const nodes = await EvmNodes.loadEvmNodes();
      const tableOutput = [
        ['', 'Status'],
        ...nodes.map((node) => [
          truncate(node.name, 20),
          node.status === 'OK' ? '✅' : node.status,
        ]),
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
    } catch (err) {
      console.error('Error running EVM Nodes report', err);
      output += 'Error running EVM Nodes report';
    }
    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const nodes = await EvmNodes.loadEvmNodes();
      nodes.forEach((node) => {
        if (node.status !== 'OK') {
          alerts.push({
            notificationType: NotificationType.EvmNodesAlerts,
            alertType: EvmNodeAlert.NodeDown,
            name: node.name,
            timestamp: new Date().getTime(),
            message: `🚨 *EVM NODE STATUS* 🚨\n\n*${node.name}*: ${node.status}`,
          });
        }
      });
    } catch (err) {
      console.error('Error running EVM Nodes alerts', err);
    }
    return alerts;
  }
}
