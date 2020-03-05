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
import * as path from "path";

import { ExternalConnection } from "./ExternalConnection";

export class FilesystemConnection implements ExternalConnection
{
    constructor(private root: string)
    {
    }

    //Public methods
    public Exists(filePath: string): Promise<boolean>
    {
        const absPath = path.join(this.root, filePath);

        return new Promise<boolean>( resolve => fs.exists(absPath, resolve) );
    }
    
    public async ReadFile(filePath: string): Promise<fs.ReadStream>
    {
        const absPath = path.join(this.root, filePath);

        return fs.createReadStream(absPath);
    }

    public StoreFile(localFilePath: string, remoteFilePath: string): Promise<void>
    {
        const absPath = path.join(this.root, remoteFilePath);

        return new Promise<void>( resolve => {
            fs.readFile(localFilePath, data => {
                fs.writeFile(absPath, data, () => resolve());
            });
        });
    }

}