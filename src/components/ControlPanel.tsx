
import React from 'react';
import { animationSteps } from '../data/animationSteps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkipBack, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import './ControlPanel.css';

interface ControlPanelProps {
    currentStep: number;
    isPlaying: boolean;
    animationSpeed: number;
    showAdvanced: boolean;
    onPlayPause: () => void;
    onStepForward: () => void;
    onStepBackward: () => void;
    onRestart: () => void;
    onSpeedChange: (speed: number) => void;
    onToggleAdvanced: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    currentStep,
    isPlaying,
    animationSpeed,
    showAdvanced,
    onPlayPause,
    onStepForward,
    onStepBackward,
    onRestart,
    onSpeedChange,
    onToggleAdvanced
}) => {
    const currentStepData = animationSteps[currentStep];

    return (
        <Card className="control-panel">
            <CardHeader>
                <CardTitle>Animation Controls</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="panel-controls">
                    <div className="playback-controls">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onStepBackward}
                            disabled={currentStep === 0}
                            title="Previous Step"
                        >
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="default"
                            size="icon"
                            className="play-pause"
                            onClick={onPlayPause}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onStepForward}
                            disabled={currentStep === animationSteps.length - 1}
                            title="Next Step"
                        >
                            <SkipForward className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onRestart}
                            title="Restart Animation"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="speed-controls">
                        <label>Speed:</label>
                        <div className="speed-buttons">
                            <Button
                                variant={animationSpeed === 0.5 ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSpeedChange(0.5)}
                            >
                                0.5x
                            </Button>
                            <Button
                                variant={animationSpeed === 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSpeedChange(1)}
                            >
                                1x
                            </Button>
                            <Button
                                variant={animationSpeed === 2 ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSpeedChange(2)}
                            >
                                2x
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant={showAdvanced ? "default" : "outline"}
                        onClick={onToggleAdvanced}
                        className="w-full"
                    >
                        {showAdvanced ? "Hide Details" : "Show Details"}
                    </Button>
                </div>

                <div className="step-info">
                    <div
                        className="step-indicator"
                        style={{ backgroundColor: currentStepData.color }}
                    >
                        Step {currentStep + 1} of {animationSteps.length}
                    </div>
                    <h4>{currentStepData.title}</h4>
                    <p>{currentStepData.description}</p>
                </div>

                {showAdvanced && (
                    <div className="advanced-info">
                        <h5>Technical Details:</h5>
                        <ul>
                            {currentStepData.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                            ))}
                        </ul>

                        {currentStepData.codeExample && (
                            <div className="code-example">
                                <h5>Code Example:</h5>
                                <pre>{currentStepData.codeExample}</pre>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ControlPanel;