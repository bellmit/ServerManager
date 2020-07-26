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

export class ImportResolver
{
    constructor(private includeDirPattern: RegExp)
    {
    }

    //Public methods
    public Resolve(path: string)
    {
        const data = fs.readFileSync(path, "utf-8");
        const lines = data.split("\n");

        let outLines: string[] = [];
        for (const line of lines)
        {
            const match = line.match(this.includeDirPattern);
            if(match !== null)
            {
                const subLines = this.ResolveDir(match[1]);
                outLines = outLines.concat(subLines);
            }
            else
                outLines.push(line);
        }

        return outLines;
    }

    //Private methods
    private ResolveDir(dirPath: string): string[]
    {
        const children = fs.readdirSync(dirPath, "utf-8");
        return children.map( child => this.Resolve(path.join(dirPath, child)) ).reduce( (a, b) => a.concat(b) );
    }
}