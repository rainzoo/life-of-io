#!/usr/bin/env node
/* global URL, console, process */
// Validates content/*.md without bundling the app.
// Usage: npm run content:check
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const contentDir = join(root, "content");
const stepsDir = join(contentDir, "steps");
const VALID_PHASES = ["bash", "creation", "write", "read"];
const VALID_LAYERS = [
	"bash", "syscall-vfs", "ext4", "journal", "page-cache",
	"block", "nvme", "ssd-ftl", "nand", "completion",
];

// Scenario ids come from content/_scenarios.md (first column of each row).
function scenarioIds() {
	const ids = new Set();
	const p = join(contentDir, "_scenarios.md");
	if (!existsSync(p)) return ids;
	for (const line of readFileSync(p, "utf8").split("\n")) {
		const t = line.trim();
		if (!t.startsWith("|")) continue;
		const id = t.split("|").slice(1, -1).map((c) => c.trim())[0] ?? "";
		if (!id || /^id$/i.test(id) || /^:?-+:?$/.test(id)) continue;
		ids.add(id);
	}
	return ids;
}
const SCENARIOS = scenarioIds();

function parseFrontmatter(raw) {
	const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
	if (!match) return { fm: {}, body: raw.trim() };
	const fm = {};
	for (const line of match[1].split("\n")) {
		const t = line.trim();
		if (!t || t.startsWith("#")) continue;
		const i = t.indexOf(":");
		if (i === -1) continue;
		let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
		fm[t.slice(0, i).trim()] = v;
	}
	return { fm, body: (match[2] ?? "").trim() };
}

const errors = [];
if (!existsSync(join(contentDir, "_scenarios.md"))) errors.push("content/_scenarios.md missing");
if (!SCENARIOS.has("write")) errors.push('scenarios must include "write"');
if (!existsSync(stepsDir)) errors.push("content/steps/ missing");
const files = existsSync(stepsDir)
	? readdirSync(stepsDir).filter((f) => f.endsWith(".md")).sort()
	: [];
if (files.length === 0) errors.push("no step files found");

const slugs = new Set();
const labels = new Set();
for (const f of files) {
	const path = join(stepsDir, f);
	const raw = readFileSync(path, "utf8");
	const { fm, body } = parseFrontmatter(raw);
	const expected = basename(f, ".md").replace(/^\d+-/, "");
	for (const k of ["slug", "label", "phase", "title", "layers"]) {
		if (!fm[k]) errors.push(`${f}: missing ${k}`);
	}
	if (fm.slug && fm.slug !== expected)
		errors.push(`${f}: slug "${fm.slug}" mismatches filename (expected "${expected}")`);
	if (fm.phase && !VALID_PHASES.includes(fm.phase))
		errors.push(`${f}: unknown phase "${fm.phase}"`);
	const layerList = (fm.layers ?? "")
		.replace(/^\[/, "").replace(/\]$/, "")
		.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
	for (const l of layerList) {
		if (!VALID_LAYERS.includes(l)) errors.push(`${f}: unknown layer "${l}"`);
	}
	const scenario = fm.scenario ?? "write";
	if (!SCENARIOS.has(scenario)) errors.push(`${f}: unknown scenario "${scenario}"`);
	const latency = Number(fm.latency_ns ?? fm.latencyNs ?? NaN);
	if (!Number.isInteger(latency) || latency <= 0)
		errors.push(`${f}: missing/invalid latency_ns (positive integer nanoseconds)`);
	if (fm.slug) {
		if (slugs.has(fm.slug)) errors.push(`${f}: duplicate slug "${fm.slug}"`);
		slugs.add(fm.slug);
	}
	const lk = `${scenario}:${fm.phase}:${fm.label}`;
	if (labels.has(lk)) errors.push(`${f}: duplicate label "${fm.label}" in scenario "${scenario}"`);
	labels.add(lk);
	if (!body) errors.push(`${f}: empty body`);
	if (!/^## Kernel$/mi.test(body)) errors.push(`${f}: missing "## Kernel" section`);
	if (!/^## Device$/mi.test(body)) errors.push(`${f}: missing "## Device" section`);
	// Copy budgets keep the UI scannable: one idea per field.
	// Descriptions carry required first-use expansions, so they get the most room.
	const BUDGETS = { description: 300, kernel: 140, device: 140, simple: 210 };
	const parts = body.split(/^##\s.*$/m).map((s) => s.trim());
	const sections = { description: parts[0] ?? "", kernel: parts[1] ?? "", device: parts[2] ?? "" };
	for (const [name, limit] of Object.entries({ description: BUDGETS.description, kernel: BUDGETS.kernel, device: BUDGETS.device })) {
		if (sections[name].length > limit)
			errors.push(`${f}: ${name} exceeds ${limit} chars (${sections[name].length})`);
	}
	if (fm.simple) {
		if (fm.simple.length > BUDGETS.simple)
			errors.push(`${f}: simple exceeds ${BUDGETS.simple} chars (${fm.simple.length})`);
		if (/\.\s+[A-Z]/.test(fm.simple))
			errors.push(`${f}: simple must be a single sentence`);
		// Guard against simple restating the body: no 6-word verbatim run
		// (outside code spans) may appear in both.
		const norm = (s) =>
			s.replace(/`[^`]*`/g, " ").toLowerCase().replace(/[^a-z0-9\s]/g, " ")
				.split(/\s+/).filter((w) => w.length > 3);
		const sWords = norm(fm.simple);
		const dWords = ` ${norm(sections.description).join(" ")} `;
		for (let i = 0; i + 6 <= sWords.length; i++) {
			const run = ` ${sWords.slice(i, i + 6).join(" ")} `;
			if (dWords.includes(run)) {
				errors.push(`${f}: simple restates description ("${sWords.slice(i, i + 6).join(" ")}")`);
				break;
			}
		}
	}
}

for (const name of ["_meta.md", "_phases.md", "_layers.md"]) {
	if (!existsSync(join(contentDir, name))) errors.push(`content/${name} missing`);
}

if (errors.length > 0) {
	console.error("content:check failed:");
	for (const e of errors) console.error(`  - ${e}`);
	process.exit(1);
}
console.log(`content:check ok — ${files.length} steps`);
