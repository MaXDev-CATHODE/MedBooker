/**
 * Mock MailerLite service — logs emails to console instead of sending real emails.
 * In production this would integrate with MailerLite API v2.
 */

/**
 * Add subscriber to a mailing list segment.
 * @param {Object} subscriber - { email, firstName, lastName, phone }
 * @param {string} segment - 'owner' | 'doctors'
 */
function addSubscriber(subscriber, segment) {
  console.log('\n[MOCK MAILERLITE] Add subscriber');
  console.log(`   Segment: ${segment}`);
  console.log(`   Email: ${subscriber.email}`);
  console.log(`   Name: ${subscriber.firstName} ${subscriber.lastName}`);
  console.log('   Status: ADDED (simulated)\n');
  return { success: true, subscriberId: `mock-sub-${Date.now()}` };
}

/**
 * Send confirmation email after waitlist signup.
 * @param {Object} subscriber - { email, firstName }
 * @param {string} segment - 'owner' | 'doctors'
 */
function sendConfirmationEmail(subscriber, segment) {
  const subject = segment === 'owner'
    ? 'Zostałaś zapisana na listę oczekujących do właścicielki kliniki'
    : 'Zostałaś zapisana na listę oczekujących do lekarzy';

  console.log('\n[MOCK MAILERLITE] Confirmation email');
  console.log(`   To: ${subscriber.email}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body: Cześć ${subscriber.firstName}! Powiadomimy Cię gdy zwolni się termin.`);
  console.log('   Status: SENT (simulated)\n');
  return { success: true };
}

/**
 * Send broadcast email to all subscribers in a segment.
 * @param {string} segment - 'owner' | 'doctors'
 * @param {Object} slotInfo - { doctorName, date, time, bookingUrl }
 */
function broadcastEmail(segment, slotInfo) {
  console.log('\n[MOCK MAILERLITE] Broadcast email');
  console.log(`   Segment: ${segment}`);
  console.log(`   Subject: Zwolnił się termin u ${slotInfo.doctorName}!`);
  console.log(`   Slot: ${slotInfo.date} ${slotInfo.time}`);
  console.log('   Status: SENT to all (simulated)\n');
  return { success: true };
}

module.exports = { addSubscriber, sendConfirmationEmail, broadcastEmail };
