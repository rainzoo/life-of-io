import {useEffect, useState} from 'react';
import AnimationCanvas from './components/AnimationCanvas';
import ControlPanel from './components/ControlPanel';
import MetadataDisplay from './components/MetadataDisplay';
import {ThemeProvider} from './components/theme-provider';
import {ThemeToggle} from './components/theme-toggle';
import './App.css';

function App() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (isPlaying && currentStep < 7) {
            const timer = setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, 2000 / animationSpeed);
            return () => clearTimeout(timer);
        } else if (currentStep >= 7) {
            setIsPlaying(false);
        }
    }, [currentStep, isPlaying, animationSpeed]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleStepForward = () => {
        setCurrentStep(prev => Math.min(prev + 1, 7));
    };

    const handleStepBackward = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const handleSpeedChange = (speed: number) => {
        setAnimationSpeed(speed);
    };

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="app">
                <header className="app-header">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1>Life of IO</h1>
                            <p>Visualizing how Linux commands works under the hood</p>
                        </div>
                        <ThemeToggle/>
                    </div>
                </header>

                <div className="app-content">
                    <div className="visualization-section">
                        <AnimationCanvas
                            currentStep={currentStep}
                            isPlaying={isPlaying}
                            animationSpeed={animationSpeed}
                            showAdvanced={showAdvanced}
                        />
                    </div>

                    <div className="control-section">
                        <ControlPanel
                            currentStep={currentStep}
                            isPlaying={isPlaying}
                            animationSpeed={animationSpeed}
                            showAdvanced={showAdvanced}
                            onPlayPause={handlePlayPause}
                            onStepForward={handleStepForward}
                            onStepBackward={handleStepBackward}
                            onRestart={handleRestart}
                            onSpeedChange={handleSpeedChange}
                            onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                        />

                        <MetadataDisplay currentStep={currentStep}/>
                    </div>
                </div>

                <footer className="app-footer">
                    <p>Life of IO • Visualization</p>
                </footer>
            </div>
        </ThemeProvider>
    );
}

export default App;
