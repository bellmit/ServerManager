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
import { VMs } from "srvmgr-api";
import { ApiRequest, WebSocketAPIEndpoint } from "../../Api";
import { libvirtManager } from "./libvirtManager";

@Injectable
class _API_
{
    constructor(private libvirtManager: libvirtManager)
    {
    }

    @WebSocketAPIEndpoint({ route: VMs.API.ExecuteAction.message })
    public async ExecuteAction(request: ApiRequest, data: VMs.API.ExecuteAction.RequestData): Promise<VMs.API.ExecuteAction.ResultData>
    {
        await this.libvirtManager.ExecuteAction(data.vmName, data.action, request.session);
        return {};
    }

    @WebSocketAPIEndpoint({ route: VMs.API.QueryVMs.message })
    public async QueryVMs(request: ApiRequest): Promise<VMs.API.QueryVMs.ResultData>
    {
        return this.libvirtManager.ListVMs(request.session);
    }
}

export default _API_;