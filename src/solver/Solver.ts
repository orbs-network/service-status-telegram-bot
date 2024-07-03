import { table } from 'table';
import { config } from '../config';
import { Alert, NotificationType, NotificationTypeNames } from '../types';
import { SolverAlert, SolverStatus } from './types';

export class Solver {
  static async report() {
    let output = `📊 *${NotificationTypeNames[NotificationType.Solver]}*\n\n`;
    let errors = '';
    try {
      const resp = await fetch('https://utils.orbs.network/orbs-solver/status');
      const result = (await resp.json()) as SolverStatus;

      if (result.Status !== 'OK') {
        errors += `- *${result.Hostname}*: ${result.Status}\n`;
      }

      const tableOutput = [
        ['Hostname', 'Status'],
        [result.Hostname, result.Status === 'OK' ? '✅' : '❌'],
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
      if (errors.length > 0) {
        output += `\n\n❌ *ERRORS*:\n\n${errors}`;
      }
    } catch (err) {
      console.error('Error running Solver report', err);
      output += 'Error running Solver report';
    }
    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const resp = await fetch('https://utils.orbs.network/orbs-solver/status');
      const result = (await resp.json()) as SolverStatus;

      if (result.Status !== 'OK') {
        alerts.push({
          notificationType: NotificationType.SolverAlerts,
          alertType: SolverAlert.SolverDown,
          name: result.Hostname,
          timestamp: new Date(result.Timestamp).getTime(),
          message: `🚨 *${NotificationTypeNames[NotificationType.SolverAlerts]}* 🚨\n\n*${
            result.Hostname
          }*: ${result.Status}`,
        });
      }
    } catch (err) {
      console.error('Error running Solver alerts', err);
    }
    return alerts;
  }
}
