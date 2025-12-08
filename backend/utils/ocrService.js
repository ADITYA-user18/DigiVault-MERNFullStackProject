import Tesseract from 'tesseract.js';
import { isValid, isFuture } from 'date-fns';

export const detectExpiryDate = async (imageUrl) => {
  try {
    console.log("🔍 Starting OCR scan on:", imageUrl);
    
    // 1. Run OCR
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
    
    // Log raw text to verify what Tesseract sees
    // console.log("📄 Raw OCR Text:\n", text);

    // 2. Pre-processing:
    // Remove extra spaces around slashes/dashes (e.g. "10 / 12 / 2025")
    const cleanText = text.replace(/\s*[\/\-\.]\s*/g, '/').toLowerCase();

    // 3. Regex Patterns
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,       // 10/12/2025
      /\b\d{4}\/\d{1,2}\/\d{1,2}\b/g,       // 2025/12/10
      /\b\d{1,2}\s(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s\d{4}\b/g // 10 dec 2025
    ];
    
    let matches = [];
    datePatterns.forEach(pattern => {
      const found = cleanText.match(pattern);
      if (found) matches = [...matches, ...found];
    });

    if (matches.length === 0) {
      console.log("⚠️ No date patterns found.");
      return null;
    }

    // 4. Keyword Scoring
    const keywords = ["valid", "expiry", "expires", "until", "upto", "till", "date", "due"];
    
    let bestDate = null;
    let maxScore = -1;

    for (const dateStr of matches) {
      // 5. SMART PARSING LOGIC
      let parsedDate = new Date(dateStr);
      
      // CHECK 1: Is it Valid?
      if (!isValid(parsedDate)) continue;

      // CHECK 2: Is it in the Future? (Default Interpretation)
      // If 10/12/2025 is parsed as Oct 12 (Past), we try swapping to Dec 10.
      if (!isFuture(parsedDate)) {
        // Try swapping Day and Month (DD/MM/YYYY -> MM/DD/YYYY for JS parsing)
        const parts = dateStr.split('/');
        if (parts.length === 3) {
           // Swap first two parts: 10/12 -> 12/10
           const swappedDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
           
           if (isValid(swappedDate) && isFuture(swappedDate)) {
             console.log(`🔄 Swapped date format for ${dateStr} to make it future.`);
             parsedDate = swappedDate;
           } else {
             // If neither interpretation is future, skip it
             continue;
           }
        } else {
          continue;
        }
      }

      // 6. Calculate Score
      let score = 0;
      const dateIndex = cleanText.indexOf(dateStr);
      
      // Look at context words before the date
      const surroundingText = cleanText.substring(Math.max(0, dateIndex - 30), dateIndex);
      
      keywords.forEach(word => {
        if (surroundingText.includes(word)) score += 10;
      });

      // Bonus for realistic years (next 20 years)
      const currentYear = new Date().getFullYear();
      if (parsedDate.getFullYear() > currentYear && parsedDate.getFullYear() < currentYear + 20) {
        score += 5;
      }

      console.log(`🧐 Candidate: ${dateStr} | Parsed: ${parsedDate.toISOString().split('T')[0]} | Score: ${score}`);

      if (score > maxScore) {
        maxScore = score;
        bestDate = parsedDate;
      }
    }

    console.log("✅ Best Guess Expiry:", bestDate);
    return bestDate;

  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};