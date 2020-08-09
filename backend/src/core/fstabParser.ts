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

interface FileSystemEntry
{
    fileSystem: string;
    mountPoint: string;
    type: string;
    options: string;
    dump: number;
    pass: number;
}

export class fstabParser
{
    //Public methods
    public Parse()
    {
        const input = fs.readFileSync("/etc/fstab", "utf-8");
        const lines = input.split("\n");

        const entries: FileSystemEntry[] = [];
        for (const line of lines)
        {
            if(line.startsWith("#"))
                continue;

            const parts = line.split(" ").filter(str => str.length > 0);

            entries.push({
                fileSystem: parts[0],
                mountPoint: parts[1],
                type: parts[2],
                options: parts[3],
                dump: parseInt(parts[4]),
                pass: parseInt(parts[5]),
            });
        }

        return entries;
    }
}