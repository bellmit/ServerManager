/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "acts-util-node";
import { MySQL } from "srvmgr-api";
import { MariaDBConfigParser } from "./MariaDBConfigParser";
import { ConfigModel } from "../../core/ConfigModel";
import { ConfigWriter } from "../../core/ConfigWriter";
import { TaskScheduler } from "../../services/TaskScheduler";
import { CommandExecutor } from "../../services/CommandExecutor";
import { PermissionsManager } from "../../services/PermissionsManager";

@Injectable
export class MariaDBManager
{
    constructor(private taskScheduler: TaskScheduler, private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }
    
    //Public methods
    public async QueryMysqldSettings(): Promise<MySQL.MysqldSettings>
    {
        const settings = await this.QuerySettings();

        return settings.mysqld!;
    }

    public async QuerySettings()
    {
        const data = await this.ParseConfig();

        const configModel = new ConfigModel(data);
        return configModel.AsDictionary();
    }

    public ScheduleCheck()
    {
        this.taskScheduler.RepeatWithPattern({
            type: "daily",
            atHour: 3
        }, this.CheckDb.bind(this), "mysqlcheck");
    }

    public async SetMysqldSettings(settings: MySQL.MysqldSettings)
    {
        const cfg = await this.ParseConfig();

        const configModel = new ConfigModel(cfg);
        configModel.SetProperties("mysqld", settings as any);

        const cfgWriter = new ConfigWriter( path => "!includedir " + path, "false", "true" );
        await cfgWriter.Write("/etc/mysql/my.cnf", cfg);
    }

    //Private methods
    private async CheckDb()
    {
        const sudo = this.permissionsManager.root;
        const result = await this.commandExecutor.ExecuteCommand(["mysqlcheck", "--all-databases", "-u", "root"], sudo);

        const lines = result.stdout.split("\n");
        const entries = lines.filter(line => line.trim().length > 0).map(line => {
            const parts = line.split(/[ \t]+/);
            if(parts.length != 2)
                throw new Error(parts.toString());
            return parts;
        });

        const errorneous = entries.filter(parts => parts[1] !== "OK");
        if(errorneous.length > 0)
        {
            console.log(errorneous);
            throw new Error("DATABASE PROBLEM!");
        }
    }

    private async ParseConfig()
    {
        const parser = new MariaDBConfigParser();
        const data = await parser.Parse("/etc/mysql/my.cnf");

        return data;
    }
}