export interface AnimationStep {
    id: number;
    title: string;
    description: string;
    color: string;
    duration: number;
    details: string[];
    codeExample?: string;
    metadataChanges?: MetadataChange[];
}

export interface MetadataChange {
    field: string;
    oldValue: string | number;
    newValue: string | number;
}

export interface FileMetadata {
    inodeNumber: number;
    permissions: string;
    owner: string;
    size: number;
    accessTime: string;
    modifyTime: string;
    changeTime: string;
}