import React from 'react';
import {FileMetadata} from '../types/animation';
import {finalMetadata, initialMetadata} from '../data/fileMetadata';
import {animationSteps} from '../data/animationSteps';
import './MetadataDisplay.css';

interface MetadataDisplayProps {
    currentStep: number;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({currentStep}) => {
    const calculateCurrentMetadata = (): FileMetadata => {
        if (currentStep === 0) {
            return initialMetadata;
        }

        if (currentStep === animationSteps.length - 1) {
            return finalMetadata;
        }

        // Calculate intermediate metadata based on steps
        const metadata: FileMetadata = {...initialMetadata};

        for (let i = 0; i <= currentStep; i++) {
            const step = animationSteps[i];
            if (step.metadataChanges) {
                step.metadataChanges.forEach(change => {
                    (metadata as any)[change.field] = change.newValue;
                });
            }
        }

        return metadata;
    };

    const currentMetadata = calculateCurrentMetadata();
    const currentStepData = animationSteps[currentStep];

    const metadataFields = [
        {key: 'inodeNumber', label: 'Inode Number'},
        {key: 'permissions', label: 'Permissions'},
        {key: 'owner', label: 'Owner'},
        {key: 'size', label: 'Size (bytes)'},
        {key: 'accessTime', label: 'Access Time'},
        {key: 'modifyTime', label: 'Modify Time'},
        {key: 'changeTime', label: 'Change Time'}
    ];

    return (
        <div className="metadata-display">
            <div className="panel-header">
                <h3>File Metadata</h3>
                <p>Tracking changes during file creation</p>
            </div>

            <div className="metadata-content">
                <div className="metadata-table">
                    {metadataFields.map(field => (
                        <div key={field.key} className="metadata-row">
                            <div className="metadata-label">{field.label}:</div>
                            <div
                                className="metadata-value"
                                style={{
                                    color: currentStepData.metadataChanges?.some(change => change.field === field.key)
                                        ? '#4cc9f0'
                                        : 'inherit'
                                }}
                            >
                                {(currentMetadata as any)[field.key]}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: '#4cc9f0'}}></div>
                        <div className="legend-text">Changed in current step</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetadataDisplay;