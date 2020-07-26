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
import { SMB } from "srvmgr-api";

export type Section = SMB.GlobalSettings;

export class IniParser
{
    constructor(private input: string | string[], private commentInitiators: string[], private boolMapping: Dictionary<boolean>)
    {
        this.sections = {};
        this.currentSectionName = "";
    }

    //Public methods
    public Parse()
    {
        const lines = typeof this.input === "string" ? this.input.split("\n") : this.input;
        for(const line of lines)
        {
            this.ParseLine(line.trimLeft());
        }

        return this.sections;
    }

    //Private members
    private sections: Dictionary<Section>;
    private currentSectionName: string;

    //Private methods
    private IsCommentLine(line: string)
    {
        for (const commentInitiator of this.commentInitiators)
        {
            if(line.startsWith(commentInitiator))
                return true;
        }
        return false;
    }

    private ParseLine(line: string)
    {
        if(line.length === 0)
            return;
        if(this.IsCommentLine(line))
            return;

        if(line.startsWith("["))
        {
            this.currentSectionName = line.substr(1, line.length - 2);
            this.sections[this.currentSectionName] = {};
            return;
        }

        let value: boolean | number | string | null;

        const parts = line.split("=");
        if(parts.length === 1)
        {
            value = null;
        }
        else if(parts.length != 2)
            throw new Error("Illegal data: " + line);
        else
            value = parts[1].trim();

        const key = parts[0].trimRight();

        const asNum = typeof value === "string" ? parseInt(value) : NaN;
        if( !isNaN(asNum) && (asNum.toString() === value))
            value = asNum;

        for (const k in this.boolMapping)
        {
            if (this.boolMapping.hasOwnProperty(k) && (value === k))
            {
                value = this.boolMapping[k]!;
                break;
            }
        }

        const section = this.sections[this.currentSectionName]!;
        section[key] = value;
    }
}