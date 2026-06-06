const mongoose = require("mongoose");
const FAQ = require("../models/FAQ");
const Category = require("../models/Category");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

let faqCounter = 0;
const faqs = [
  // ===== Category: About the Internship =====
  {
    question: "What is the Vicharanashala internship?",
    answer: "A two-month internship run by Vicharanashala, a research lab at IIT Ropar. You will work on a real open-source project under a mentor, after a short training phase tailored to where you already are. The internship is free — we do not charge, and the work is real.",
    category: "About the Internship",
    tags: ["overview", "general", "basics"],
  },
  {
    question: "What is VINS?",
    answer: "VINS is the Vicharanashala Internship — an online programme open to anyone who clears our interview. The work is real open-source contribution under a mentor, the certificate is from the Vicharanashala Lab for Education Design at IIT Ropar, and the programme itself is free (we charge nothing). There is no stipend.\n\nIf you are seeing a yellow VINS panel on your result page, you are selected.",
    category: "About the Internship",
    tags: ["VINS", "overview", "selection"],
  },
  {
    question: "What are the phases of VINS, and what do the badges mean?",
    answer: "VINS is structured as four phases. Each one is marked by a badge:\n\n🥉 Bronze (Phase 1) — a short training period at the start, planned around what you already know. If you arrive already comfortable with the basics, your mentor may skip Bronze and put you straight on to the project.\n\n🥈 Silver (Phase 2) — the main work. You contribute to a real open-source project under a Vicharanashala mentor. Finishing Bronze and Silver completes your internship and earns the certificate.\n\n🥇 Gold (Phase 3) — a recognition awarded during Silver if your contribution stands on its own as a meaningful feature, not just a small fix.\n\n🏆 Platinum (Phase 4) — a standing invitation to come back and visit the lab — a short trip — any time during the year after your internship ends. We help with travel through a small visit stipend.\n\nMost interns finish at Bronze + Silver, and that is exactly what the certificate is for. Gold and Platinum are extras you can pick up if your work makes the case for them.",
    category: "About the Internship",
    tags: ["phases", "badges", "bronze", "silver", "gold", "platinum"],
  },
  {
    question: "Who is the internship for? Are alumni eligible?",
    answer: "The internship is for currently-enrolled students at any college or university — undergraduate, postgraduate, or doctoral. The NOC requirement is the practical reflection of this: we ask for institutional consent that you can commit your time to this internship.\n\nCandidates who have already graduated and are not currently enrolled in any programme are not eligible for this cycle. If you re-enrol later (higher studies, etc.), you are very welcome to apply again in a future cycle.",
    category: "About the Internship",
    tags: ["eligibility", "alumni", "students"],
  },
  {
    question: "Is this the same as IIT Ropar's official Summer Research Internship?",
    answer: "No. Summership 2026 is a VLED Lab initiative. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by the institute. IIT Ropar runs a separate institutional summer research internship through its own office. Do not represent Summership 2026 as equivalent to that programme.",
    category: "About the Internship",
    tags: ["IIT Ropar", "summer research", "certificate"],
  },
  {
    question: "I have to attend my class tomorrow/today/some day can I take leave?",
    answer: "Leave is not permitted. If you are also attending classes or exams, you will be relieved from the internship immediately and will need to join the next batch when it starts.",
    category: "About the Internship",
    tags: ["leave", "attendance", "classes"],
  },

  // ===== Category: Timing and Dates =====
  {
    question: "When can I start?",
    answer: "You can start any time in 2026 — VINS is flexible on the start date — but there are two things you must hold in mind together, and one strong recommendation.\n\n**The hard rule.** Your internship must finish by 31 December 2026. That date is non-negotiable. Whatever start you pick, your end date (your start + 2 months, with up to 1 month grace) must land on or before 31 December 2026.\n\n**The strong recommendation:** start as soon as possible. The earlier you join, the more of the May–July main cohort you catch — and three things make starting earlier materially better:\n\n- Cohort networking: The batch goes through Bronze together — peer discussions, parallel problem-solving, and lasting connections happen during this window.\n- TA support is concentrated in May–July. TAs are full-time during this window.\n- Training rolls out with the cohort, not piecemeal.\n\nIf starting now is genuinely impossible, you can begin later and still earn the certificate — but the cohort effect and support will be lighter, and the December cap means a late start leaves no room for slippage.",
    category: "Timing and Dates",
    tags: ["start date", "cohort", "deadline", "recommendation"],
  },
  {
    question: "How long is the internship?",
    answer: "Two months from your chosen start date, with an optional one-month grace period if you need it. End must land on or before 31 December 2026.",
    category: "Timing and Dates",
    tags: ["duration", "two months", "grace period"],
  },
  {
    question: "Can I start in July, August or later if I have exams now?",
    answer: "Yes — but only if your exams genuinely make an earlier start impossible. Wait until your exams are done, then opt in and start. Do not attempt to juggle this internship with ongoing exams. Make sure your chosen start date plus 2 months (or 3 with grace) lands on or before 31 December 2026.",
    category: "Timing and Dates",
    tags: ["late start", "exams", "defer"],
  },
  {
    question: "Can I start with the cohort and take a relaxation during my exam window?",
    answer: "No. This is not an arrangement we offer.\n\nVINS is a full-attention internship — six to ten hours a day, sometimes more. Splitting that with college exams damages both sides: the project loses momentum, the exams suffer, and the mentor invests in someone who can only half-engage.\n\nIf your exams fall inside the cohort duration, defer your start to after your exams end, opt in then, and run the internship at full attention. The certificate and project pathway are the same.\n\n**Important:** If we later learn that a candidate was sitting college exams during their internship period, we reserve the right to terminate the internship or withhold the certificate at any time — including after the internship has otherwise been completed.",
    category: "Timing and Dates",
    tags: ["exam relaxation", "consequences", "full attention"],
  },
  {
    question: "Can I take leave or get an exemption during the internship for an exam scheduled in June?",
    answer: "The attendance rule is firm — the 55-day continuous window is a non-negotiable part of the internship, and we cannot offer an exemption for an exam during this period. The policy exists because split attention genuinely damages both your exam preparation and your internship work.",
    category: "Timing and Dates",
    tags: ["leave", "exam exemption", "attendance"],
  },
  {
    question: "Are orientation session recordings shared with interns, and can project or group assignments be changed after watching them?",
    answer: "Recordings of the sessions will not be provided. However, we may provide access to an abridged version of a talk or session if we consider it important. We do not guarantee this for every session.",
    category: "Timing and Dates",
    tags: ["recordings", "orientation", "sessions"],
  },

  // ===== Category: NOC (No Objection Certificate) =====
  {
    question: "What dates do I put on the NOC?",
    answer: "Default: your chosen start date → your start + 2 months (with up to 1 month grace), ensuring the end date is on or before 31 December 2026. Pick the earliest start date you can realistically make — the May–July summer window is the main cohort.\n\nIf the NOC will be signed on a specific later date, pick a start date after the signature date.",
    category: "NOC",
    tags: ["NOC", "dates", "start date"],
  },
  {
    question: "Who can sign the NOC?",
    answer: "Any authorised signatory at your college: HOD, Acting HOD (during holidays), Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign — pick whichever is easier. For IITM BS Online Degree (standalone) students, any officer from the BS office can sign.",
    category: "NOC",
    tags: ["NOC", "signatory", "HOD", "college"],
  },
  {
    question: "When do I submit the NOC? Is the deadline hard?",
    answer: "There is no specific calendar cut-off date by which the NOC must be uploaded — but your internship cannot formally begin until your official institutional NOC has been uploaded and validated by us. A self-declaration gets you a provisional offer letter immediately, but it does not start the internship. So submit your signed NOC as early as possible and join the current summer cohort.\n\nIf you are on VINS you can technically upload your NOC and start later in the year, but we strongly do not recommend it — by then your mentor may already be busy with other work, you will not get to network properly with the rest of the cohort, and the cohort + TA support are concentrated during the summer window.",
    category: "NOC",
    tags: ["NOC", "deadline", "submission", "provisional offer"],
  },
  {
    question: "What format should I use? Do I need to design it myself?",
    answer: "No — we provide a printable NOC format. Once your result is out and you log in to samagama.in, you will see a \"Download blank NOC\" button on your dashboard. Take a printout, get it physically signed and stamped by your authorised signatory, scan it, and upload the signed PDF using the \"Upload signed NOC\" button (also on the dashboard). You do not need to draft anything yourself, and you do not need college letterhead — the format we provide is the canonical layout.",
    category: "NOC",
    tags: ["NOC", "format", "download", "dashboard"],
  },
  {
    question: "What if my college / Program Chair gives me an NOC in their own format?",
    answer: "A college's own NOC format is acceptable, as long as all of the required entries are present on it:\n\n- the signing authority's (HOD / Dean / Program Chair / Principal) handwritten signature — this is the most important item,\n- the signing authority's name, designation, official email address, and phone number (we cross-check with that person to verify the signature is genuine),\n- your full name and the internship period (start and end dates),\n- and your signature.\n\nIf your college's format does not include a place for your signature, sign clearly and prominently anywhere on the document before uploading. An NOC missing any of them is incomplete and will be returned for correction.",
    category: "NOC",
    tags: ["NOC", "college format", "requirements", "signature"],
  },
  {
    question: "Does it need to be signed by hand?",
    answer: "Yes. Three things are required, all on the NOC format we provide:\n\n1. The authorised signatory's handwritten signature,\n2. The institutional rubber stamp / seal applied in the designated area,\n3. The signatory's email address filled in the designated field — we automatically cross-check with that person to verify the signature is genuine.\n\nDigital signatures are not accepted on the PDF path. If a physically-signed printout is impractical for your HOD, use the email-forward path — it is fully equivalent.",
    category: "NOC",
    tags: ["NOC", "handwritten signature", "stamp", "digital signature"],
  },
  {
    question: "Can my HOD email the NOC instead of signing a printout?",
    answer: "Yes — there is a fully-equivalent email-forward path. Use whichever is easier; you do not need to do both.\n\n**How it works:**\n1. From your dashboard, download the text NOC (the \"Download text NOC (email path)\" button next to the printable PDF download).\n2. Fill in the student-side fields, then email the file to your HOD and ask them to forward it.\n3. **Your HOD forwards the email to sudarshan@iitrpr.ac.in from their official institutional email address**, with the subject line: NOC for my student <Your Full Name>\n\nThe forward itself counts as the signature — the HOD's official institutional email address is the verification, exactly like the signatory-email field on the PDF NOC.\n\n**Two non-negotiable conditions:**\n- The forward must come from the HOD's official institutional email address (a college/university domain) — not a personal Gmail or Outlook account.\n- The subject line must start with \"NOC for my student\" so it routes correctly.\n\nAfter the forward arrives and we validate it, confirmation and offer-letter issuance follow (typically within an hour to one working day).",
    category: "NOC",
    tags: ["NOC", "email", "HOD", "forward"],
  },
  {
    question: "How do I download and upload the NOC?",
    answer: "Both happen on your dashboard at samagama.in once your result is out. You will see a NOC section with two buttons in three places (all backed by the same endpoints — use whichever is convenient):\n\n- A compact pill in the dark header bar at the top of every screen.\n- A standalone NOC card on the dashboard, between the Results card and the Talk-to-Yaksha button.\n- A NOC section at the bottom of your full Result message itself.\n\n**The two buttons:**\n- **Download blank NOC** — saves the printable NOC format PDF.\n- **Upload signed NOC (PDF)** — opens a file picker; the file must be a PDF of at most 1 MB.\n\nThe chat surface no longer carries any NOC affordance — please use the dashboard buttons.",
    category: "NOC",
    tags: ["NOC", "download", "upload", "dashboard"],
  },
  {
    question: "What if my NOC is not formally verified?",
    answer: "NOC verification takes time — typically anywhere between an hour and one full working day from the moment you upload.\n\nIf you need your offer letter sooner, upload a self-declaration on your dashboard and a provisional offer letter will be issued to you immediately. Important: the provisional offer confirms your selection, but you can formally begin the internship only after your official institutional NOC is uploaded and validated by us. The self-declaration does not replace the NOC — please upload your signed NOC as early as you can so your start is not delayed.",
    category: "NOC",
    tags: ["NOC", "verification", "provisional offer", "self-declaration"],
  },
  {
    question: "My online course (Masai, NPTEL, Coursera, etc.) won't issue an NOC. What do I do?",
    answer: "The internship is open only to candidates currently enrolled in a full-time degree programme at a recognised college or university. Online-only courses — Masai Institute, NPTEL / MOOC enrolments, Coursera, Udacity, bootcamps, and similar — do not by themselves make a candidate eligible.\n\nIf you are concurrently enrolled in a full-time degree programme alongside the online course, please obtain a No Due / No Objection certificate from that college (department, Dean's office, or Principal) and upload it via the NOC upload flow on your dashboard.\n\nIf your only current academic engagement is the online course and you are not concurrently enrolled in a full-time degree programme, the internship is not open to you in this cycle.",
    category: "NOC",
    tags: ["NOC", "online course", "Masai", "NPTEL", "Coursera", "eligibility"],
  },
  {
    question: "My HOD/college official wants written confirmation before signing my NOC. What do I show them?",
    answer: "Your selection is already confirmed the moment your yellow VINS (or green VISE) result panel appears on your samagama.in dashboard — that is the official confirmation of selection. There is no separate written letter issued before the NOC step by default.\n\nIf your HOD/college official insists on a document in hand before signing, use the provisional offer letter route:\n\n1. Log in to samagama.in and open your dashboard.\n2. Upload a brief self-declaration (a short statement that you intend to start your internship and will submit your signed NOC once approved).\n3. A provisional offer letter on Vicharanashala letterhead is issued to your dashboard immediately.\n4. Hand the provisional offer letter to your HOD/college official — it serves as the written confirmation they need to sign your NOC.\n\nOnce your HOD signs the NOC and you upload it back and we validate it, your provisional offer is confirmed.",
    category: "NOC",
    tags: ["NOC", "confirmation", "provisional offer letter", "HOD"],
  },
  {
    question: "Can Prof. Sudarshan Iyengar or a faculty member from IIT Ropar sign my NOC for the internship?",
    answer: "Your NOC must be signed by an authorised signatory at the institution where you are enrolled as a student — such as your HOD, Dean, Principal, or Training & Placement Officer. Sudarshan Iyengar is a faculty member at IIT Ropar and is not the authorised signatory for the IIT Ropar/Masai online AIML programme. He cannot sign your NOC in a personal capacity.\n\nRegarding eligibility: the internship is open to candidates currently enrolled in a UG/PG/Diploma programme at a recognised college or university. An online-only certification course (even if offered jointly with an IIT) does not meet that requirement on its own.\n\nIf you are concurrently enrolled in a full-time degree programme elsewhere, please obtain the NOC from the authorised signatory at that institution. If your only current academic enrolment is the IIT Ropar/Masai online programme, you are not eligible for this internship cycle.",
    category: "NOC",
    tags: ["NOC", "Sudarshan Iyengar", "IIT Ropar", "signatory"],
  },

  // ===== Category: Selection, Offer Letter & Certificate =====
  {
    question: "How do I know I am selected?",
    answer: "If you can see your yellow VINS result panel on samagama.in, you are selected. There is no separate selection step or confirmation email.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["selection", "result", "VINS", "confirmation"],
  },
  {
    question: "How do I opt into VINS?",
    answer: "Tell Yaksha in the chat: 'I want to take up the online internship without stipend.' Yaksha will confirm. Opting in is the selection — no separate confirmation email is sent at that stage.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["opt in", "VINS", "Yaksha", "selection"],
  },
  {
    question: "When do I get the offer letter?",
    answer: "Your offer letter is issued automatically once you upload your signed institutional NOC (and have confirmed your start and end dates on the dashboard) and we validate it — typically within an hour to one full working day of upload.\n\nThe offer letter lives on your dashboard at samagama.in, not in your email. When it is issued, a notification will appear in the Announcements section. Log in and click Download Offer Letter from the Offer Letter card on your dashboard.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["offer letter", "NOC", "dashboard", "download"],
  },
  {
    question: "Will I get a certificate?",
    answer: "Yes — every intern who completes the internship gets a certificate from Vicharanashala, IIT Ropar. The internship is genuinely demanding; candidates who drop out mid-way do not get a certificate. Finishing means something, because the bar is high.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["certificate", "completion", "Vicharanashala"],
  },
  {
    question: "How do I confirm my internship dates?",
    answer: "Once you have opted into VINS, log in to samagama.in. On the dashboard, you will see a yellow card titled 'Confirm your internship dates'. The two date pickers pre-fill with sensible defaults. If those work for you, hit 'Save dates'. Otherwise edit them to your earliest realistic start — your end must be on or before 31 December 2026.\n\nYou can edit any time from the same card. The dates you enter must match the internship period your HOD signs off on in your NOC.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["dates", "confirm", "dashboard", "NOC"],
  },
  {
    question: "I am a minor/major in AI student, can I join the programme?",
    answer: "Minor/Major in AI course from IIT Ropar is a certification course and there will be a different track of internship equivalent to them. Kindly write to us separately for this. For you to be part of this internship programme you should be a registered student in a UG/PG programme with some university. This internship is exclusively meant for students only and not for working professionals.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["AI student", "IIT Ropar", "eligibility", "minor major"],
  },
  {
    question: "How do I accept the offer letter?",
    answer: "Reply All on the offer-letter thread — the email from no-reply@vicharanashala.ai already has sudarshan@iitrpr.ac.in on it. In the body, paste the following acceptance statement exactly:\n\n'I, [Full Name], confirm that I have read, understood, and accepted all terms, conditions, and obligations set out in this offer letter and in the program FAQ at samagama.in. I formally accept the offer of Summer Internship 2026.'\n\nCopy-paste this sentence as-is. Do not paraphrase, do not shorten. The reply must reach us within 5 days of the offer letter being sent.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["acceptance", "offer letter", "email", "reply"],
  },
  {
    question: "What if I reply without using the exact acceptance format?",
    answer: "The offer is withdrawn, effective immediately, with no further correspondence. The withdrawal is final.\n\nThis is a deliberate policy. The acceptance statement is the first attention-to-detail check of the internship.\n\nWhat counts as non-compliant: paraphrasing the statement, sending only 'I accept' or 'Yes, accepted', missing the date, missing the FAQ-reference clause.\n\nIf you received a withdrawal email and believe it was a genuine error, send a fresh email to sudarshansudarshan@gmail.com with subject line 'Request to Reconsider: Confirmation Reply Error'.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["withdrawal", "acceptance format", "non-compliant", "appeal"],
  },
  {
    question: "I received a withdrawal email because I didn't accept correctly. Can it be reversed?",
    answer: "There is an appeal path. Send a fresh email to sudarshansudarshan@gmail.com. The subject line must be exactly: 'Request to Reconsider: Confirmation Reply Error'. In the body, state an apology and the reason. If genuine, we will respond within 24 hours.\n\nAn appeal that is granted does not restore the offer on the standard track — it places you on a separate track with an additional attention-to-detail course.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["appeal", "withdrawal", "reconsider", "email"],
  },
  {
    question: "My dashboard doesn't update after sending acceptance. What happens?",
    answer: "The dashboard tracks your NOC, internship dates, and offer letter — it does not track the acceptance email. After you send your acceptance reply, you will not see a new green tick or status change. This is normal.\n\nWe process acceptance emails manually. If compliant, no further action is needed from your side. If several working days pass and you have heard nothing, type #escalate in the Yaksha chat.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["dashboard", "acceptance", "status", "update"],
  },
  {
    question: "Can I change my internship dates?",
    answer: "Before the offer letter is issued: yes — open the Confirm Internship Dates card on your dashboard and edit the dates at any time. Your end date must be on or before 31 December 2026.\n\nAfter the offer letter is issued: no. Dates are final and will not be changed.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["change dates", "offer letter", "deadline"],
  },
  {
    question: "When and how do I get the Zoom link for the kickoff meeting?",
    answer: "The kickoff orientation is held for the main summer cohort only. The Zoom link is delivered through email to your registered address and your Yaksha chat portal.\n\nIf your start date is later, there is no separate kickoff event for you. If you cannot register with the Zoom link, type #escalate in the Yaksha chat.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["kickoff", "Zoom", "orientation", "link"],
  },
  {
    question: "My NOC is not ready but my start date is approaching. What do I do?",
    answer: "Get your signed institutional NOC uploaded as soon as you can. Your start date cannot be honoured until your official NOC is uploaded and validated. If your NOC is not in by your chosen start date, your start simply shifts to whenever it is validated.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["NOC", "start date", "delay", "upload"],
  },
  {
    question: "When does my internship actually begin?",
    answer: "Your internship begins on the start date you confirmed on the dashboard — provided your official institutional NOC has been uploaded and validated by then. If your validated NOC is not yet in on your start date, your start shifts to the day it is validated.\n\nOn the morning of your start date, log in to samagama.in. Yaksha will guide you through the Day-1 steps of the Bronze phase.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["start date", "NOC", "Bronze", "Day-1"],
  },
  {
    question: "Can I switch from VINS to VISE after being selected?",
    answer: "The two tracks are finalised at the interview stage, and we do not move candidates between them. VISE has a fixed on-campus capacity. VINS is not a consolation track. The project, the mentor, and the certificate are the same as VISE — what differs is the mode (online) and the absence of a fellowship.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["VINS", "VISE", "switch track", "offline"],
  },
  {
    question: "How do I get the link for daily Zoom standups? Are they mandatory?",
    answer: "Daily Zoom standup links are posted in the Announcements section on your samagama.in dashboard. We do not send separate emails for daily standups.\n\nAttending daily standups is mandatory for all interns. Missing standups is treated as missing work. Attendance and participation are tracked against strict thresholds.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["standup", "Zoom", "daily", "mandatory", "attendance"],
  },
  {
    question: "How do I provide my Zoom ID, and why does it matter?",
    answer: "On your dashboard, just before 'Start the internship,' you will see a step called 'Provide your Zoom ID.' Enter the exact email address linked to your Zoom account.\n\nThis matters because we match your live-session attendance using this email. If the Zoom ID doesn't match the email you actually join Zoom with, your attendance won't be credited.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["Zoom ID", "email", "attendance", "dashboard"],
  },
  {
    question: "I saved the wrong Zoom ID — can I change it?",
    answer: "Once saved, your Zoom ID is final and cannot be changed by you. If you entered the wrong email, type #escalate in the chat with your correct Zoom email, and our team will review and correct it for you.",
    category: "Selection, Offer Letter & Certificate",
    tags: ["Zoom ID", "change", "correct", "escalate"],
  },

  // ===== Category: Work, Mentorship & Projects =====
  {
    question: "What will I work on?",
    answer: "A real open-source project from Vicharanashala's portfolio — assigned based on your background and the lab's current needs. Areas range across AI/ML, web development, NLP, computer vision, agriculture-tech (Annam.AI), education-tech (ViBe), and open-source infrastructure. We do not pre-publish the exact problem; you choose to join knowing the lab will assign the project.",
    category: "Work, Mentorship & Projects",
    tags: ["project", "open-source", "AI/ML", "web dev"],
  },
  {
    question: "How many hours per day?",
    answer: "Plan for 6 to 10 hours a day, sometimes more during the build phase. This is a full-time internship for the two-month window. Most candidates who drop out are juggling something else — VINS expects your full attention.",
    category: "Work, Mentorship & Projects",
    tags: ["hours", "full-time", "workload"],
  },
  {
    question: "Who is my mentor?",
    answer: "You will work with the lab's research and engineering team. The exact mentor depends on the project. The model is fluid — you will get help from a senior researcher one day, a peer the next, and someone else for a different question. That is how real open-source work happens.",
    category: "Work, Mentorship & Projects",
    tags: ["mentor", "project", "research team"],
  },
  {
    question: "Is there a stipend?",
    answer: "No. The internship is unpaid. Stellar performers may be recognised with a discretionary stipend at the lab's option, but this is not promised or expected.",
    category: "Work, Mentorship & Projects",
    tags: ["stipend", "unpaid", "payment"],
  },
  {
    question: "Do I need my own laptop? Should I preload any software?",
    answer: "Yes — a personal laptop is required. We prefer Linux or macOS. If you use Windows, install a terminal that can SSH and run Unix-style commands — WSL is a clean choice. Your mentor will guide you on specific tools once your project is assigned.",
    category: "Work, Mentorship & Projects",
    tags: ["laptop", "software", "Linux", "WSL"],
  },
  {
    question: "I am using a different email on GitHub/Zoom/the learning platform. Is that okay?",
    answer: "No. Your registered email is your sole identifier across all programme platforms. Progress tracking, mentor assignment, and certificate issuance are all tied to it. Mismatches cannot be retroactively corrected — ensure you use your registered email everywhere from day one.",
    category: "Work, Mentorship & Projects",
    tags: ["email", "GitHub", "Zoom", "identifier"],
  },
  {
    question: "Why has my mentor not been assigned yet, or contacted me on day 1?",
    answer: "Mentors are not assigned on day 1. You will be assigned a mentor when you move on to the project phase, which comes later. Before that, you must complete the mandatory coursework of the Bronze phase. Once coursework is complete and you are placed on a project, your mentor will reach out.\n\nWe do not run a Discord server. See the communication channels section for official channels.",
    category: "Work, Mentorship & Projects",
    tags: ["mentor", "assignment", "day 1", "project phase"],
  },

  // ===== Category: Communication Channels =====
  {
    question: "What are the official communication channels?",
    answer: "Official channels only:\n\n1. Announcements section on samagama.in — all programme notifications.\n2. Yaksha chat on samagama.in — primary channel for questions. Use #escalate to reach a human.\n3. Discussion forum — for peer discussions.\n4. Email to sudarshansudarshan@gmail.com — last resort only.\n\nWhatsApp support is cancelled. Unofficial groups (WhatsApp, Telegram, Discord) are strictly prohibited. You may connect with fellow interns over LinkedIn and email.",
    category: "Communication Channels",
    tags: ["channels", "official", "Yaksha", "WhatsApp", "Discord"],
  },

  // ===== Category: Interviews =====
  {
    question: "My interview is not marked as complete on the dashboard — what do I do?",
    answer: "A data-sync issue sometimes occurs where the chat session closes but the interview record doesn't update to 'completed.' The team will check your record and manually mark it as complete within 1–2 hours. If you don't hear from us, write to sudarshansudarshan@gmail.com.",
    category: "Interviews",
    tags: ["interview", "dashboard", "complete", "sync"],
  },

  // ===== Category: Certificate =====
  {
    question: "Does Vicharanashala send a grade report to my university?",
    answer: "No. Vicharanashala does not send formal evaluation or grade reports to universities — that process is between you and your college. The certificate issued upon completion is the document you can submit to your college for credit.",
    category: "Certificate",
    tags: ["grade report", "university", "evaluation"],
  },
  {
    question: "Does the certificate specify online or offline?",
    answer: "The certificate is the same for both tracks. It is issued by Vicharanashala, IIT Ropar, and does not specify whether you completed it online or on campus.",
    category: "Certificate",
    tags: ["certificate", "online", "offline", "mode"],
  },
  {
    question: "Will the certificate be a physical hardcopy or e-certificate?",
    answer: "The completion certificate is issued as an e-certificate — you download it from your dashboard on samagama.in after completing both Bronze and Silver. We do not print and mail physical copies. It is digitally signed and can be verified from our database using the certificate number.",
    category: "Certificate",
    tags: ["certificate", "e-certificate", "download", "digital"],
  },
  {
    question: "Is there a WhatsApp group for candidates?",
    answer: "No. See the official communication channels section for the approved channels.",
    category: "Certificate",
    tags: ["WhatsApp", "group", "communication"],
  },

  // ===== Category: Rosetta Journal =====
  {
    question: "What is Rosetta?",
    answer: "Rosetta is your internship journal — a 65-day document, one entry per day, every day, for the full duration of Summership 2026. You write in it daily, keep it privately, and submit it at the end as one of your completion requirements.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "journal", "daily", "65 days"],
  },
  {
    question: "Why does Rosetta exist? Is it just busywork?",
    answer: "No. For you: it builds articulation of what you learned and where you struggled. For us: it gives qualitative insight into your experience to improve the programme. Students who reflect regularly get more out of it.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "purpose", "reflection", "busywork"],
  },
  {
    question: "What is a thinking routine?",
    answer: "Each day in Rosetta has a thinking routine — a short framework that gives your reflection a specific shape. Examples: 3-2-1 (3 things engaged with, 2 questions, 1 surprise), Muddy/Clear, What? So What? Now What? The routines rotate across 65 days.",
    category: "Rosetta Journal",
    tags: ["thinking routine", "reflection", "prompts"],
  },
  {
    question: "How do I get my Rosetta journal?",
    answer: "Your journal will be shared as a Google Doc template link during orientation. Open the link, make a copy to your own Google Drive, rename it 'Rosetta — [Your Name] — Summership 2026', and that copy is yours for the full 65 days. Do not write in the shared template.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "Google Doc", "template", "orientation"],
  },
  {
    question: "How do I use Rosetta day to day?",
    answer: "Open your Rosetta Google Doc, scroll to today's entry, fill in the date, read the thinking routine, answer the three prompts, close it. Should take 10–20 minutes. It is not an essay — it is a journal.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "daily", "usage", "routine"],
  },
  {
    question: "How long should each Rosetta entry be?",
    answer: "No minimum or maximum word count. Three to five sentences per prompt is usually enough. One-word answers, copy-pasted text, vague non-answers, or AI-generated entries are not acceptable.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "length", "word count", "quality"],
  },
  {
    question: "What is the one rule for Rosetta?",
    answer: "Write what is true. Not what sounds impressive. Not what you think we want to read. If you hated today, write that. We will know immediately if an entry reads like an LLM wrote it. Do not do that.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "honesty", "authenticity", "AI"],
  },
  {
    question: "Can I use ChatGPT or any AI tool to write my Rosetta entries?",
    answer: "No. This is the one firm rule of Rosetta. The journal is a record of your thinking, not what an AI can produce. AI-generated entries will not be counted toward your completion requirement.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "AI", "ChatGPT", "prohibited"],
  },
  {
    question: "What if I miss a day in Rosetta?",
    answer: "Fill it in as soon as you can. Write the actual date you are filling it in, not the missed date. Be honest about why you are writing late. A late honest entry is always better than no entry.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "missed day", "late entry"],
  },
  {
    question: "Will anyone read my Rosetta journal during the internship?",
    answer: "No. We will not access your journal during the 65 days. The only time we read it is after you submit it at the end. We want you to write freely without feeling observed.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "privacy", "reading", "confidential"],
  },
  {
    question: "How do I submit Rosetta at the end?",
    answer: "On or before Day 65, share your Rosetta Google Doc with the programme coordinator's email (shared during wrap-up week). Set sharing to Viewer. Make sure your name is in the title, all 65 entries are filled, and your cover page has your name, product, and team. Rosetta submission is required for your certificate.",
    category: "Rosetta Journal",
    tags: ["Rosetta", "submit", "Day 65", "sharing"],
  },
  {
    question: "My college requires written confirmation that the internship is self-paced. What can I share?",
    answer: "This is not a self-paced internship — it is a very rigorous, time-demanding programme. It is not permitted to be part of any other activity during this period.",
    category: "Rosetta Journal",
    tags: ["self-paced", "college", "confirmation", "rigorous"],
  },

  // ===== Category: Phase 1 Coursework =====
  {
    question: "I've previously interned with VLED — am I exempt from any coursework?",
    answer: "Yes — partially. If you previously completed the MERN Stack coursework, you don't need to repeat it. However, the AI Fundamentals course is new and mandatory for everyone, including returning interns.\n\nTo claim MERN exemption, type #exemption from mern stack course in your Yaksha chat.",
    category: "Phase 1 Coursework",
    tags: ["exemption", "MERN", "returning intern", "coursework"],
  },
  {
    question: "How do I register for the AI Fundamentals course on Vibe?",
    answer: "1. Click the AI Fundamentals registration link in the Announcements section on samagama.in.\n2. You'll be redirected to Vibe sign-in. Create an account using the same Gmail as Samagama.\n3. Log in, then click the registration link again — the second click enrolls you.\n4. Complete the brief registration form. The course will appear on your Vibe dashboard.",
    category: "Phase 1 Coursework",
    tags: ["AI Fundamentals", "Vibe", "registration", "course"],
  },
  {
    question: "I registered on Vibe with a different email than my Samagama email — is that OK?",
    answer: "Please use the same email on both platforms. The exception: Vibe requires Gmail. If your Samagama email is not Gmail, use any Gmail for Vibe and tell Yaksha: #vibe-email your-gmail@gmail.com so we can link the records.",
    category: "Phase 1 Coursework",
    tags: ["Vibe", "email", "Gmail", "Samagama"],
  },
  {
    question: "Are live sessions mandatory if I'm on the viva route?",
    answer: "Yes — live sessions are mandatory for every intern, regardless of path. Whether on coursework, MERN-exempt, or viva-cleared, you must attend every live session.",
    category: "Phase 1 Coursework",
    tags: ["live sessions", "mandatory", "viva", "attendance"],
  },
  {
    question: "Where do I find the daily live-session schedule?",
    answer: "The daily live-session schedule is posted in the Announcements section on samagama.in at least 1 hour before the session begins. That is the only channel for session notifications.",
    category: "Phase 1 Coursework",
    tags: ["schedule", "live session", "Announcements"],
  },
  {
    question: "Can I register and start the Vibe courses before my internship formally starts?",
    answer: "You will receive the Vibe course link only after your internship starts. You can register and start the courses only after your internship formally begins.",
    category: "Phase 1 Coursework",
    tags: ["Vibe", "early start", "course link"],
  },
  {
    question: "What are the attendance and participation rules?",
    answer: "All measured continuously over a rolling 5-working-day window:\n\n1. Live-session attendance — at least 85%\n2. Live participation — at least 85% (polls and quizzes)\n3. Quizzes — attempted and passed (minimum 50%)\n\nIf any one falls below threshold, you will be excused from the current batch and moved to the next batch.",
    category: "Phase 1 Coursework",
    tags: ["attendance", "participation", "quizzes", "85%"],
  },
  {
    question: "What are Spurti Points (SP)?",
    answer: "Spurti Points are a points layer reflecting your overall engagement, currently in early beta. No decision is taken on SP alone. Higher SP may unlock small perks. What actually matters is attendance and participation (see attendance rules). Don't read too much into the exact number.",
    category: "Phase 1 Coursework",
    tags: ["Spurti Points", "engagement", "beta", "perks"],
  },
];

const categories = [
  {
    name: "About the Internship",
    description: "General information about the Vicharanashala Internship (VINS) programme",
    icon: "info",
  },
  {
    name: "Timing and Dates",
    description: "Internship duration, start dates, deadlines, and scheduling",
    icon: "clock",
  },
  {
    name: "NOC",
    description: "No Objection Certificate requirements, formats, and submission",
    icon: "file-text",
  },
  {
    name: "Selection, Offer Letter & Certificate",
    description: "Selection process, offer letter, acceptance, and internship dates",
    icon: "check-circle",
  },
  {
    name: "Work, Mentorship & Projects",
    description: "Project work, mentor assignment, hours, and stipend",
    icon: "briefcase",
  },
  {
    name: "Communication Channels",
    description: "Official communication channels and rules",
    icon: "message-circle",
  },
  {
    name: "Interviews",
    description: "Interview process and dashboard updates",
    icon: "users",
  },
  {
    name: "Certificate",
    description: "Certificate details, grade reports, and e-certificates",
    icon: "award",
  },
  {
    name: "Rosetta Journal",
    description: "Rosetta internship journal — daily reflection and submission",
    icon: "book",
  },
  {
    name: "Phase 1 Coursework",
    description: "Vibe LMS, AI Fundamentals, live sessions, and attendance",
    icon: "graduation-cap",
  },
  {
    name: "OTHERS",
    description: "Miscellaneous queries that don't fit existing categories",
    icon: "more-horizontal",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await FAQ.deleteMany({});
    await Category.deleteMany({});

    const insertedFAQs = await FAQ.insertMany(
      faqs.map((f, i) => ({ ...f, faqNumber: i + 1, views: Math.floor(Math.random() * 500), bookmarks: Math.floor(Math.random() * 50) }))
    );
    console.log(`Inserted ${insertedFAQs.length} FAQs`);

    const insertedCategories = await Category.insertMany(categories);
    console.log(`Inserted ${insertedCategories.length} categories`);

    console.log("\n--- Seed complete! ---");
    console.log("Categories:");
    categories.forEach((c) => console.log(`  - ${c.name}`));
    console.log("\nSample FAQs by category:");
    const grouped = {};
    faqs.forEach((f) => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f.question);
    });
    Object.entries(grouped).forEach(([cat, qs]) => {
      console.log(`\n${cat}:`);
      qs.forEach((q) => console.log(`  - ${q}`));
    });

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
