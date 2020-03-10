/**
 * ServerManager
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import * as fs from "fs";

import { DirectoryEntry } from "srvmgr-api";

import { ExternalConnection } from "./ExternalConnection";

export class WebdavConnection implements ExternalConnection
{
    constructor(private root: string, userName: string, password: string)
    {
    }
    
    //Public methods
    public CreateDirectoryTree(path: string): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public Delete(pathToNode: string): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public async Exists(filePath: string): Promise<boolean>
    {
        throw new Error("Method not implemented.");
    }

    public ListDirectoryContents(dirPath: string): Promise<DirectoryEntry[]>
    {
        throw new Error("Method not implemented.");
    }

    public async ReadFile(filePath: string): Promise<fs.ReadStream>
    {
        throw new Error("Method not implemented.");
    }
    
    public async StoreFile(localFilePath: string, remoteFilePath: string): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}