import cron from "node-cron";
import  FileModel from '../models/File.js'
import User from '../models/User.js'
import { sendExpiryAlert } from '../utils/emailService.js'
const setupCronJob = () => {
  // Schedule: Run every day at 9:00 AM
  // "0 9 * * *"
  
  // For TESTING right now, you can change this to "* * * * *" (runs every minute)
  cron.schedule("0 9 * * *", async () => {
    console.log("⏳ [CRON] Checking for expiring documents...");

    try {
      const today = new Date();
      
      // We look for files expiring exactly 3 days from now
      // (You can duplicate this logic to check for 7 days or 1 day as well)
      const targetDateStart = new Date(today);
      targetDateStart.setDate(today.getDate() + 3);
      targetDateStart.setHours(0, 0, 0, 0);

      const targetDateEnd = new Date(today);
      targetDateEnd.setDate(today.getDate() + 3);
      targetDateEnd.setHours(23, 59, 59, 999);

      // 1. Find Vaults containing matching files
      const vaults = await FileModel.find({
        "files.expiryDate": {
          $gte: targetDateStart,
          $lte: targetDateEnd
        }
      });

      if (vaults.length > 0) {
        console.log(`Found ${vaults.length} users with documents expiring in 3 days.`);
      }

      // 2. Process each vault
      for (const vault of vaults) {
        
        // Filter the specific files triggering the alert
        const expiringFiles = vault.files.filter(file => {
            if (!file.expiryDate) return false;
            const d = new Date(file.expiryDate);
            return d >= targetDateStart && d <= targetDateEnd;
        });

        if (expiringFiles.length > 0) {
          // 3. Fetch User Email
          const user = await User.findById(vault.userId);
          
          if (user && user.email) {
            // 4. Send Email using your Util
            await sendExpiryAlert(user.email, user.name, expiringFiles);
          }
        }
      }

    } catch (error) {
      console.error("❌ Cron Job Error:", error);
    }
  });
};

export default setupCronJob;