/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import fs from "fs";
import Path from "path";

export class FileSystemManager
{
    //Public methods
    public ReadDirectory(path: string)
    {
        const entries = fs.readdirSync(path);

        const directories = [];
        const files = [];        
        for(var i = 0; i < entries.length; i++)
        {
            const entry = entries[i];
            const stats = fs.statSync(Path.join(path, entry));
            
            if(stats.isDirectory())
            {
                directories.push(entry);
            }
            else
            {
                files.push({ name: entry, size: stats.size });
            }
        }

        return { directories, files };
    }
}