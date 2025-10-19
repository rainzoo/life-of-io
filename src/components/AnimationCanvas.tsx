
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animationSteps } from '../data/animationSteps';
import { FolderOpen, HardDrive, RefreshCw } from 'lucide-react';
import './AnimationCanvas.css';

interface AnimationCanvasProps {
    currentStep: number;
    isPlaying: boolean;
    animationSpeed: number;
    showAdvanced: boolean;
}

const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
    currentStep,
    isPlaying: _isPlaying,
    animationSpeed: _animationSpeed,
    showAdvanced: _showAdvanced
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // This would be where we initialize GSAP animations
        // For now, we'll rely on Framer Motion
    }, []);

    const renderSystemLayers = () => {
        const layers = [
            { id: 'shell', name: 'Shell', color: '#3498db', position: 10 },
            { id: 'syscall', name: 'System Calls', color: '#e67e22', position: 25 },
            { id: 'vfs', name: 'VFS Layer', color: '#2ecc71', position: 40 },
            { id: 'fs', name: 'File System', color: '#9b59b6', position: 55 },
            { id: 'block', name: 'Block Layer', color: '#f1c40f', position: 70 },
            { id: 'storage', name: 'Physical Storage', color: '#e74c3c', position: 85 }
        ];

        return (
            <div className="system-layers">
                {layers.map((layer, _index) => (
                    <motion.div
                        key={layer.id}
                        className={`layer ${layer.id}`}
                        style={{
                            backgroundColor: layer.color,
                            opacity: currentStep >= _index ? 1 : 0.3,
                            filter: currentStep === _index ? 'brightness(1.2)' : 'brightness(1)'
                        }}
                        animate={{
                            scale: currentStep === _index ? 1.05 : 1,
                            boxShadow: currentStep === _index
                                ? `0 0 20px ${layer.color}`
                                : '0 0 5px rgba(0,0,0,0.3)'
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="layer-name">{layer.name}</div>
                        <div className="layer-content">
                            {renderLayerContent(layer.id, _index)}
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderLayerContent = (layerId: string, _index: number) => {
        switch (layerId) {
            case 'shell':
                return (
                    <div className="shell-content">
                        <div className="terminal-window">
                            <div className="terminal-header">
                                <div className="terminal-buttons">
                                    <div className="terminal-button close"></div>
                                    <div className="terminal-button minimize"></div>
                                    <div className="terminal-button maximize"></div>
                                </div>
                                <div className="terminal-title">bash</div>
                            </div>
                            <div className="terminal-body">
                                <div className="terminal-prompt">$ touch newfile.txt</div>
                                <AnimatePresence>
                                    {currentStep >= 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="process-animation"
                                        >
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                );
            case 'syscall':
                return (
                    <div className="syscall-content">
                        <AnimatePresence>
                            {currentStep >= 1 && (
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    className="syscall-call"
                                >
                                    open("newfile.txt", O_CREAT | O_WRONLY | O_TRUNC, 0666)
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case 'vfs':
                return (
                    <div className="vfs-content">
                        <AnimatePresence>
                            {currentStep >= 2 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="vfs-icon"
                                >
                                    <FolderOpen className="h-8 w-8" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case 'fs':
                return (
                    <div className="fs-content">
                        <AnimatePresence>
                            {currentStep >= 3 && (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    className="fs-structure"
                                >
                                    <div className="fs-element inode">Inode #12345</div>
                                    <div className="fs-element directory">Directory Entry</div>
                                    <div className="fs-element data">Data Block (0 bytes)</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case 'block':
                return (
                    <div className="block-content">
                        <AnimatePresence>
                            {currentStep >= 4 && (
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="block-icon"
                                >
                                    <RefreshCw className="h-8 w-8" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case 'storage':
                return (
                    <div className="storage-content">
                        <AnimatePresence>
                            {currentStep >= 5 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="storage-icon"
                                >
                                    <HardDrive className="h-8 w-8" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {currentStep >= 6 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    className="disk-sector"
                                >
                                    Sector Written
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            default:
                return <div>Layer content</div>;
        }
    };

    const renderDataFlow = () => {
        const activeSteps = animationSteps.slice(0, currentStep + 1);

        return (
            <div className="data-flow">
                {activeSteps.map((step, index) => (
                    <motion.div
                        key={index}
                        className="data-packet"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                        style={{
                            backgroundColor: step.color,
                            position: 'relative',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 10 + index,
                            opacity: 0.95
                        }}
                    >
                        <div
                            className="packet-label"
                            style={{ color: step.color }}
                        >
                            {step.title}
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div ref={canvasRef} className="animation-canvas">
            <div className="canvas-header">
                <h2>File Creation Process Visualization</h2>
                <p>Current step: {animationSteps[currentStep]?.title}</p>
            </div>

            <div className="canvas-main">
                {renderSystemLayers()}
                {renderDataFlow()}
            </div>

            <div className="canvas-footer">
                <p>Hover over layers for details • Click "Show Details" for technical information</p>
            </div>
        </div>
    );
};

export default AnimationCanvas;