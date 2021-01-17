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

import { ConfigParser } from "../../core/ConfigParser";

export class SambaConfigParser extends ConfigParser
{
    constructor()
    {
        super(["#", ";"], { "no": false, "yes": true });
    }
    
    //Protected methods
    protected FileNameMatchesIncludeDir(fileName: string): boolean
    {
        return false;
    }

    protected ParseIncludeDir(line: string): string | undefined
    {
        return undefined;
    }
}