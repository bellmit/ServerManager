export interface FileInfo
{
    readonly name: string;
    readonly size: Number;
}

export interface DirectoryContents
{
    readonly directories: Array<string>;
    readonly files: Array<FileInfo>;
}