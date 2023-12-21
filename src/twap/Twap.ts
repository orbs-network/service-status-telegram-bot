export class Twap {
  static async report() {
    let output = '';
    try {
      output = 'TWAP report is not setup yet';
    } catch (err) {
      console.error('Error running TWAP report', err);
    }
    return output;
  }
}
