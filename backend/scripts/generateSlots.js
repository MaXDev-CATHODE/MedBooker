/**
 * Script to generate mock appointment slots for the next 30 days.
 * Run: node scripts/generateSlots.js
 */

const fs = require('fs');
const path = require('path');

const doctors = ['dr-iza', 'dr-anna', 'dr-kasia', 'dr-owner'];
const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const slots = [];

for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);

  // Skip some days randomly to make it realistic
  if (Math.random() < 0.1) continue;

  const dateStr = date.toISOString().split('T')[0];

  doctors.forEach((doctorId) => {
    // Clinic owner has fewer public slots (exclusive calendar)
    const doctorHours = doctorId === 'dr-owner'
      ? hours.filter(() => Math.random() < 0.3)
      : hours.filter(() => Math.random() < 0.6);

    doctorHours.forEach((hour) => {
      slots.push({
        id: `slot-${doctorId}-${dateStr}-${hour.replace(':', '')}`,
        doctorId,
        date: dateStr,
        time: hour,
        startTime: `${dateStr}T${hour}:00`,
        available: true
      });
    });
  });
}

const outputPath = path.join(__dirname, '../data/slots.json');
fs.writeFileSync(outputPath, JSON.stringify(slots, null, 2));
console.log(`Generated ${slots.length} slots -> ${outputPath}`);
