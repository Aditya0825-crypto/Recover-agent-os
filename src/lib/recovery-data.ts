export type CaseStatus = "Recovered" | "Pending" | "Human Review" | "Recoverable" | "Stopped";
export type Priority = "High" | "Medium" | "Low";

export type RecoveryCase = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  reason: string;
  probability: number;
  expected: number;
  action: "Wait" | "Retry" | "Payment Link" | "Reminder" | "Human Review" | "Stop";
  priority: Priority;
  status: CaseStatus;
  lastAction: string;
  created: string;
  method: string;
  retryCount: number;
  confidence: number;
  diagnosis: string;
  diagnosisDetail: string;
  rationale: string;
  recoveredAmount?: number;
};

export const recoveryCases: RecoveryCase[] = [
  {
    id: "RC-20418", customer: "Asha Verma", email: "asha.v@acme.in", amount: 24999, reason: "Temporary bank failure", probability: 89, expected: 22249, action: "Retry", priority: "High", status: "Recovered", lastAction: "Payment recovered", created: "9 min ago", method: "HDFC · Visa •••• 4821", retryCount: 1, confidence: 94, diagnosis: "Temporary bank failure", diagnosisDetail: "Issuer timeout with no fraud or balance signal. Similar attempts recover within 90 minutes.", rationale: "The failure is transient, the customer has a strong payment history, and a delayed retry avoids duplicate issuer pressure.", recoveredAmount: 24999,
  },
  {
    id: "RC-20417", customer: "Kabir Malhotra", email: "kabir.m@acme.in", amount: 1249, reason: "Insufficient funds", probability: 76, expected: 949, action: "Wait", priority: "Medium", status: "Pending", lastAction: "Waiting 90 minutes", created: "22 min ago", method: "ICICI · UPI", retryCount: 0, confidence: 88, diagnosis: "Insufficient funds", diagnosisDetail: "The payment was declined by the issuer without a systemic error signature.", rationale: "A short wait gives the customer time to replenish their account before a reminder or retry.",
  },
  {
    id: "RC-20416", customer: "Meera Nair", email: "meera.n@acme.in", amount: 99000, reason: "UPI limit exceeded", probability: 61, expected: 60390, action: "Human Review", priority: "High", status: "Human Review", lastAction: "Escalated to finance", created: "1 hr ago", method: "Axis · UPI", retryCount: 2, confidence: 72, diagnosis: "Payment rail limit", diagnosisDetail: "The amount is above the merchant's automated threshold for this payment rail.", rationale: "The expected value is material, but policy requires a human decision for high-value UPI recoveries.",
  },
  {
    id: "RC-20415", customer: "Devan Iyer", email: "devan.i@acme.in", amount: 8450, reason: "Card declined", probability: 84, expected: 7098, action: "Payment Link", priority: "High", status: "Recoverable", lastAction: "Payment link generated", created: "2 hrs ago", method: "Razorpay · Mastercard •••• 9090", retryCount: 1, confidence: 91, diagnosis: "Soft card decline", diagnosisDetail: "Issuer declined the first attempt, but the card has recovered successfully on alternate checkout flows.", rationale: "A payment link is the highest-converting next step without increasing retry pressure on the issuer.",
  },
  {
    id: "RC-20414", customer: "Ravi Chandran", email: "ravi.c@acme.in", amount: 4320, reason: "Repeated failure", probability: 18, expected: 778, action: "Stop", priority: "Low", status: "Stopped", lastAction: "Outreach stopped", created: "3 hrs ago", method: "Kotak · Visa •••• 1244", retryCount: 3, confidence: 97, diagnosis: "Repeated payment failure", diagnosisDetail: "Three attempts failed across 24 hours with no new recovery signal.", rationale: "Further outreach is unlikely to recover revenue and would violate the maximum-attempt guardrail.",
  },
  {
    id: "RC-20413", customer: "Nikhil Rao", email: "nikhil.r@acme.in", amount: 6799, reason: "Session timeout", probability: 81, expected: 5507, action: "Reminder", priority: "Medium", status: "Recoverable", lastAction: "Reminder scheduled", created: "4 hrs ago", method: "SBI · Visa •••• 7766", retryCount: 0, confidence: 86, diagnosis: "Checkout session timeout", diagnosisDetail: "The customer left during checkout and the issuer never received an authorization request.", rationale: "A low-friction reminder recovers intent without presenting the customer with another failed attempt.",
  },
  {
    id: "RC-20412", customer: "Sana Khan", email: "sana.k@acme.in", amount: 18990, reason: "Temporary bank failure", probability: 92, expected: 17471, action: "Wait", priority: "High", status: "Pending", lastAction: "Systemic guard applied", created: "5 hrs ago", method: "HDFC · Mastercard •••• 8012", retryCount: 0, confidence: 95, diagnosis: "Bank service degradation", diagnosisDetail: "A cluster of HDFC failures shares the same 27-minute incident window.", rationale: "The systemic guard is holding outreach until the payment rail health signal clears.",
  },
];

export const activityEvents = [
  { label: "Payment recovered", detail: "RC-20418 · ₹24,999", tone: "mint" },
  { label: "Retry executed", detail: "RC-20418 · policy approved", tone: "brand" },
  { label: "Root cause identified", detail: "bank timeout · 94% confidence", tone: "amber" },
  { label: "Payment link generated", detail: "RC-20415 · ₹8,450", tone: "sky" },
  { label: "Probability calculated", detail: "736 cases · avg 82%", tone: "violet" },
  { label: "Outreach paused", detail: "systemic guard · 3,421 avoided", tone: "rose" },
];

export const auditEvents = [
  { id: "AUD-73190", time: "09:42:18", what: "Retry executed", caseId: "RC-20418", why: "Temporary bank failure with 89% recovery probability", policy: "Retry limit not exceeded; amount within automated threshold", outcome: "Payment successful", recovered: 24999 },
  { id: "AUD-73189", time: "09:41:51", what: "Policy approved action", caseId: "RC-20415", why: "Soft card decline; payment link predicted 84% recovery", policy: "Payment link permitted; customer eligible", outcome: "Link delivered", recovered: 0 },
  { id: "AUD-73188", time: "09:40:07", what: "Outreach paused", caseId: "SYSTEM-088", why: "1,284 HDFC failures clustered in 27 minutes", policy: "Systemic failure protection enabled", outcome: "3,421 contacts avoided", recovered: 0 },
  { id: "AUD-73187", time: "09:38:44", what: "Human review requested", caseId: "RC-20416", why: "₹99,000 UPI payment exceeded automated threshold", policy: "High-value payment requires approval", outcome: "Finance queue", recovered: 0 },
  { id: "AUD-73186", time: "09:34:19", what: "Case stopped", caseId: "RC-20414", why: "Three failed attempts with 18% recovery probability", policy: "Maximum recovery attempts reached", outcome: "Outreach stopped", recovered: 0 },
];

export const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;