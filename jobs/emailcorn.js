import cron from "node-cron";
import { Email } from "../models/User.js";
import { sendEmail } from "../services/mailer.js";

// run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  const emails = await Email.find();

  for (const email of emails) {
    await sendEmail(email.email);
  }
});