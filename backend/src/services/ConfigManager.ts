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

import "acts-util-core";

import { Injectable } from "../Injector";

const configFilePath = "/etc/ServerManager.json";

@Injectable
export class ConfigManager
{
    constructor()
    {
        this.data = undefined;
    }

    //Public methods
    public Get<T>(key: string): T | undefined
    {
        if(this.data === undefined)
            this.ReadConfig();

        const cfg = this.data[key];
        if(cfg === undefined)
            return undefined;

        return cfg.DeepClone() as T;
    }

    public Set(key: string, data: any)
    {
        if(this.data === undefined)
            this.ReadConfig();
        this.data[key] = data;
        this.Persist();
    }

    //Private members
    private data: any;

    //Private methods
    private Persist()
    {
        const data = JSON.stringify(this.data, null, 2);
        fs.writeFile(configFilePath, data, { encoding: "utf-8", mode: 0o600 }, err => 
        {
            if(err)
                throw err;
        });
    }

    private ReadConfig()
    {
        if(fs.existsSync(configFilePath))
        {
            const data = fs.readFileSync(configFilePath, "utf-8");
            this.data = JSON.parse(data);
        }
        else
        {
            this.data = {};
        }
    }
}