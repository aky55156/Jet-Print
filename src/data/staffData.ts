import { StaffMember, LogEntry } from '../types';

export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDHib5yEg1J8IvTeAX2YVCxiGu4yhp_mpwOtTR77JOtU0aLmE_lK02YO20BodCcQgj/exec";

export const GUEST_PIN = "0000";
export const AUDIT_LOGS_STORAGE_KEY = "jetprint_audit_logs";

export const formatAuditTimestamp = (date: Date = new Date()): string => {
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export const getLocalAuditLogs = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const recordAuditLog = (staffName: string, desig: string, actionDetails: string): void => {
  const newEntry: LogEntry = {
    timestamp: formatAuditTimestamp(new Date()),
    staffName,
    desig,
    actionDetails
  };

  try {
    const existing = getLocalAuditLogs();
    const updated = [newEntry, ...existing].slice(0, 500);
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }

  // Also send log entry to Google Apps Script backend if supported
  try {
    const formData = new URLSearchParams();
    formData.append('action', 'logActivity');
    formData.append('timestamp', newEntry.timestamp);
    formData.append('staffName', staffName);
    formData.append('desig', desig);
    formData.append('actionDetails', actionDetails);
    fetch(SCRIPT_URL, { method: 'POST', body: formData }).catch(() => {});
  } catch {
    // ignore network errors
  }
};

export const staffDatabase: StaffMember[] = [
  { name: "Dr. Lata Kapoor", hindiName: "डॉ. लता कपूर", desig: "Additional Director", category: "director" },
  { name: "Dr. Bibhash Nandi", hindiName: "डॉ. बिभाष नंदी", desig: "Joint Director", category: "director" },
  { name: "Dr. Stuti Kaushik", hindiName: "डॉ. स्तुति कौशिक", desig: "Assistant Director", category: "director" },
  { name: "Dr. Anuja Gupta", hindiName: "डॉ. अनुजा गुप्ता", desig: "Assistant Director", category: "director" },
  { name: "Mr. Udaiveer Singh", hindiName: "श्री उदयवीर सिंह", desig: "Assistant Research Officer", category: "officer" },
  { name: "Mr. Manoranjan Mishra", hindiName: "श्री मनोरंजन मिश्रा", desig: "Assistant Research Officer", category: "officer" },
  { name: "Dr. Swati Chauhan", hindiName: "डॉ. स्वाति चौहान", desig: "Assistant Research Officer", category: "officer" },
  { name: "Dr. Madhusudan Chaturvedi", hindiName: "डॉ. मधुसूदन चतुर्वेदी", desig: "Research Assistant", category: "assistant" },
  { name: "Mr. Vikram Jeet Yadav", hindiName: "श्री विक्रम जीत यादव", desig: "Research Assistant", category: "assistant" },
  { name: "Mr. Sachin Khandelwal", hindiName: "श्री सचिन खंडेलवाल", desig: "Research Assistant", category: "assistant" },
  { name: "Mr. Shashi Kant Sharma", hindiName: "श्री शशि कांत शर्मा", desig: "Technician", category: "technical" },
  { name: "Ms. Mamta Rav", hindiName: "सुश्री ममता राव", desig: "Technician", category: "technical" },
  { name: "Ms. Priyanka", hindiName: "सुश्री प्रियंका", desig: "Technician", category: "technical" },
  { name: "Mr. Pramod Kumar Shrewas", hindiName: "श्री प्रमोद कुमार श्रेवास", desig: "Technician", category: "technical" },
  { name: "Mr. Yogander Prasad", hindiName: "श्री योगेंदर प्रसाद", desig: "Technician", category: "technical" },
  { name: "Mr. Ankit", hindiName: "श्री अंकित", desig: "Technician", category: "technical" },
  { name: "Mr. Munish Sharma", hindiName: "श्री मुनीश शर्मा", desig: "Insect Collector", category: "technical" },
  { name: "Mr. Aakash Tripathi", hindiName: "श्री आकाश त्रिपाठी", desig: "Laboratory Attendant", category: "attendant" },
  { name: "Mr. Shiv Kumar", hindiName: "श्री शिव कुमार", desig: "Animal Attendant", category: "attendant" },
  { name: "Mr. Surender Singh", hindiName: "श्री सुरेंद्र सिंह", desig: "Laboratory Attendant", category: "attendant" },
  { name: "Mr. Kishan Lal", hindiName: "श्री किशन लाल", desig: "Insect Collector", category: "technical" },
  { name: "Dr. Warisha Mariam", hindiName: "डॉ. वारिशा मरियम", desig: "Public Health Specialist", category: "specialist" },
  { name: "Dr. Dhirender Kumar", hindiName: "डॉ. धीरेंद्र कुमार", desig: "Microbiologist", category: "specialist" },
  { name: "Dr. Shyama Datt", hindiName: "डॉ. श्यामा दत्त", desig: "Microbiologist", category: "specialist" },
  { name: "Dr. Swati Pattnaik", hindiName: "डॉ. स्वाति पटनायक", desig: "Microbiologist", category: "specialist" },
  { name: "Dr. Rashi Raizada", hindiName: "डॉ. राशि रायजादा", desig: "Technical Officer", category: "officer" },
  { name: "Mr. Tapender", hindiName: "श्री तपेन्द्र", desig: "Research Assistant", category: "assistant" },
  { name: "Mr. Mohd. Jishan", hindiName: "श्री मो. जीशान", desig: "Research Assistant", category: "assistant" },
  { name: "Dr. Balvindra Singh", hindiName: "डॉ. बलविन्द्र सिंह", desig: "Food Microbiologist", category: "specialist" },
  { name: "Mr. Ravendra Kumar Kesarwani", hindiName: "श्री रवींद्र कुमार केसरवानी", desig: "Research Assistant", category: "assistant" },
  { name: "Ms. Aashi Chauhan", hindiName: "सुश्री आशि चौहान", desig: "Technical Assistant", category: "assistant" },
  { name: "Ms. Ranjana Yadav", hindiName: "सुश्री रंजना यादव", desig: "Technical Assistant", category: "assistant" },
  { name: "Mr. Amit kumar Yadav", hindiName: "श्री अमित कुमार यादव", desig: "Multipurpose Assistant", category: "assistant" },
  { name: "Mr. Mohd Faizan", hindiName: "श्री मो. फैजान", desig: "Multipurpose Assistant", category: "assistant" },
  { name: "Dr. Shalu Kathuria", hindiName: "डॉ. शालू कथूरिया", desig: "PH Technical Officer", category: "officer" },
  { name: "Harsh", hindiName: "हर्ष", desig: "Lab Attendant", category: "attendant" },
  { name: "Alka", hindiName: "अलका", desig: "Lab Attendant", category: "attendant" },
  { name: "Khushi Goel", hindiName: "खुशी गोयल", desig: "Intern- CBDDR", category: "assistant" },
  { name: "Guest User", hindiName: "Guest Mode", desig: "Guest Mode", category: "assistant" }
];
