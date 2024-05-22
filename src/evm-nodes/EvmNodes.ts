import { table } from 'table';
import { truncate } from '../utils';
import { EvmNodeAlert, EvmNodeStatus } from './types';
import { config } from '../config';
import { Alert, NotificationType, NotificationTypeNames } from '../types';

const evmNodes = [
  // { url: 'http://107.6.163.146:3000/', name: 'Ethereum' },
  { url: 'http://198.20.99.86:3000/', network: 'Bsc' },
  { url: 'http://198.20.96.246:3000/', network: 'Polygon' },
  // { url: 'http://198.20.104.2:3000/', network: 'Fantom' },
  // { url: 'http://107.6.181.166:3000/', name: 'Avalanche' },
  // { url: 'http://107.6.176.54:3000/', name: 'Arbitrum' },
];

const diskSpaceThresholdsTB: Record<string, number> = {
  bsc: 2,
  polygon: 3,
  fantom: 1,
};

export class EvmNodes {
  static async loadEvmNodes() {
    const statuses: EvmNodeStatus[] = [];

    const results = await Promise.allSettled(
      evmNodes.map(async (node) => {
        try {
          const response = await fetch(node.url);

          const data = (await response.json()) as EvmNodeStatus;
          return data;
        } catch (err) {
          console.error('Error loading EVM nodes', err);
          return {
            network: node.network,
            status: 'ERROR - fetching node status',
            lastBlockNumber: 0,
            timeSinceLastBlock: 0,
            timeSinceUpgrade: 0,
            freeDiskSpace: 0,
            freeMemory: 0,
            cpuUsage: 0,
            uptime: 0,
            timestamp: Date.now().toLocaleString(),
          };
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
    let output = `📊 *${NotificationTypeNames[NotificationType.EvmNodesStatus]}*\n\n`;
    let errors = '';
    try {
      const nodes = await EvmNodes.loadEvmNodes();
      const tableOutput = [
        ...nodes.map((node) => {
          if (node.status !== 'OK') {
            errors += `- *${node.network}*: ${node.status}\n`;
          }
          return [truncate(node.network, 20), node.status === 'OK' ? '✅' : '❌'];
        }),
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
      if (errors.length > 0) {
        output += `\n\n❌ *ERRORS*:\n\n${errors}`;
      }
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
            name: node.network,
            timestamp: new Date().getTime(),
            message: `🚨 *${NotificationTypeNames[NotificationType.EvmNodesAlerts]}* 🚨\n\n*${
              node.network
            }*: ${node.status}`,
          });
        }

        const freeDiskSpaceTB = node.freeDiskSpace / 1000000000;

        if (freeDiskSpaceTB < diskSpaceThresholdsTB[node.network]) {
          alerts.push({
            notificationType: NotificationType.EvmNodesAlerts,
            alertType: EvmNodeAlert.LowDiskSpace,
            name: node.network,
            timestamp: new Date().getTime(),
            message: `🚨 *${NotificationTypeNames[NotificationType.EvmNodesAlerts]}* 🚨\n\n*${
              node.network
            }*: Low disk space! ${freeDiskSpaceTB.toFixed(2)}TB is less than minimum of ${
              diskSpaceThresholdsTB[node.network]
            }TB.`,
          });
        }
      });
    } catch (err) {
      console.error('Error running EVM Nodes alerts', err);
    }
    return alerts;
  }
}
