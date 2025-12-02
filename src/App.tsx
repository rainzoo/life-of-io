import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

const animationSteps = [
  {
    title: "User Program Calls open()",
    description:
      "A user-space program initiates a file creation by calling the open() system call with flags O_CREAT.",
    active: ["user-space"],
  },
  {
    title: "System Call Entry",
    description:
      "The open() call traps into the kernel, transferring control from user space to kernel space. The Virtual File System (VFS) layer receives the request.",
    active: ["user-space", "vfs"],
  },
  {
    title: "VFS Path Traversal",
    description:
      "VFS starts to resolve the file path. It checks its dentry (directory entry) cache for the parent directory.",
    active: ["vfs"],
  },
  {
    title: "Filesystem Driver Lookup",
    description:
      "Assuming a dentry cache miss, VFS passes the request to the underlying filesystem driver (e.g., ext4, XFS) to find the directory on the storage device.",
    active: ["vfs", "filesystem"],
  },
  {
    title: "Block Device Read",
    description:
      "The filesystem driver determines which disk blocks contain the directory data and issues a read request to the block device driver.",
    active: ["filesystem", "block-device"],
  },
  {
    title: "Disk Operation",
    description:
      "The block device driver communicates with the physical disk hardware to read the data blocks for the directory.",
    active: ["block-device", "disk"],
  },
  {
    title: "Data Returned to Filesystem",
    description:
      "The disk returns the requested data blocks, which travel back up through the block device driver to the filesystem driver.",
    active: ["filesystem", "block-device", "disk"],
  },
  {
    title: "Filesystem Creates Inode",
    description:
      "The filesystem driver allocates a new inode for the file, containing metadata like permissions and ownership. It also allocates data blocks if initial data is being written.",
    active: ["filesystem"],
  },
  {
    title: "Filesystem Updates Directory",
    description:
      "The filesystem driver updates the parent directory's data to add a new entry for the created file, linking the file name to its new inode number.",
    active: ["filesystem", "block-device", "disk"],
  },
  {
    title: "VFS Creates File Object",
    description:
      "VFS creates a new dentry in its cache for the new file and a 'struct file' object in memory to represent the open file.",
    active: ["vfs", "filesystem"],
  },
  {
    title: "File Descriptor Returned",
    description:
      "The kernel returns a file descriptor (a small integer) back to the user-space program. The program can now use this descriptor for subsequent I/O operations (write(), read(), close()).",
    active: ["user-space", "vfs"],
  },
];

const SystemComponent = ({ title, active }) => (
  <Card
    className={`transition-all duration-300 ${
      active ? "border-primary shadow-lg" : ""
    }`}
  >
    <CardHeader>
      <CardTitle className="text-center text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-24 flex items-center justify-center" />
  </Card>
);

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 1.5x, 2x

  const maxStep = animationSteps.length - 1;
  const currentAnimation = animationSteps[currentStep];

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, maxStep));
  }, [maxStep]);

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (currentStep === maxStep) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isPlaying && currentStep < maxStep) {
      const interval = 1500 / speed;
      const timer = setTimeout(() => {
        handleNext();
      }, interval);
      return () => clearTimeout(timer);
    } else if (currentStep === maxStep) {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying, speed, handleNext, maxStep]);

  const isComponentActive = (name) => currentAnimation.active.includes(name);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Life of IO</h1>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        <div className="flex-[3] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <SystemComponent title="User Space" active={isComponentActive("user-space")} />
          <SystemComponent title="VFS (Kernel)" active={isComponentActive("vfs")} />
          <SystemComponent title="Filesystem Driver" active={isComponentActive("filesystem")} />
          <SystemComponent title="Block Device Driver" active={isComponentActive("block-device")} />
          <div className="md:col-span-2 flex justify-center">
            <SystemComponent title="Physical Disk" active={isComponentActive("disk")} />
          </div>
        </div>

        <Card className="flex-[2]">
          <CardHeader>
            <CardTitle>Step {currentStep + 1}: {currentAnimation.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{currentAnimation.description}</p>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 border-t">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleRestart}>
            <RotateCcw className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentStep === 0}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button variant="default" size="lg" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentStep === maxStep}>
            <SkipForward className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 w-32">
            <span className="text-sm">Speed</span>
            <Slider
              min={1}
              max={3}
              step={1}
              defaultValue={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
