export const agents = [
  { id:"qcom-chief-of-staff", name:"Q Chief of Staff", role:"Executive Orchestrator", department:"Executive", brand:"Both", manager:"Antonio", status:"active", task:"Running launch-readiness brief", completion:92, quality:97, impact:"Cross-brand" },
  { id:"qcom-asset-ave-gm", name:"Asset Ave General Manager", role:"Brand GM", department:"Asset Ave", brand:"Asset Ave", manager:"Q Chief of Staff", status:"working", task:"Driving first-order conversion plan", completion:81, quality:94, impact:"Revenue" },
  { id:"qcom-dream-blvd-gm", name:"Dream Blvd General Manager", role:"Brand GM", department:"Dream Blvd", brand:"Dream Blvd", manager:"Q Chief of Staff", status:"working", task:"Preparing catalog launch readiness", completion:76, quality:93, impact:"Revenue" },
  { id:"qcom-growth-director", name:"Growth Director", role:"Growth", department:"Growth", brand:"Both", manager:"Q Chief of Staff", status:"working", task:"Prioritizing acquisition experiments", completion:68, quality:91, impact:"Growth" },
  { id:"qcom-marketing-strategist", name:"Marketing Strategist", role:"Marketing", department:"Marketing", brand:"Both", manager:"Growth Director", status:"working", task:"Building launch campaign calendar", completion:72, quality:94, impact:"Marketing" },
  { id:"qcom-copywriter", name:"Conversion Copywriter", role:"Copywriting", department:"Marketing", brand:"Both", manager:"Marketing Strategist", status:"active", task:"Drafting product hooks", completion:88, quality:95, impact:"Conversion" },
  { id:"qcom-social-director", name:"Social Director", role:"Social Media", department:"Social", brand:"Both", manager:"Growth Director", status:"working", task:"Coordinating platform launch calendar", completion:64, quality:92, impact:"Reach" },
  { id:"qcom-shortform-producer", name:"Short-Form Producer", role:"Video Social", department:"Social", brand:"Both", manager:"Social Director", status:"active", task:"Preparing Reels / TikTok scripts", completion:83, quality:93, impact:"Reach" },
  { id:"qcom-pinterest-seo-social", name:"Pinterest & Discovery Agent", role:"Discovery Social", department:"Social", brand:"Both", manager:"Social Director", status:"waiting", task:"Waiting for product shortlist", completion:41, quality:91, impact:"Discovery" },
  { id:"qcom-email-lifecycle", name:"Email Lifecycle Manager", role:"Email Marketing", department:"Lifecycle", brand:"Both", manager:"Growth Director", status:"working", task:"Mapping welcome and cart flows", completion:71, quality:96, impact:"Retention" },
  { id:"qcom-sms-lifecycle", name:"SMS Lifecycle Manager", role:"SMS Marketing", department:"Lifecycle", brand:"Both", manager:"Growth Director", status:"waiting", task:"Consent rules review", completion:45, quality:97, impact:"Retention" },
  { id:"qcom-product-scout", name:"Product Scout", role:"Product Intelligence", department:"Merchandising", brand:"Both", manager:"Brand GMs", status:"working", task:"Scoring launch products", completion:66, quality:92, impact:"Revenue" },
  { id:"qcom-pricing-margin", name:"Pricing & Margin Agent", role:"Pricing", department:"Merchandising", brand:"Both", manager:"AI CFO", status:"active", task:"Checking contribution margins", completion:89, quality:98, impact:"Margin" },
  { id:"qcom-inventory-manager", name:"Inventory Manager", role:"Inventory", department:"Operations", brand:"Both", manager:"Brand GMs", status:"working", task:"Flagging stockout and dead-stock risk", completion:73, quality:96, impact:"Operations" },
  { id:"qcom-supplier-manager", name:"Supplier Manager", role:"Supplier Operations", department:"Operations", brand:"Both", manager:"Brand GMs", status:"active", task:"Reviewing vendor reliability", completion:84, quality:93, impact:"Margin" },
  { id:"qcom-sales-conversion", name:"Sales & Conversion Manager", role:"Conversion", department:"Sales", brand:"Both", manager:"Growth Director", status:"working", task:"Diagnosing zero-order funnel", completion:69, quality:95, impact:"Conversion" },
  { id:"qcom-customer-experience", name:"Customer Experience Lead", role:"Customer Service", department:"Customers", brand:"Both", manager:"Brand GMs", status:"active", task:"Preparing first-order support flows", completion:91, quality:97, impact:"Retention" },
  { id:"qcom-seo-director", name:"SEO Director", role:"SEO", department:"Growth", brand:"Both", manager:"Growth Director", status:"working", task:"Building product keyword map", completion:62, quality:94, impact:"Organic" },
  { id:"qcom-competitive-intel", name:"Competitive Intelligence Agent", role:"Competitive Intelligence", department:"Intelligence", brand:"Both", manager:"Growth Director", status:"active", task:"Tracking competitor promotions", completion:86, quality:91, impact:"Strategy" },
  { id:"qcom-cfo", name:"AI CFO", role:"Finance", department:"Finance", brand:"Both", manager:"Q Chief of Staff", status:"working", task:"Establishing margin and cash baseline", completion:79, quality:98, impact:"Profit" },
  { id:"qcom-data-analyst", name:"Commerce Data Analyst", role:"Analytics", department:"Analytics", brand:"Both", manager:"Q Chief of Staff", status:"working", task:"Establishing baseline KPIs", completion:74, quality:97, impact:"Decision quality" },
  { id:"qcom-automation-engineer", name:"Automation Engineer", role:"Automation", department:"Technology", brand:"Both", manager:"Technology Director", status:"working", task:"Connecting read-only store events", completion:58, quality:95, impact:"Efficiency" },
  { id:"qcom-tech-director", name:"Technology Director", role:"Technology", department:"Technology", brand:"Both", manager:"Q Chief of Staff", status:"active", task:"Reviewing integration health", completion:87, quality:97, impact:"Reliability" },
  { id:"qcom-risk-compliance", name:"Risk & Compliance Agent", role:"Compliance", department:"Governance", brand:"Both", manager:"Q Chief of Staff", status:"active", task:"Reviewing consent and side effects", completion:93, quality:99, impact:"Risk" },
  { id:"qcom-qa-reviewer", name:"QA & Brand Guardian", role:"Quality Assurance", department:"Governance", brand:"Both", manager:"Q Chief of Staff", status:"working", task:"Reviewing outbound campaign drafts", completion:77, quality:99, impact:"Quality" },
  { id:"qcom-agent-performance", name:"Agent Performance Manager", role:"Agent Ops", department:"Agent Operations", brand:"Both", manager:"Q Chief of Staff", status:"active", task:"Scoring worker performance", completion:90, quality:96, impact:"Efficiency" }
];

export const executiveMetrics = [
  { label:"Asset Ave sales · 30d", value:"$0.00", change:"Live Shopify baseline verified" },
  { label:"Asset Ave orders · 30d", value:"0", change:"Conversion launch priority" },
  { label:"Asset Ave catalog", value:"50+", change:"Live products verified; more pages exist" },
  { label:"Dream Blvd published products", value:"0", change:"WooCommerce feed verified" },
  { label:"Agents online", value:"26 / 26", change:"Control registry loaded" },
  { label:"Critical alerts", value:"0", change:"Writes remain approval-gated" }
];

export const activity = [
  { severity:"report", title:"Asset Ave connected", body:"Live Shopify store, catalog, inventory, and analytics access verified. Current 30-day sales baseline is zero orders / zero sales.", time:"live" },
  { severity:"report", title:"Dream Blvd connected", body:"WordPress/WooCommerce connection verified. Current WooCommerce API returns no published products or orders.", time:"live" },
  { severity:"approval", title:"External writes locked", body:"Publishing, customer sends, spend, purchases, price changes, and destructive actions remain owner-gated.", time:"policy" },
  { severity:"report", title:"Launch priority set", body:"Growth, merchandising, conversion, lifecycle, and social agents are prioritized ahead of inventory scaling until first-order traction appears.", time:"strategy" }
];

export const approvals = [];
