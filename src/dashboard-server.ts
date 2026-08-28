#!/usr/bin/env node

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { JsonFileTaskStore, MockAgentExecutor, OperatorService, type BusinessId } from "./operator.js";
import { buildDashboardSnapshot, type DashboardAgent } from "./dashboard.js";
import { OpenAICompatibleExecutor } from "./providers/openai-compatible.js";

const roster: DashboardAgent[] = [
  { profile: "team-architect", displayName: "Architect", role: "Architecture" },
  { profile: "team-asset-commerce", displayName: "Asset Commerce", role: "Asset Ave Commerce" },
  { profile: "team-dream-commerce", displayName: "Dream Commerce", role: "Dream Blvd Commerce" },
  { profile: "team-growth", displayName: "Growth", role: "Growth + Campaigns" },
  { profile: "team-analytics", displayName: "Analytics", role: "Analytics + Funnels" },
  { profile: "team-ops", displayName: "Operations", role: "Operations + Reporting" },
  { profile: "team-qa", displayName: "QA Watchdog", role: "QA + Safety" }
];

function buildExecutor() {
  const baseUrl = process.env.AGENT_GATEWAY_BASE_URL;
  const apiKey = process.env.AGENT_GATEWAY_API_KEY;
  const model = process.env.AGENT_GATEWAY_MODEL;
  if (baseUrl && apiKey && model) return new OpenAICompatibleExecutor({ baseUrl, apiKey, model });
  return new MockAgentExecutor();
}

const storePath = process.env.OPERATOR_TASK_STORE ?? ".operator/tasks.json";
const operator = new OperatorService(new JsonFileTaskStore(storePath), buildExecutor());
const port = Number(process.env.OPERATOR_DASHBOARD_PORT ?? 4177);

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Asset + Dream operator dashboard: http://127.0.0.1:${port}`);
});

async function route(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);

  if (req.method === "GET" && url.pathname === "/") {
    html(res, dashboardHtml());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/snapshot") {
    json(res, 200, { snapshot: buildDashboardSnapshot(operator, roster), tasks: operator.listTasks() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/tasks") {
    const body = await readJson(req);
    const task = operator.createTask({
      business: asBusiness(body.business),
      title: asString(body.title, "title"),
      prompt: asString(body.prompt, "prompt"),
      agentProfile: asString(body.agentProfile, "agentProfile"),
      approvalRequirement: body.approvalRequirement === "external_side_effect" ? "external_side_effect" : "none"
    });
    json(res, 201, task);
    return;
  }

  const match = url.pathname.match(/^\/api\/tasks\/([^/]+)\/(approve|run|retry)$/);
  if (req.method === "POST" && match) {
    const id = decodeURIComponent(match[1] ?? "");
    const action = match[2];
    if (action === "approve") return json(res, 200, operator.approveTask(id));
    if (action === "run") return json(res, 200, await operator.runTask(id));
    if (action === "retry") return json(res, 200, await operator.retryTask(id));
  }

  json(res, 404, { error: "Not found" });
}

function asBusiness(value: unknown): BusinessId {
  if (value === "asset-ave" || value === "dream-blvd") return value;
  throw new Error("business must be asset-ave or dream-blvd");
}

function asString(value: unknown, name: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(`${name} is required`);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

function json(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(value));
}

function html(res: ServerResponse, body: string) {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  res.end(body);
}

function dashboardHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Asset + Dream Command Center</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui;background:#05070b;color:#eef4ff}body{margin:0;background:radial-gradient(circle at 15% 0,#14213a 0,transparent 28%),#05070b}.wrap{max-width:1200px;margin:auto;padding:28px}.top{display:flex;gap:16px;align-items:end;justify-content:space-between;flex-wrap:wrap}.eyebrow{color:#7dd3fc;font-size:12px;letter-spacing:.18em;text-transform:uppercase}.title{font-size:clamp(28px,5vw,56px);font-weight:800;margin:6px 0}.muted{color:#8da1ba}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:22px}.card{background:#0b111b;border:1px solid #1d2a3b;border-radius:18px;padding:16px;box-shadow:0 20px 55px #0007}.metric{font-size:32px;font-weight:800}.agents{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}.agent{display:flex;justify-content:space-between;gap:12px}.pill{padding:5px 9px;border-radius:999px;background:#111c2b;font-size:12px}.busy{color:#fde68a}.idle{color:#86efac}.blocked,.error{color:#fca5a5}.section{margin-top:28px}.task{display:grid;grid-template-columns:minmax(160px,1fr) 100px 110px auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid #182234}.task button,button,select,input,textarea{background:#111827;color:#eef4ff;border:1px solid #2a3b52;border-radius:10px;padding:9px}.task button{cursor:pointer}.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form textarea{grid-column:1/-1;min-height:84px}.form .full{grid-column:1/-1}.toolbar{display:flex;gap:8px;flex-wrap:wrap}@media(max-width:700px){.task{grid-template-columns:1fr}.form{grid-template-columns:1fr}.form textarea,.form .full{grid-column:auto}}</style></head>
<body><main class="wrap"><div class="top"><div><div class="eyebrow">Quantum Shadow Operator</div><h1 class="title">Asset + Dream Command Center</h1><div class="muted">One pane for agents, tasks, approvals, retries and business workload.</div></div><button onclick="refresh()">Refresh</button></div>
<section id="metrics" class="grid"></section><section class="section"><h2>Agent workforce</h2><div id="agents" class="agents"></div></section>
<section class="section"><h2>Create task</h2><form id="taskForm" class="form"><select name="business"><option value="asset-ave">Asset Ave</option><option value="dream-blvd">Dream Blvd</option></select><select name="agentProfile">${roster.map(a=>`<option value="${a.profile}">${a.displayName}</option>`).join("")}</select><input class="full" name="title" placeholder="Task title" required><textarea name="prompt" placeholder="What should the agent do?" required></textarea><label><input type="checkbox" name="external"> Requires external side-effect approval</label><button type="submit">Create task</button></form></section>
<section class="section"><div class="top"><h2>Task queue</h2><select id="businessFilter" onchange="refresh()"><option value="all">All businesses</option><option value="asset-ave">Asset Ave</option><option value="dream-blvd">Dream Blvd</option></select></div><div id="tasks" class="card"></div></section></main>
<script>
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
async function call(path,opts){const r=await fetch(path,opts);const j=await r.json();if(!r.ok)throw new Error(j.error||'Request failed');return j}
async function refresh(){const data=await call('/api/snapshot');const s=data.snapshot;document.getElementById('metrics').innerHTML=[['Total tasks',s.totalTasks],['Asset Ave',s.businesses['asset-ave'].total],['Dream Blvd',s.businesses['dream-blvd'].total],['Blocked',s.businesses['asset-ave'].blocked+s.businesses['dream-blvd'].blocked]].map(x=>'<div class="card"><div class="muted">'+x[0]+'</div><div class="metric">'+x[1]+'</div></div>').join('');document.getElementById('agents').innerHTML=s.agents.map(a=>'<div class="card agent"><div><strong>'+esc(a.displayName)+'</strong><div class="muted">'+esc(a.role||a.profile)+'</div><div class="muted">Q '+a.queued+' · Run '+a.running+' · Done '+a.completed+'</div></div><span class="pill '+a.status+'">'+a.status+'</span></div>').join('');const f=document.getElementById('businessFilter').value;const tasks=data.tasks.filter(t=>f==='all'||t.business===f);document.getElementById('tasks').innerHTML=tasks.length?tasks.map(t=>'<div class="task"><div><strong>'+esc(t.title)+'</strong><div class="muted">'+esc(t.agentProfile)+' · '+esc(t.business)+'</div></div><span class="pill">'+esc(t.status)+'</span><span>Attempts '+t.attempts+'</span><div class="toolbar">'+(!t.approved&&t.approvalRequirement==='external_side_effect'?'<button onclick="act(\''+t.id+'\',\'approve\')">Approve</button>':'')+(t.status==='queued'?'<button onclick="act(\''+t.id+'\',\'run\')">Run</button>':'')+(t.status==='failed'?'<button onclick="act(\''+t.id+'\',\'retry\')">Retry</button>':'')+'</div></div>').join(''):'<div class="muted">No tasks yet.</div>'}
async function act(id,action){try{await call('/api/tasks/'+encodeURIComponent(id)+'/'+action,{method:'POST'});await refresh()}catch(e){alert(e.message);await refresh()}}
document.getElementById('taskForm').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{await call('/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({business:f.get('business'),agentProfile:f.get('agentProfile'),title:f.get('title'),prompt:f.get('prompt'),approvalRequirement:f.get('external')?'external_side_effect':'none'})});e.currentTarget.reset();await refresh()}catch(err){alert(err.message)}});refresh();setInterval(refresh,5000);
</script></body></html>`;
}
