/**
 * Mock SMS service — logs messages to console instead of sending real SMS.
 * In production this would integrate with SMSAPI.pl or a similar provider.
 */

/**
 * Send a single SMS.
 * @param {string} to - Phone number in international format
 * @param {string} message - SMS body content
 */
function sendSMS(to, message) {
  console.log('\n[MOCK SMS]');
  console.log(`   To: ${to}`);
  console.log(`   Message: ${message}`);
  console.log('   Status: SENT (simulated)\n');
  return { success: true, messageId: `mock-sms-${Date.now()}` };
}

/**
 * Send broadcast SMS to multiple recipients.
 * @param {string[]} recipients - Array of phone numbers
 * @param {string} message - SMS body content
 */
function broadcastSMS(recipients, message) {
  console.log('\n[MOCK BROADCAST SMS]');
  console.log(`   Recipients: ${recipients.length} numbers`);
  console.log(`   Message: ${message}`);
  console.log('   Status: SENT to all (simulated)\n');
  return { success: true, count: recipients.length };
}

module.exports = { sendSMS, broadcastSMS };
