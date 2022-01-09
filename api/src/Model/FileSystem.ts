/**
 * ServerManager
 * Copyright (C) 2020-2022 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */

import { SUBMSG_LIST, SUBMSG_QUERY, SUBMSG_SET } from "../Messages";

const MSG_FILESYSTEM = "/FileSystem/";

export namespace FileSystemApi
{
    export namespace ChangeMode
    {
        export const message = MSG_FILESYSTEM + "chmod";
        
        export interface RequestData
        {
            path: string;
            mode: number;
            recursive: boolean;
        }

        export interface ResultData
        {
        }
    }

    export namespace ListDirectoryContents
    {
        export const message = MSG_FILESYSTEM + SUBMSG_LIST;

        export interface FileSystemNode
        {
            type: "directory" | "file";
            name: string;
            size: number;
            mode: number;
            uid: number;
            gid: number;
        }

        export type RequestData = string;
        export interface ResultData
        {
            resolvedDirectory: string;
            nodes: FileSystemNode[];
        }
    }

    export namespace QueryFileContent
    {
        export const message = MSG_FILESYSTEM + SUBMSG_QUERY;
        export type RequestData = string;
        export type ResultData = string;
    }

    export namespace SetFileContent
    {
        export const message = MSG_FILESYSTEM + SUBMSG_SET;
        export interface RequestData
        {
            path: string;
            content: string;
        }
    }
}