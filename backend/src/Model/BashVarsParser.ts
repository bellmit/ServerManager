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

import { Dictionary } from "acts-util-core";

export class BashVarsParser
{
    //Public methods
    public Parse(input: string)
    {
        const data: Dictionary<string> = {};

        const lines = input.split("\n");
        for (let line of lines)
        {
            if(line.startsWith("#"))
                continue;
            if(line.length == 0)
                continue;

            const exp = "export ";

            if(line.startsWith(exp))
            {
                line = line.substr(exp.length);
                const parts = line.split("=");
                if(parts.length != 2)
                    throw new Error("Illegal data: " + line + " (" + line.length + ")");

                data[parts[0]] = parts[1].startsWith('"') ? parts[1].substr(1, parts[1].length - 2) : parts[1];
            }
            else if(line.startsWith("echo"))
            {
                //ignore printing message
            }
            else
                throw new Error("Illegal data: " + line + " (" + line.length + ")");
        }

        return data;
    }
}