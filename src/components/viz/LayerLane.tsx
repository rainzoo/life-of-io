import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Terminal,
  HardDrive,
  Database,
  Zap,
  ArrowRight,
  Cpu,
  MemoryStick,
  CircuitBoard,
  Server,
  ChevronRight,
  Info,
} from "lucide-react";

export type LayerId =
  | "bash"
  | "syscall-vfs"
  | "ext4"
  | "journal"
  | "page-cache"
  | "block"
  | "nvme"
  | "ssd-ftl"
  | "nand"
  | "completion";

export interface LayerDefinition {
  id: LayerId;
  name: string;
  description: string;
  colorClass: string;
  accentClass: string;
}

// Icon mapping for layers
const getLayerIcon = (layerId: LayerId) => {
  switch (layerId) {
    case "bash":
      return Terminal;
    case "syscall-vfs":
      return Cpu;
    case "ext4":
      return Database;
    case "journal":
      return HardDrive;
    case "page-cache":
      return MemoryStick;
    case "block":
      return Server;
    case "nvme":
      return CircuitBoard;
    case "ssd-ftl":
      return Zap;
    case "nand":
      return HardDrive;
    case "completion":
      return ChevronRight;
    default:
      return Info;
  }
};

interface LayerLaneProps {
  layer: LayerDefinition;
  active: boolean;
}

export function LayerLane({ layer, active }: LayerLaneProps) {
  const IconComponent = getLayerIcon(layer.id);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{
              opacity: active ? 1 : 0.8,
              scale: active ? 1.01 : 1
            }}
            whileHover={{ scale: 1.02 }}
            className={[
              "relative flex items-center justify-between rounded-lg border px-3 py-2 text-xs md:text-sm cursor-pointer transition-all duration-300 group",
              active
                ? "bg-slate-800 border-slate-600 shadow-md shadow-slate-900/50"
                : "bg-slate-900/50 border-border/60 hover:bg-slate-800/50 hover:border-border/80",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                  active
                    ? "bg-gradient-to-br from-slate-700 to-slate-600 text-slate-100 shadow-sm"
                    : "bg-slate-800 text-muted-foreground group-hover:bg-slate-700 group-hover:text-slate-200",
                ].join(" ")}
              >
                <IconComponent
                  className={`h-4 w-4 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"
                    }`}
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`font-medium leading-tight truncate ${active
                  ? "text-slate-100"
                  : "text-slate-300 group-hover:text-slate-200"
                  }`}>
                  {layer.name}
                </span>
                <span className="hidden text-[0.7rem] text-muted-foreground md:inline leading-tight">
                  {layer.description}
                </span>
              </div>
            </div>
            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-slate-400"
              >
                <ArrowRight className="h-3 w-3 animate-pulse" />
                <span className="hidden text-[0.65rem] font-mono md:inline">ACTIVE</span>
              </motion.div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium text-sm">{layer.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{layer.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
