// Reference data modelled on real MPLADS/eSAKSHI structure (state -> districts
// with district codes, standard Implementing Agencies, and typical work
// categories sanctioned under the scheme).

export const STATES = [
  {
    name: "Delhi",
    code: "DL",
    districts: [
      { name: "New Delhi", code: "11001", pincode: "110001" },
      { name: "South Delhi", code: "11002", pincode: "110017" },
      { name: "East Delhi", code: "11003", pincode: "110032" },
      { name: "North Delhi", code: "11004", pincode: "110007" },
    ],
  },
  {
    name: "Maharashtra",
    code: "MH",
    districts: [
      { name: "Mumbai City", code: "27001", pincode: "400001" },
      { name: "Pune", code: "27002", pincode: "411001" },
      { name: "Nagpur", code: "27003", pincode: "440001" },
      { name: "Nashik", code: "27004", pincode: "422001" },
    ],
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    districts: [
      { name: "Lucknow", code: "09001", pincode: "226001" },
      { name: "Varanasi", code: "09002", pincode: "221001" },
      { name: "Kanpur Nagar", code: "09003", pincode: "208001" },
      { name: "Prayagraj", code: "09004", pincode: "211001" },
      { name: "Agra", code: "09005", pincode: "282001" },
    ],
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    districts: [
      { name: "Chennai", code: "33001", pincode: "600001" },
      { name: "Coimbatore", code: "33002", pincode: "641001" },
      { name: "Madurai", code: "33003", pincode: "625001" },
      { name: "Salem", code: "33004", pincode: "636001" },
    ],
  },
  {
    name: "Karnataka",
    code: "KA",
    districts: [
      { name: "Bengaluru Urban", code: "29001", pincode: "560001" },
      { name: "Mysuru", code: "29002", pincode: "570001" },
      { name: "Belagavi", code: "29003", pincode: "590001" },
      { name: "Hubballi-Dharwad", code: "29004", pincode: "580001" },
    ],
  },
  {
    name: "West Bengal",
    code: "WB",
    districts: [
      { name: "Kolkata", code: "19001", pincode: "700001" },
      { name: "Howrah", code: "19002", pincode: "711101" },
      { name: "Darjeeling", code: "19003", pincode: "734101" },
      { name: "Malda", code: "19004", pincode: "732101" },
    ],
  },
  {
    name: "Rajasthan",
    code: "RJ",
    districts: [
      { name: "Jaipur", code: "08001", pincode: "302001" },
      { name: "Jodhpur", code: "08002", pincode: "342001" },
      { name: "Udaipur", code: "08003", pincode: "313001" },
      { name: "Kota", code: "08004", pincode: "324001" },
    ],
  },
  {
    name: "Bihar",
    code: "BR",
    districts: [
      { name: "Patna", code: "10001", pincode: "800001" },
      { name: "Gaya", code: "10002", pincode: "823001" },
      { name: "Muzaffarpur", code: "10003", pincode: "842001" },
      { name: "Bhagalpur", code: "10004", pincode: "812001" },
    ],
  },
  {
    name: "Gujarat",
    code: "GJ",
    districts: [
      { name: "Ahmedabad", code: "24001", pincode: "380001" },
      { name: "Surat", code: "24002", pincode: "395001" },
      { name: "Vadodara", code: "24003", pincode: "390001" },
      { name: "Rajkot", code: "24004", pincode: "360001" },
    ],
  },
  {
    name: "Kerala",
    code: "KL",
    districts: [
      { name: "Thiruvananthapuram", code: "32001", pincode: "695001" },
      { name: "Ernakulam", code: "32002", pincode: "682001" },
      { name: "Kozhikode", code: "32003", pincode: "673001" },
      { name: "Thrissur", code: "32004", pincode: "680001" },
    ],
  },
  {
    name: "Punjab",
    code: "PB",
    districts: [
      { name: "Amritsar", code: "03001", pincode: "143001" },
      { name: "Ludhiana", code: "03002", pincode: "141001" },
      { name: "Jalandhar", code: "03003", pincode: "144001" },
    ],
  },
  {
    name: "Madhya Pradesh",
    code: "MP",
    districts: [
      { name: "Bhopal", code: "23001", pincode: "462001" },
      { name: "Indore", code: "23002", pincode: "452001" },
      { name: "Gwalior", code: "23003", pincode: "474001" },
      { name: "Jabalpur", code: "23004", pincode: "482001" },
    ],
  },
  {
    name: "Assam",
    code: "AS",
    districts: [
      { name: "Kamrup Metropolitan", code: "18001", pincode: "781001" },
      { name: "Dibrugarh", code: "18002", pincode: "786001" },
      { name: "Silchar", code: "18003", pincode: "788001" },
    ],
  },
  {
    name: "Odisha",
    code: "OD",
    districts: [
      { name: "Khordha", code: "21001", pincode: "751001" },
      { name: "Cuttack", code: "21002", pincode: "753001" },
      { name: "Ganjam", code: "21003", pincode: "760001" },
    ],
  },
  {
    name: "Telangana",
    code: "TG",
    districts: [
      { name: "Hyderabad", code: "36001", pincode: "500001" },
      { name: "Warangal", code: "36002", pincode: "506001" },
      { name: "Nizamabad", code: "36003", pincode: "503001" },
    ],
  },
];

export const IMPLEMENTING_AGENCIES = [
  "PWD (Public Works Dept.)",
  "PHED (Public Health Engineering Dept.)",
  "Education Department",
  "MP Rural Development Dept.",
  "Health & Family Welfare Dept.",
  "Water Resources Department",
  "Urban Local Body",
  "Electricity Board",
  "Forest & Environment Dept.",
  "Sports Authority",
];

export const WORK_CATEGORIES = [
  { label: "Construction of Community Hall", sector: "Community Infrastructure" },
  { label: "Renovation of Government School Building", sector: "Education" },
  { label: "Drinking Water Supply Facility", sector: "Drinking Water" },
  { label: "Village Internal Road Construction", sector: "Rural Infrastructure" },
  { label: "Smart Classroom Setup", sector: "Education" },
  { label: "Solar Street Light Installation", sector: "Energy" },
  { label: "Primary Health Sub-Centre Upgrade", sector: "Health" },
  { label: "Construction of Public Library", sector: "Education" },
  { label: "Anganwadi Centre Building", sector: "Women & Child Welfare" },
  { label: "Sports Ground Development", sector: "Sports" },
  { label: "Check Dam / Water Conservation Structure", sector: "Irrigation" },
  { label: "Crematorium / Community Cemetery Development", sector: "Civic Amenity" },
  { label: "Public Toilet Complex (Swachh Bharat)", sector: "Sanitation" },
  { label: "Bus Shelter Construction", sector: "Transport" },
  { label: "Skill Development Centre", sector: "Skill Development" },
  { label: "Foot Over Bridge / Pedestrian Bridge", sector: "Rural Infrastructure" },
  { label: "River Ghat Development", sector: "Community Infrastructure" },
  { label: "Old Age Home Renovation", sector: "Social Welfare" },
];

export const ANOMALY_TYPES = [
  {
    key: "financial",
    label: "Financial Anomalies",
    sample: [
      "Bill amount unusual for the work type",
      "Expenditure exceeds physical progress",
      "Multiple payments to same vendor in short span",
      "Sanctioned amount deviates from district cost norms",
    ],
  },
  {
    key: "delay",
    label: "Time Delays",
    sample: [
      "Delay in project milestones",
      "No progress update in over 90 days",
      "Completion date passed without closure report",
    ],
  },
  {
    key: "resource",
    label: "Resource Utilization",
    sample: [
      "Utilization certificate pending beyond due date",
      "Material procurement cost above regional average",
      "Idle fund balance beyond permissible period",
    ],
  },
  {
    key: "geo",
    label: "Geo-tag Issues",
    sample: [
      "Geo-tag location mismatch with sanctioned site",
      "Geo-tagged photograph missing for completed stage",
      "Site coordinates fall outside constituency boundary",
    ],
  },
  {
    key: "document",
    label: "Document Mismatch",
    sample: [
      "Measurement book entries inconsistent with bills",
      "Photo evidence does not match work description",
      "Duplicate document hash detected across projects",
    ],
  },
];

export const PROJECT_STATUSES = [
  "Recommended",
  "Sanctioned",
  "Work in Progress",
  "Completed",
  "Delayed",
];

export const COMPLAINT_CATEGORIES = [
  "Substandard quality of work",
  "Work not started despite sanction",
  "Fund misutilization suspected",
  "Project location mismatch",
  "Work abandoned midway",
  "Other",
];
