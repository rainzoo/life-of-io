import type { ComponentType } from "react";
import { HeroBioMerge } from "./HeroBioMerge";
import { HeroExt4Alloc } from "./HeroExt4Alloc";
import { HeroFolio } from "./HeroFolio";
import { HeroFtlNand } from "./HeroFtlNand";
import { HeroJournal } from "./HeroJournal";
import { HeroNvme } from "./HeroNvme";
import { HeroReadPath } from "./HeroReadPath";
import { HeroTrapPath } from "./HeroTrapPath";
import type { HeroSceneProps } from "./hero";
import { sceneForSlug } from "./scene-map";
import type { SceneId } from "./scene-map";

const HERO_COMPONENT: Record<SceneId, ComponentType<HeroSceneProps>> = {
	"trap-path": HeroTrapPath,
	"ext4-alloc": HeroExt4Alloc,
	journal: HeroJournal,
	folio: HeroFolio,
	"bio-merge": HeroBioMerge,
	"nvme-queue": HeroNvme,
	"ftl-nand": HeroFtlNand,
	"read-path": HeroReadPath,
	transit: HeroJournal,
};

export function HeroSceneForSlug(props: HeroSceneProps) {
	const C = HERO_COMPONENT[sceneForSlug(props.slug)];
	return <C {...props} />;
}
