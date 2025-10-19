import {FileMetadata} from '../types/animation';

export const initialMetadata: FileMetadata = {
    inodeNumber: 0,
    permissions: "N/A",
    owner: "N/A",
    size: 0,
    accessTime: "Not created yet",
    modifyTime: "Not created yet",
    changeTime: "Not created yet"
};

export const finalMetadata: FileMetadata = {
    inodeNumber: 12345,
    permissions: "rw-rw-r--",
    owner: "user",
    size: 0,
    accessTime: "Current time",
    modifyTime: "Current time",
    changeTime: "Current time"
};