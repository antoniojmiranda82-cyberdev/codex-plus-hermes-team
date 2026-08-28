import { agents, executiveMetrics, activity, approvals } from "./data.js";

const navItems = [
  ["executive", "Executive"],
  ["companies", "Companies"],
  ["agents", "Agent floor"],
  ["tasks", "Task board"],
  ["approvals", "Approvals"],
  ["marketing", "Marketing & social"],
  ["products", "Products & inventory"],
  ["customers", "Customers"],
  ["finance", "Finance"],
  ["analytics", "Analytics"],
  ["health", "System health"]
];

const nav = document.querySelector("#nav");
const content = document.querySelector("#content");
const title = document.querySelector("#screen-title");
const agentDialog = document.querySelector("#agent-dialog");
const agentDetail = document.querySelector("#agent-detail");
const stopDialog = document.querySelector("#stop-dialog");
let activeScreen = "executive";
let writesPaused = false;

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const initials = (name) => name.split(" ").map(part => part[0]).slice(0,2).join("");
const statusLabel = (status) => status[0].toUpperCase() + status.slice(1);

function renderNav() {
  nav.innerHTML = navItems.map(([id, label]) => `
    <button data-screen="${id}" class="${activeScreen === id ? "active" : ""}">${label}</button>
  `).join("");
  nav.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      activeScreen = button.dataset.screen;
      renderNav();
      renderScreen();
    });
  });
}

function agentNode(agent) {
  return `<div class="agent-node" data-agent="${agent.id}">
    <div class="node-top"><span class="status-dot status-${agent.status}"></span><strong>${escapeHtml(agent.name)}</strong></div>
    <small>${escapeHtml(agent.task)}</small>
  </div>`;
}

function metricsStrip() {
  return `<div class="metric-strip">${executiveMetrics.map(metric => `
    <div class="metric"><span>${metric.label}</span><strong>${metric.value}</strong><small>${escapeHtml(metric.change)}</small></div>
  `).join("")}</div>`;
}

function agentTable(rows = agents) {
  return `<div class="panel"><table class="agent-table">
    <thead><tr><th>Worker</th><th>Department</th><th>Status</th><th>Current task</th><th>Completion</th><th>Quality</th></tr></thead>
    <tbody>${rows.map(agent => `<tr data-agent="${agent.id}">
      <td><div class="agent-name"><span class="status-dot status-${agent.status}"></span><strong>${escapeHtml(agent.name)}</strong></div></td>
      <td>${escapeHtml(agent.department)}</td>
      <td><span class="status-text">${statusLabel(agent.status)}</span></td>
      <td>${escapeHtml(agent.task)}</td>
      <td><div class="progress"><i style="width:${agent.completion}%"></i></div></td>
      <td>${agent.quality}%</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function renderExecutive() {
  const chief = agents.find(agent => agent.id === "qcom-chief-of-staff");
  const gms = agents.filter(agent => ["qcom-asset-ave-gm", "qcom-dream-blvd-gm"].includes(agent.id));
  const departmentHeads = agents.filter(agent => [
    "qcom-growth-director","qcom-cfo","qcom-tech-director","qcom-data-analyst",
    "qcom-risk-compliance","qcom-qa-reviewer","qcom-agent-performance","qcom-product-scout"
  ].includes(agent.id));

  content.innerHTML = `
    ${metricsStrip()}
    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel-head"><h2>Live organization</h2><span>${agents.length} registered workers</span></div>
        <div class="command-map">
          <div class="executive-node">${agentNode(chief)}</div>
          <div class="gm-row">${gms.map(agentNode).join("")}</div>
          <div class="department-grid">${departmentHeads.map(agentNode).join("")}</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Owner queue</h2><span>${activity.length} live items</span></div>
        <div class="queue">${activity.map(item => `
          <div class="queue-item">
            <span class="severity severity-${item.severity}"></span>
            <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></div>
            <time>${escapeHtml(item.time)}</time>
          </div>
        `).join("")}</div>
      </div>
    </div>
    <div class="section-title"><div><h2>Workforce pulse</h2><p>Every worker is inspectable. Live APIs replace seed state when connected.</p></div><p>${writesPaused ? "External writes paused" : "External writes approval-gated"}</p></div>
    ${agentTable(agents.slice(0,10))}
  `;
  bindAgentClicks();
}

function renderCompanies() {
  content.innerHTML = `
    <div class="screen-grid">
      ${brandCard("Asset Ave", "Shopify", "qcom-asset-ave-gm", "Store adapter shell ready; write access disabled until scopes are approved.")}
      ${brandCard("Dream Blvd", "WordPress / WooCommerce", "qcom-dream-blvd-gm", "Store adapter shell ready; write access disabled until scopes are approved.")}
      <div class="info-card"><h3>Shared command layer</h3><p>Growth, finance, analytics, QA, compliance, automation, model routing, and owner approvals are shared across both brands.</p><div class="big">1 control plane</div></div>
    </div>
    <div class="section-title"><div><h2>Brand leadership</h2><p>Each GM owns store performance and reports through the Chief of Staff.</p></div></div>
    ${agentTable(agents.filter(agent => agent.brand !== "Both" || agent.id === "qcom-chief-of-staff"))}
  `;
  bindAgentClicks();
}

function brandCard(name, platform, gmId, copy) {
  const gm = agents.find(agent => agent.id === gmId);
  return `<div class="info-card"><h3>${name}</h3><p>${platform}</p><p>${copy}</p><div class="big">${gm?.completion ?? 0}% GM pulse</div></div>`;
}

function renderAgents() {
  const departments = [...new Set(agents.map(agent => agent.department))].length;
  content.innerHTML = `
    <div class="screen-grid">
      <div class="info-card"><h3>Registered workers</h3><p>Persistent identities with roles, managers, task state, and quality metrics.</p><div class="big">${agents.length}</div></div>
      <div class="info-card"><h3>Departments</h3><p>Executive, growth, marketing, social, lifecycle, merchandising, operations, finance, analytics, technology, and governance.</p><div class="big">${departments}</div></div>
      <div class="info-card"><h3>Blocked workers</h3><p>Workers requiring intervention should surface here and escalate according to severity.</p><div class="big">${agents.filter(a => a.status === "blocked").length}</div></div>
    </div>
    <div class="section-title"><div><h2>All workers</h2><p>Click a worker to inspect assignment, manager, quality, and scope.</p></div></div>
    ${agentTable()}
  `;
  bindAgentClicks();
}

function renderTaskBoard() {
  const columns = ["backlog","assigned","working","waiting","review","approval","completed","failed"];
  const sample = agents.slice(0,16).map((agent, index) => ({
    id:`task-${index+1}`, agent, status: columns[(index + 2) % columns.length], title:agent.task
  }));
  content.innerHTML = `<div class="section-title"><div><h2>Durable task board</h2><p>Tasks survive model changes and context exhaustion through checkpointed state.</p></div></div>
  <div style="display:grid;grid-template-columns:repeat(4,minmax(230px,1fr));gap:12px;overflow-x:auto;padding-bottom:8px">
    ${columns.map(column => `<div class="panel" style="min-height:260px"><div class="panel-head"><h2>${column.toUpperCase()}</h2><span>${sample.filter(t => t.status === column).length}</span></div><div class="queue">${sample.filter(t => t.status === column).map(t => `<div class="queue-item" data-agent="${t.agent.id}"><span class="severity severity-report"></span><div><strong>${escapeHtml(t.title)}</strong><p>${escapeHtml(t.agent.name)}</p></div></div>`).join("") || `<div style="padding:20px;color:var(--muted);font-size:11px">No tasks</div>`}</div></div>`).join("")}
  </div>`;
  bindAgentClicks();
}

function renderApprovals() {
  content.innerHTML = `<div class="screen-grid">
    <div class="info-card"><h3>Pending approvals</h3><p>External high-impact actions stop here before execution.</p><div class="big">${approvals.length}</div></div>
    <div class="info-card"><h3>Default policy</h3><p>Publishing, customer sends, purchases, paid spend, price changes, production deploys, destructive actions, and unusual refunds are owner-gated.</p><div class="big">Supervised</div></div>
    <div class="info-card"><h3>Write state</h3><p>Emergency stop can pause all write-class actions while read-only monitoring remains available.</p><div class="big">${writesPaused ? "Paused" : "Gated"}</div></div>
  </div>
  <div class="section-title"><div><h2>Approval queue</h2><p>Every request includes upside, downside, cost, rollback, requesting worker, and an idempotency key where needed.</p></div></div>
  <div class="panel"><div style="padding:28px;color:var(--muted);font-size:12px">${approvals.length ? "Approval items loaded." : "No pending owner approvals."}</div></div>`;
}

function renderFunctionalArea(area) {
  const map = {
    marketing: ["Marketing & social", ["qcom-marketing-strategist","qcom-copywriter","qcom-social-director","qcom-shortform-producer","qcom-pinterest-seo-social","qcom-email-lifecycle","qcom-sms-lifecycle"], "Campaign strategy, creative, social formats, email, SMS, lifecycle flows, and QA-ready outbound drafts."],
    products: ["Products & inventory", ["qcom-product-scout","qcom-pricing-margin","qcom-inventory-manager","qcom-supplier-manager"], "Product discovery, opportunity scoring, margin, pricing, replenishment, dead stock, and supplier risk."],
    customers: ["Customers", ["qcom-customer-experience","qcom-sales-conversion","qcom-email-lifecycle","qcom-sms-lifecycle"], "Customer support, sentiment, conversion recovery, retention, reviews, and lifecycle engagement."],
    finance: ["Finance", ["qcom-cfo","qcom-pricing-margin","qcom-data-analyst"], "Revenue, COGS, fees, refunds, marketing spend, contribution margin, cash view, and variance analysis."],
    analytics: ["Analytics", ["qcom-data-analyst","qcom-agent-performance","qcom-competitive-intel"], "KPI movement, funnel analysis, attribution confidence, competitor signals, and agent performance."],
    health: ["System health", ["qcom-tech-director","qcom-automation-engineer","qcom-risk-compliance","qcom-qa-reviewer"], "Integration health, workflow reliability, kill switches, policy enforcement, QA, and recovery controls."]
  };
  const [heading, ids, copy] = map[area];
  const rows = ids.map(id => agents.find(agent => agent.id === id)).filter(Boolean);
  content.innerHTML = `<div class="screen-grid">
    <div class="info-card"><h3>${heading}</h3><p>${copy}</p><div class="big">${rows.length} core workers</div></div>
    <div class="info-card"><h3>Operating mode</h3><p>Analysis and drafting can run automatically. External side effects require policy checks and owner approval unless a bounded standing rule exists.</p><div class="big">Supervised</div></div>
    <div class="info-card"><h3>Continuity</h3><p>OmniRouter can switch model providers while durable tasks preserve progress, evidence, and next actions.</p><div class="big">Portable</div></div>
  </div>
  <div class="section-title"><div><h2>${heading} workforce</h2><p>${copy}</p></div></div>
  ${agentTable(rows)}`;
  bindAgentClicks();
}

function renderScreen() {
  const labels = Object.fromEntries(navItems);
  title.textContent = labels[activeScreen] ?? "Q Commerce Command";
  if (activeScreen === "executive") renderExecutive();
  else if (activeScreen === "companies") renderCompanies();
  else if (activeScreen === "agents") renderAgents();
  else if (activeScreen === "tasks") renderTaskBoard();
  else if (activeScreen === "approvals") renderApprovals();
  else renderFunctionalArea(activeScreen);
}

function bindAgentClicks() {
  document.querySelectorAll("[data-agent]").forEach(element => {
    element.addEventListener("click", () => openAgent(element.dataset.agent));
  });
}

function openAgent(id) {
  const agent = agents.find(agent => agent.id === id);
  if (!agent) return;
  agentDetail.innerHTML = `
    <div class="agent-detail-head">
      <div class="agent-avatar">${initials(agent.name)}</div>
      <div><h2>${escapeHtml(agent.name)}</h2><p>${escapeHtml(agent.role)} · ${escapeHtml(agent.department)}</p></div>
    </div>
    <div class="detail-grid">
      <div class="detail-cell"><span>Status</span><strong>${statusLabel(agent.status)}</strong></div>
      <div class="detail-cell"><span>Manager</span><strong>${escapeHtml(agent.manager)}</strong></div>
      <div class="detail-cell"><span>Brand scope</span><strong>${escapeHtml(agent.brand)}</strong></div>
      <div class="detail-cell"><span>Business impact</span><strong>${escapeHtml(agent.impact)}</strong></div>
      <div class="detail-cell"><span>Current task</span><strong>${escapeHtml(agent.task)}</strong></div>
      <div class="detail-cell"><span>Task completion</span><strong>${agent.completion}%</strong></div>
      <div class="detail-cell"><span>Quality score</span><strong>${agent.quality}%</strong></div>
      <div class="detail-cell"><span>Worker ID</span><strong>${escapeHtml(agent.id)}</strong></div>
    </div>`;
  agentDialog.showModal();
}

document.querySelector("#close-agent").addEventListener("click", () => agentDialog.close());
document.querySelector("#emergency-stop").addEventListener("click", () => stopDialog.showModal());
document.querySelector("#cancel-stop").addEventListener("click", () => stopDialog.close());
document.querySelector("#confirm-stop").addEventListener("click", () => {
  writesPaused = true;
  stopDialog.close();
  document.querySelector("#emergency-stop").textContent = "Writes paused";
  renderScreen();
});

renderNav();
renderScreen();
