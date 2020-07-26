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

import { Injectable } from "../../Injector";
import { ImportResolver } from "../../Model/ImportResolver";
import { IniParser } from "../../Model/IniParser";
import { MySQL } from "srvmgr-api";
import { IniWriter } from "../../Model/IniWriter";

@Injectable
export class MariaDBManager
{
    //Public methods
    public QueryMysqldSettings(): MySQL.MysqldSettings
    {
        const settings = this.QuerySettings().mysqld!;

        return settings;
    }

    public QuerySettings()
    {
        const importResolver = new ImportResolver(/\!includedir ([a-z./]+)$/);
        const data = importResolver.Resolve("/etc/mysql/my.cnf");

        const iniParser = new IniParser(data, ["#"], {});

        return iniParser.Parse();
    }

    public SetMysqldSettings(settings: MySQL.MysqldSettings)
    {
        const iniWriter = new IniWriter("false", "true");

        const allSettings: any = this.QuerySettings();
        allSettings.mysqld = settings;

        fs.writeFileSync("/etc/mysql/my.cnf", iniWriter.Write(allSettings));
    }
}