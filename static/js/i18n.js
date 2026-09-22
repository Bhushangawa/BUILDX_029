// SENTINEL Multilingual Translation Dictionary (English, Hindi, Marathi)

const TRANSLATIONS = {
  en: {
    brand_title: "SENTINEL",
    brand_subtitle: "NAGPUR CITY SMART SECURITY",
    nav_home: "Overview",
    nav_command: "Command Center",
    nav_citizen: "Citizen Portal",
    nav_volunteer: "Volunteer Hub",
    nav_security: "Security Staff",
    nav_crowd: "Crowd Zones",
    nav_analytics: "Nagpur Analytics",
    nav_cyber: "Cyber SOC & Simulator",
    nav_demo: "Emergency Alert",
    admin_emergency_alert: "Emergency Alert",
    
    hero_badge: "BUILT FOR NAGPUR CITY ONLY",
    hero_title: "AI-Assisted Smart Security & Emergency Coordination Platform",
    hero_subtitle: "One platform. One command center. Faster coordination across Nagpur Citizens, Help Desks, Response Teams, and Control Room.",
    hero_cta_report: "🚨 Emergency Report (Nagpur)",
    hero_cta_command: "Open Command Center",
    hero_cta_demo: "🚨 Emergency Alert",

    kpi_active_incidents: "Active Incidents",
    kpi_critical_alerts: "Critical Alerts",
    kpi_missing_persons: "Missing Persons",
    kpi_crowd_alerts: "Crowd Alerts",
    kpi_active_teams: "Active Teams",
    kpi_resolved_cases: "Resolved Cases",
    kpi_avg_response: "Avg Response Time",

    map_title: "Nagpur Smart Security Live Map",
    map_nagpur_center: "Nagpur Center (Zero Mile)",
    map_legend_critical: "Critical Emergency",
    map_legend_missing: "Missing Person",
    map_legend_crowd: "Crowd Alert",
    map_legend_helpdesk: "Help Desk",
    map_legend_team: "Response Team",

    live_ops_title: "Live Operations & Incident Feed",
    filter_all_categories: "All Categories",
    filter_all_priorities: "All Priorities",
    filter_all_statuses: "All Statuses",
    filter_search_placeholder: "Search Nagpur incidents (e.g. Sitabuldi, Deekshabhoomi)...",

    col_id: "Incident ID",
    col_title: "Title & Details",
    col_location: "Nagpur Location",
    col_priority: "Priority",
    col_status: "Status",
    col_team: "Assigned Team",
    col_actions: "Action",

    sos_title: "URGENT NAGPUR EMERGENCY SOS",
    sos_desc: "1-Click emergency alert broadcast to nearest Nagpur response units and trusted contacts.",
    sos_button: "ACTIVATE SOS NOW",

    safe_journey_title: "Nagpur Safe Journey Mode",
    safe_journey_desc: "Continuous route tracking between Nagpur locations with automated deviation alerts.",
    start_journey_btn: "Start Monitored Journey",
    simulate_deviation_btn: "Simulate Route Deviation",

    quick_report_title: "🚨 Emergency & Incident Report (Nagpur)",
    input_incident_type: "Incident Type",
    input_location: "Nagpur Landmark / Area",
    input_description: "Describe what happened...",
    input_anonymous: "File as Anonymous Citizen (Protects Identity)",
    submit_report_btn: "Submit Emergency Report to Command Center",

    missing_report_title: "Report Missing Person (Child / Elderly)",
    mp_name: "Full Name",
    mp_age: "Age",
    mp_type: "Category (Child / Elderly)",
    mp_clothing: "Clothing & Identifying Marks",
    mp_last_seen: "Last Seen Location in Nagpur",
    submit_mp_btn: "Broadcast Search Mission to Help Desks",

    security_queue_title: "Assigned Incident Queue (Security Staff)",
    btn_acknowledge: "Acknowledge Dispatch",
    btn_in_progress: "Mark In-Progress",
    btn_resolve: "Resolve Incident",

    theme_day: "☀️ Day Vision",
    theme_night: "🌙 Night Vision",
    theme_toggle_title: "Switch Day / Night Vision Mode",

    disclaimer: "SIMULATED DEMO DATA — Built for Nagpur City. Not connected to real live police or emergency lines."
  },

  hi: {
    brand_title: "सेंटिनल (SENTINEL)",
    brand_subtitle: "नागपूर शहर स्मार्ट सुरक्षा प्रणाली",
    nav_home: "अवलोकन",
    nav_command: "कमांड सेंटर",
    nav_citizen: "नागरिक पोर्टल",
    nav_volunteer: "स्वयंसेवक केंद्र",
    nav_security: "सुरक्षा पथक",
    nav_crowd: "गर्दी व्यवस्थापन",
    nav_analytics: "नागपूर विश्लेषण",
    nav_cyber: "सायबर सुरक्षा कक्ष (SOC)",
    nav_demo: "आणीबाणी अलर्ट",
    admin_emergency_alert: "आणीबाणी अलर्ट",

    hero_badge: "केवळ नागपूर शहरासाठी समर्पित",
    hero_title: "एआय-सक्षम स्मार्ट सुरक्षा आणि आणीबाणी समन्वय मंच",
    hero_subtitle: "एक व्यासपीठ. एक नियंत्रण कक्ष. नागपूरचे नागरिक, मदत डेस्क, सुरक्षा पथके आणि नियंत्रण कक्ष यांच्यात जलद समन्वय.",
    hero_cta_report: "🚨 आणीबाणी तक्रार नोंदणी (Emergency Report)",
    hero_cta_command: "कमांड सेंटर उघडा",
    hero_cta_demo: "🚨 आणीबाणी अलर्ट (Emergency Alert)",

    kpi_active_incidents: "सक्रिय घटना",
    kpi_critical_alerts: "गंभीर सूचना",
    kpi_missing_persons: "हरवलेल्या व्यक्ती",
    kpi_crowd_alerts: "गर्दी अलर्ट",
    kpi_active_teams: "सक्रिय सुरक्षा पथके",
    kpi_resolved_cases: "सोडवलेली प्रकरणे",
    kpi_avg_response: "सरासरी प्रतिसाद वेळ",

    map_title: "नागपूर स्मार्ट सुरक्षा थेट नकाशा",
    map_nagpur_center: "नागपूर केंद्र (झिरो माईल)",
    map_legend_critical: "गंभीर आणीबाणी",
    map_legend_missing: "हरवलेली व्यक्ती",
    map_legend_crowd: "गर्दी इशारा",
    map_legend_helpdesk: "मदत केंद्र",
    map_legend_team: "प्रतिसाद पथक",

    live_ops_title: "थेट ऑपरेशन्स आणि घटनांची यादी",
    filter_all_categories: "सर्व वर्गवारी",
    filter_all_priorities: "सर्व प्राथमिकता",
    filter_all_statuses: "सर्व स्थिती",
    filter_search_placeholder: "नागपूर घटना शोधा (उदा. सीताबर्डी, दीक्षाभूमी)...",

    col_id: "घटना आयडी",
    col_title: "शीर्षक आणि तपशील",
    col_location: "नागपूर ठिकाण",
    col_priority: "प्राधान्य",
    col_status: "स्थिती",
    col_team: "नियुक्त पथक",
    col_actions: "कृती",

    sos_title: "तातडीची नागपूर आणीबाणी (SOS)",
    sos_desc: "जवळच्या नागपूर सुरक्षा पथकांना आणि कुटुंबियांना १-क्लिकमध्ये तत्काळ इशारा पाठवा.",
    sos_button: "आत्ताच SOS सक्रिय करा",

    safe_journey_title: "नागपूर सुरक्षित प्रवास मोड",
    safe_journey_desc: "नागपूरच्या मार्गांवर थेट ट्रॅकिंग आणि मार्ग बदलल्यास आपोआप सुरक्षा इशारा.",
    start_journey_btn: "सुरक्षित प्रवास सुरू करा",
    simulate_deviation_btn: "मार्ग विचलनाची चाचणी घ्या",

    quick_report_title: "🚨 आणीबाणी व घटना तक्रार (नागपूर)",
    input_incident_type: "घटनेचा प्रकार",
    input_location: "नागपूर परिसराचे नाव / लँडमार्क",
    input_description: "काय घडले ते सविस्तर लिहा...",
    input_anonymous: "अनामिक नागरिक म्हणून तक्रार करा (गोपनीयता सुरक्षित)",
    submit_report_btn: "कमांड सेंटरला आणीबाणी तक्रार पाठवा",

    missing_report_title: "हरवलेल्या व्यक्तीची नोंद (मुलगा / वृद्ध)",
    mp_name: "पूर्ण नाव",
    mp_age: "वय",
    mp_type: "प्रवर्ग (मुलगा / वृद्ध)",
    mp_clothing: "कपडे आणि ओळख खूण",
    mp_last_seen: "शेवटचे पाहिलेले नागपुरातील ठिकाण",
    submit_mp_btn: "मदत केंद्रांना शोध मोहीम पाठवा",

    security_queue_title: "नियुक्त घटनांची रांग (सुरक्षा कर्मचारी)",
    btn_acknowledge: "स्वीकृती द्या (Acknowledge)",
    btn_in_progress: "प्रतिसाद सुरू करा (In Progress)",
    btn_resolve: "प्रकरण निकाली काढा (Resolve)",

    theme_day: "☀️ दिन दृष्टी",
    theme_night: "🌙 रात्री दृष्टी",
    theme_toggle_title: "दिवस / रात्री दृष्टी बदला (Day/Night Vision)",

    disclaimer: "प्रात्यक्षिक डेमो डेटा — नागपूर शहरासाठी डिझाइन केलेले. थेट शासकीय पोलिसांशी जोडलेले नाही."
  },

  mr: {
    brand_title: "सेंटिनेल (SENTINEL)",
    brand_subtitle: "नागपूर शहर स्मार्ट सुरक्षा समन्वय",
    nav_home: "मुख्य पान",
    nav_command: "कमांड सेंटर",
    nav_citizen: "नागरिक सेवा",
    nav_volunteer: "स्वयंसेवक व्यासपीठ",
    nav_security: "सुरक्षा दल",
    nav_crowd: "गर्दी नियंत्रण",
    nav_analytics: "नागपूर विश्लेषण",
    nav_cyber: "सायबर सुरक्षा केंद्र (SOC)",
    nav_demo: "आपत्कालीन अलर्ट",
    admin_emergency_alert: "आपत्कालीन अलर्ट",

    hero_badge: "केवळ नागपूर शहरासाठी समर्पित",
    hero_title: "एआय-सक्षम नागपूर स्मार्ट सुरक्षा आणि आपत्कालीन समन्वय प्रणाली",
    hero_subtitle: "एकच नियंत्रण कक्ष. जलद सुरक्षा समन्वय. नागपूरचे नागरिक, मदत कक्ष, स्वयंसेवक आणि पोलीस पथके एकत्र.",
    hero_cta_report: "🚨 आपत्कालीन तक्रार नोंदवा (Emergency Report)",
    hero_cta_command: "कमांड सेंटर पहा",
    hero_cta_demo: "🚨 आपत्कालीन अलर्ट (Emergency Alert)",

    kpi_active_incidents: "सक्रिय घटना",
    kpi_critical_alerts: "तातडीचे इशारे",
    kpi_missing_persons: "हरवलेल्या व्यक्ती",
    kpi_crowd_alerts: "गर्दी इशारे",
    kpi_active_teams: "कार्यरत पथके",
    kpi_resolved_cases: "निकाली प्रकरणे",
    kpi_avg_response: "सरासरी प्रतिसाद वेळ",

    map_title: "नागपूर स्मार्ट सुरक्षा थेट नकाशा",
    map_nagpur_center: "नागपूर केंद्र (झिरो माईल स्टोन)",
    map_legend_critical: "गंभीर आणीबाणी",
    map_legend_missing: "हरवलेली व्यक्ती",
    map_legend_crowd: "गर्दीचा धोका",
    map_legend_helpdesk: "मदत कक्ष",
    map_legend_team: "प्रतिसाद पथक",

    live_ops_title: "थेट कारवाई आणि तक्रारींची यादी",
    filter_all_categories: "सर्व प्रकार",
    filter_all_priorities: "सर्व प्राधान्यता",
    filter_all_statuses: "सर्व स्थिती",
    filter_search_placeholder: "नागपूर घटना शोधा (उदा. सीताबर्डी, दीक्षाभूमी, फुटाळा)...",

    col_id: "घटना क्र.",
    col_title: "तपशील",
    col_location: "नागपूर ठिकाण",
    col_priority: "प्राधान्य",
    col_status: "स्थिती",
    col_team: "नियुक्त पथक",
    col_actions: "कृती",

    sos_title: "नागपूर तातडीची आपत्कालीन मदत (SOS)",
    sos_desc: "एका क्लिकवर जवळच्या नागपूर सुरक्षा दलांना आणि नातेवाईकांना तात्काळ संपर्क.",
    sos_button: "तातडीने SOS दाबा",

    safe_journey_title: "नागपूर सुरक्षित प्रवास योजना",
    safe_journey_desc: "नागपूर अंतर्गत प्रवासाचे थेट मॉनिटरिंग आणि मार्ग बदलल्यास तात्काळ सुरक्षा खात्री.",
    start_journey_btn: "प्रवास सुरू करा",
    simulate_deviation_btn: "मार्ग विचलन चाचणी",

    quick_report_title: "🚨 आपत्कालीन व त्वरित घटना नोंदणी (नागपूर)",
    input_incident_type: "घटनेचा प्रकार",
    input_location: "नागपूर परिसराचे नाव",
    input_description: "सविस्तर माहिती लिहा...",
    input_anonymous: "नाव गुप्त ठेवा (गोपनीयता नियम)",
    submit_report_btn: "कंट्रोल रूमकडे आपत्कालीन तक्रार नोंदवा",

    missing_report_title: "हरवलेल्या व्यक्तीची तक्रार (मुलगा / ज्येष्ठ नागरिक)",
    mp_name: "पूर्ण नाव",
    mp_age: "वय",
    mp_type: "प्रकार (मुलगा / ज्येष्ठ नागरिक)",
    mp_clothing: "कपडे व अंगावरील खुणा",
    mp_last_seen: "नागपुरातील शेवटचे पाहिलेले ठिकाण",
    submit_mp_btn: "शोध मोहीम सुरू करा",

    security_queue_title: "आपल्याकडे सोपवलेली प्रकरणे (सुरक्षा कर्मचारी)",
    btn_acknowledge: "स्वीकृती दिली (Acknowledge)",
    btn_in_progress: "घटनास्थळी पोहोचलो (In Progress)",
    btn_resolve: "प्रकरण सोडवले (Resolve)",

    theme_day: "☀️ दिवस दृष्टी",
    theme_night: "🌙 रात्र दृष्टी",
    theme_toggle_title: "दिवस / रात्र दृष्टी बदला (Day/Night Vision)",

    disclaimer: "डेमो डेटा — केवळ नागपूर शहरासाठी. प्रत्यक्ष शासकीय पोलिसांशी जोडलेले नाही."
  }
};

let currentLang = "en";

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem("sentinel_lang", lang);

  // Update all DOM elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (TRANSLATIONS[lang][key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = TRANSLATIONS[lang][key];
      } else {
        el.innerText = TRANSLATIONS[lang][key];
      }
    }
  });

  // Update language selector dropdown value if present
  const select = document.getElementById("langSelect");
  if (select) select.value = lang;

  if (typeof window.updateThemeUI === "function") {
    window.updateThemeUI();
  }
}

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS.en[key] || key;
}

// Auto initialize language
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("sentinel_lang") || "en";
  setLanguage(saved);
});
