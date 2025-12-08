import cron from "node-cron";
import FileModel from "../models/File.js";
import User from "../models/User.js";
import { sendExpiryAlert } from "../utils/emailService.js";

const setupCronJob = () => {
  // Run every minute for testing
  cron.schedule("0 9 * * *", async () => {
    console.log("--- ⏳ CRON STARTED ---");

    try {
      const today = new Date();
      
      // FIX: Changed from 3 to 2 to match your "Expires in 2d" file
      const daysFromNow = 2; 

      const targetDateStart = new Date(today);
      targetDateStart.setDate(today.getDate() + daysFromNow);
      targetDateStart.setHours(0, 0, 0, 0);

      const targetDateEnd = new Date(today);
      targetDateEnd.setDate(today.getDate() + daysFromNow);
      targetDateEnd.setHours(23, 59, 59, 999);

      console.log(`🔎 Looking for files expiring (+${daysFromNow} days) between:`);
      console.log(`   Start: ${targetDateStart.toISOString()}`);
      console.log(`   End:   ${targetDateEnd.toISOString()}`);

      // 1. Find Vaults
      const vaults = await FileModel.find({
        "files.expiryDate": {
          $gte: targetDateStart,
          $lte: targetDateEnd
        }
      });

      console.log(`📂 Found ${vaults.length} vaults with matching files.`);

      if (vaults.length === 0) {
        console.log("❌ No files found. Dates don't match exactly.");
        return;
      }

      // 2. Process
      for (const vault of vaults) {
        const expiringFiles = vault.files.filter(file => {
            if (!file.expiryDate) return false;
            const d = new Date(file.expiryDate);
            return d >= targetDateStart && d <= targetDateEnd;
        });

        if (expiringFiles.length > 0) {
          const user = await User.findById(vault.userId);
          
          if (user && user.email) {
            console.log(`   📧 Sending email to ${user.email}...`);
            await sendExpiryAlert(user.email, user.name, expiringFiles);
            console.log("   ✅ Email Sent Successfully!");
          }
        }
      }

    } catch (error) {
      console.error("❌ Cron Job Error:", error);
    }
    console.log("--- 🏁 CRON FINISHED ---\n");
  });
};

export default setupCronJob;