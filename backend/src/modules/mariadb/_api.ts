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
import { WebSocketAPIEndpoint, ApiRequest } from "../../Api";
import { MySQL } from "srvmgr-api";
import { MariaDBManager } from "./MariaDBManager";

@Injectable
class MySQLApi
{
    constructor(private mariaDBManager: MariaDBManager)
    {
    }

    @WebSocketAPIEndpoint({ route: MySQL.Api.QueryMysqldSettings.message })
    public async QueryMysqldSettings(request: ApiRequest): Promise<MySQL.Api.QueryMysqldSettings.ResultData>
    {
        return this.mariaDBManager.QueryMysqldSettings();
    }

    @WebSocketAPIEndpoint({ route: MySQL.Api.SaveMysqldSettings.message })
    public async SaveMysqldSettings(request: ApiRequest, data: MySQL.Api.SaveMysqldSettings.RequestData)
    {
        await this.mariaDBManager.SetMysqldSettings(data);
    }
}

export default MySQLApi;