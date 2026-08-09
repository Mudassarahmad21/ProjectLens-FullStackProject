import { connectDB } from './config/db.js';
import TimelineEvent from './models/TimelineEvent.js';

const checkProgress = async () => {
  await connectDB();
  const count = await TimelineEvent.countDocuments();
  console.log(`Current timeline events: ${count}`);
  process.exit(0);
};

checkProgress();