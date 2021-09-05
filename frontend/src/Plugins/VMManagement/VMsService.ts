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
import { VMs } from "srvmgr-api";

@ApiService
export class VMsService
{
    constructor(private webSocketService: WebSocketService)
    {
    }

    //Public methods
    public ExecuteAction(data: VMs.API.ExecuteAction.RequestData)
    {
        return this.webSocketService.SendRequest<VMs.API.ExecuteAction.ResultData>(VMs.API.ExecuteAction.message, data);
    }

    public QueryVMs()
    {
        return this.webSocketService.SendRequest<VMs.API.QueryVMs.ResultData>(VMs.API.QueryVMs.message);
    }
}