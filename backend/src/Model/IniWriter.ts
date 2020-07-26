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

export class IniWriter
{
    constructor(private falseMapping: string, private trueMapping: string)
    {
    }

    //Public methods
    public Write(data: any)
    {
        let res = "";

        for (const key in data)
        {
            if (data.hasOwnProperty(key))
            {
                const value = data[key];

                res += "[" + key + "]\n";
                res += this.WriteMembers(value);
                res += "\n";
            }
        }

        return res;
    }

    //Private methods
    private WriteMembers(data: any)
    {
        let res = "";

        for (const key in data)
        {
            if (data.hasOwnProperty(key))
            {
                let value = data[key];

                if(value === null)
                {
                    res += key + "\n";
                    continue;
                }

                if(value === false)
                    value = this.falseMapping;
                else if(value === true)
                    value = this.trueMapping;

                if(typeof value === "number")
                    value = value.toString();
                
                res += key + " = " + value + "\n";
            }
        }

        return res;
    }

}