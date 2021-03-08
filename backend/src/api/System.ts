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
import * as os from "os";
import { SystemInfo } from "srvmgr-api";
import { ApiEndpoint, ApiRequest } from "../Api";
import { Injectable } from "../Injector";

@Injectable
class API
{
    constructor()
    {
    }

    @ApiEndpoint({ route: SystemInfo.API.QueryHardwareSpecs.message })
    public async QueryHardwareSpecs(request: ApiRequest): Promise<SystemInfo.API.QueryHardwareSpecs.ResultData>
    {
        return {
            memory: os.totalmem(),
        };
    }

    @ApiEndpoint({ route: SystemInfo.API.QueryResourceUsage.message })
    public async QueryResourceUsage(request: ApiRequest): Promise<SystemInfo.API.QueryResourceUsage.ResultData>
    {
        return {
            freeMemory: os.freemem(),
        };
    }
}

export default API;