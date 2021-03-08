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
import { ApiService } from "../../API/Api";
import { WebSocketService } from "../../Services/WebSocketService";
import { SystemInfo } from "srvmgr-api";

@ApiService
export class SystemInfoService
{
    constructor(private webSocketService: WebSocketService)
    {
    }

    //Public methods
    public QueryHardwareSpecs()
    {
        return this.webSocketService.SendRequest<SystemInfo.API.QueryHardwareSpecs.ResultData>(SystemInfo.API.QueryHardwareSpecs.message);
    }

    public QueryResourceUsage()
    {
        return this.webSocketService.SendRequest<SystemInfo.API.QueryResourceUsage.ResultData>(SystemInfo.API.QueryResourceUsage.message);
    }
}