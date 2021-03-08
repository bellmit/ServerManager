/**
 * ServerManager
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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

import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority } from "./POSIXAuthority";

@Injectable
export class DistroInfoService
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods    
    public async FetchFields(session: POSIXAuthority)
    {
        const fields = await this.commandExecutor.ExecuteCommand(["cat", "/etc/*release"], session);
        const lines = fields.stdout.split("\n");
        const result: Dictionary<string> = {};

        for (let index = 0; index < lines.length; index++)
        {
            const line = lines[index].trim();
            const split = line.split("=");
            if(split.length === 2)
            {
                let value = split[1].trim();
                if( (value.length >= 2) && (value[0] == '"') && (value[value.length-1] == '"') )
                    value = value.substr(1, value.length - 2);
                result[split[0]] = value;
            }
        }

        return result;
    }

    public async FetchId(session: POSIXAuthority)
    {
        const result = await this.FetchFields(session);
        return result.ID;
    }
}