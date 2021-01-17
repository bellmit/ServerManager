/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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

import { ConfigEntry } from "./ConfigParser";

export class ConfigWriter
{
    constructor(private formatIncludeDir: (path: string) => string, private falseMapping: string, private trueMapping: string)
    {
    }

    //Public methods
    public async Write(filePath: string, data: ConfigEntry[])
    {
        for (const entry of data)
        {
            if(entry.type !== "IncludeDir")
                continue;

            for (const subEntry of entry.entries)
            {
                const subPath = path.join(entry.path, subEntry.fileName);
                if(!path.isAbsolute(subPath))
                    throw new Error("NOT IMPLEMENTED");
                await this.Write(subPath, subEntry.entries);
            }
        }

        const text = this.EntriesToString(data);
        await fs.promises.writeFile(filePath, text, "utf-8");
    }

    //Private methods
    private EntriesToString(entries: ConfigEntry[])
    {
        return entries.map(entry => this.EntryToString(entry)).join("\n");
    }
    
    private EntryToString(entry: ConfigEntry)
    {
        switch(entry.type)
        {
            case "BeginSection":
                return "[" + entry.textValue + "]";

            case "IncludeDir":
                return this.formatIncludeDir(entry.path);

            case "KeyValue":
                if(entry.value === null)
                    return entry.key;

                let value = entry.value;
                
                if(value === false)
                    value = this.falseMapping;
                else if(value === true)
                    value = this.trueMapping;

                if(typeof value === "number")
                    value = value.toString();

                return entry.key + " = " + value;

            case "Text":
                return entry.textValue;
        }
    }
}