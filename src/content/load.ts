// Loads Markdown content at build time via Vite `?raw` imports.
// `content/` is the source of truth. Code only validates and sorts.

import type {
	ContentBundle,
	LayerDefinition,
	LayerId,
	PhaseDefinition,
	PhaseId,
	VisualizationStep,
} from "./schema";

const stepModules = import.meta.glob(
	"../../content/steps/*.md",
	{ eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const metaModule = import.meta.glob(
	"../../content/_meta.md",
	{ eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const phasesModule = import.meta.glob(
	"../../content/_phases.md",
	{ eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const layersModule = import.meta.glob(
	"../../content/_layers.md",
	{ eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const VALID_PHASES: PhaseId[] = ["bash", "creation", "write"];
const VALID_LAYERS: LayerId[] = [
	"bash",
	"syscall-vfs",
	"ext4",
	"journal",
	"page-cache",
	"block",
	"nvme",
	"ssd-ftl",
	"nand",
	"completion",
];

interface Frontmatter {
	slug?: string;
	label?: string;
	phase?: string;
	title?: string;
	keyConcept?: string;
	simple?: string;
	layerList?: string[];
	extra: Record<string, string>;
}

function parseFrontmatter(raw: string): {
	frontmatter: Frontmatter;
	body: string;
} {
	const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
	const frontmatter: Frontmatter = { extra: {} };
	if (!match) return { frontmatter, body: raw.trim() };
	const fmBlock = match[1];
	const body = match[2] ?? "";
	for (const line of fmBlock.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const colon = trimmed.indexOf(":");
		if (colon === -1) continue;
		const key = trimmed.slice(0, colon).trim();
		let value = trimmed.slice(colon + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (key === "layers") {
			const inner = value.startsWith("[") ? value.slice(1) : value;
			const clean = inner.endsWith("]") ? inner.slice(0, -1) : inner;
			frontmatter.layerList = clean
				.split(",")
				.map((s) => s.trim().replace(/^["']|["']$/g, ""))
				.filter(Boolean);
		} else if (
			key === "slug" ||
			key === "label" ||
			key === "phase" ||
			key === "title" ||
			key === "keyConcept" ||
			key === "simple"
		) {
			frontmatter[key] = value;
		} else {
			frontmatter.extra[key] = value;
		}
	}
	return { frontmatter, body: body.trim() };
}

function splitSections(body: string): {
	description: string;
	kernel: string;
	device: string;
} {
	const desc: string[] = [];
	const kernel: string[] = [];
	const device: string[] = [];
	let current: "description" | "kernel" | "device" = "description";
	for (const line of body.split("\n")) {
		const heading = line.trim().toLowerCase();
		if (heading === "## kernel") {
			current = "kernel";
			continue;
		}
		if (heading === "## device") {
			current = "device";
			continue;
		}
		if (heading.startsWith("## ")) {
			current = "description";
			continue;
		}
		if (current === "description") desc.push(line);
		else if (current === "kernel") kernel.push(line);
		else device.push(line);
	}
	return {
		description: desc.join("\n").trim(),
		kernel: kernel.join("\n").trim(),
		device: device.join("\n").trim(),
	};
}

function parseMeta(raw: string): ContentBundle["meta"] {
	const { frontmatter, body } = parseFrontmatter(raw);
	return {
		title: frontmatter.extra.title ?? "Life of a Single I/O",
		command: frontmatter.extra.command ?? "",
		filesystem: frontmatter.extra.filesystem ?? "",
		device: frontmatter.extra.device ?? "",
		version: Number(frontmatter.extra.version ?? "1"),
		intro: body,
	};
}

function singleFile(
	modules: Record<string, string>,
	name: string,
): string {
	const entries = Object.entries(modules).sort(([a], [b]) =>
		a.localeCompare(b),
	);
	if (entries.length === 0) {
		throw new Error(`[content] missing ${name}: no file matched`);
	}
	return entries[0][1];
}

function parseTableRows(raw: string): string[][] {
	const rows: string[][] = [];
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("|")) continue;
		const cols = trimmed
			.split("|")
			.slice(1, -1)
			.map((c) => c.trim());
		if (cols.length === 0) continue;
		if (/^id$/i.test(cols[0])) continue;
		if (/^:?-+:?$/.test(cols[0].replace(/\s/g, ""))) continue;
		rows.push(cols);
	}
	return rows;
}

function parsePhases(raw: string): PhaseDefinition[] {
	const phases: PhaseDefinition[] = parseTableRows(raw).map(
		([id, label, blurb]) => ({
			id: id as PhaseId,
			label: label ?? id,
			blurb: blurb ?? "",
		}),
	);
	for (const p of phases) {
		if (!VALID_PHASES.includes(p.id)) {
			throw new Error(`[content] unknown phase id "${p.id}"`);
		}
	}
	return phases;
}

function parseLayers(raw: string): LayerDefinition[] {
	const layers: LayerDefinition[] = parseTableRows(raw).map(
		([id, name, description]) => ({
			id: id as LayerId,
			name: name ?? id,
			description: description ?? "",
		}),
	);
	for (const l of layers) {
		if (!VALID_LAYERS.includes(l.id)) {
			throw new Error(`[content] unknown layer id "${l.id}"`);
		}
	}
	return layers;
}

function parseStep(
	path: string,
	raw: string,
	order: number,
): VisualizationStep {
	const { frontmatter, body } = parseFrontmatter(raw);
	const fileSlug = path.split("/").pop()?.replace(/\.md$/, "") ?? path;
	const expectedSlug = fileSlug.replace(/^\d+-/, "");
	const slug = frontmatter.slug ?? "";
	const label = frontmatter.label ?? "";
	const phase = (frontmatter.phase ?? "") as PhaseId;
	const title = frontmatter.title ?? "";
	const layers = (frontmatter.layerList ?? []) as LayerId[];
	const keyConcept = frontmatter.keyConcept ?? "";
	const simple = frontmatter.simple ?? "";
	const { description, kernel, device } = splitSections(body);
	const errors: string[] = [];
	if (!slug) errors.push("missing slug");
	if (!label) errors.push("missing label");
	if (!title) errors.push("missing title");
	if (!phase) errors.push("missing phase");
	else if (!VALID_PHASES.includes(phase))
		errors.push(`unknown phase "${phase}"`);
	if (layers.length === 0) errors.push("missing layers");
	for (const l of layers) {
		if (!VALID_LAYERS.includes(l)) errors.push(`unknown layer "${l}"`);
	}
	if (slug && slug !== expectedSlug) {
		errors.push(
			`slug "${slug}" mismatches filename "${fileSlug}"`,
		);
	}
	if (errors.length > 0) {
		throw new Error(`[content] ${path}: ${errors.join("; ")}`);
	}
	return {
		slug, label, order, phase, title,
		description, simple, keyConcept, kernel, device, layers,
	};
}

function buildBundle(): ContentBundle {
	const meta = parseMeta(singleFile(metaModule, "_meta.md"));
	const phases = parsePhases(singleFile(phasesModule, "_phases.md"));
	const layers = parseLayers(singleFile(layersModule, "_layers.md"));
	const paths = Object.keys(stepModules).sort();
	const steps = paths.map((p, i) => parseStep(p, stepModules[p], i));
	const slugs = new Set<string>();
	const labels = new Set<string>();
	for (const s of steps) {
		if (slugs.has(s.slug)) {
			throw new Error(`[content] duplicate slug "${s.slug}"`);
		}
		const key = `${s.phase}:${s.label}`;
		if (labels.has(key)) {
			throw new Error(`[content] duplicate label "${s.label}"`);
		}
		slugs.add(s.slug);
		labels.add(key);
		if (!phases.some((p) => p.id === s.phase)) {
			throw new Error(`[content] step "${s.slug}" missing phase`);
		}
		for (const l of s.layers) {
			if (!layers.some((x) => x.id === l)) {
				throw new Error(`[content] step "${s.slug}" missing layer`);
			}
		}
	}
	return { meta, phases, layers, steps };
}

const CONTENT: ContentBundle = buildBundle();
export const META = CONTENT.meta;
export const LAYERS = CONTENT.layers;
export const STEPS = CONTENT.steps;
