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
import "acts-util-core";

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, ApiRequest } from "../../Api";
import { Apache } from "srvmgr-api";
import { ConnectionManager } from "../../services/ConnectionManager";
import { ApacheManager } from "./ApacheManager";
import { VirtualHost } from "./VirtualHost";

@Injectable
class ApacheApi
{
    constructor(private apacheManager: ApacheManager, private connectionManager: ConnectionManager)
    {
    }

    @WebSocketAPIEndpoint({ route: Apache.Api.EnableDisableModule.message })
    public async ChangeModuleEnabledStatus(request: ApiRequest, data: Apache.Api.EnableDisableModule.RequestData)
    {
        if(data.enabled)
            await this.apacheManager.EnableModule(data.siteName, request.session);
        else
            await this.apacheManager.DisableModule(data.siteName, request.session);
        this.connectionManager.Respond(request, undefined);
    }

    @WebSocketAPIEndpoint({ route: Apache.Api.EnableDisableSite.message })
    public async ChangeSiteEnabledStatus(request: ApiRequest, data: Apache.Api.EnableDisableSite.RequestData)
    {
        if(data.enabled)
            await this.apacheManager.EnableSite(data.siteName, request.session);
        else
            await this.apacheManager.DisableSite(data.siteName, request.session);
        this.connectionManager.Respond(request, undefined);
    }

    @WebSocketAPIEndpoint({ route: Apache.Api.ListModules.message })
    public async ListModules(request: ApiRequest)
    {
        const result = await this.apacheManager.QueryModules(request.session);
        this.connectionManager.Respond(request, result);
    }

    @WebSocketAPIEndpoint({ route: Apache.Api.ListSites.message })
    public async ListSites(request: ApiRequest)
    {
        const result = await this.apacheManager.QuerySites(request.session);
        this.connectionManager.Respond(request, result);
    }

    @WebSocketAPIEndpoint({ route: Apache.Api.QuerySite.message })
    public async QuerySite(request: ApiRequest, data: Apache.Api.QuerySite.RequestData): Promise<Apache.Api.QuerySite.ResultData>
    {
        const vHost = await this.apacheManager.QuerySite(data, request.session);

        const p = vHost.properties.DeepClone();
        const res = p as Apache.Api.QuerySite.ResultData;
        res.addresses = vHost.addresses;
        res.directories = vHost.directories;

        return res;
    }

    @WebSocketAPIEndpoint({ route: Apache.Api.SetSite.message })
    public async SetSite(request: ApiRequest, data: Apache.Api.SetSite.RequestData): Promise<Apache.Api.SetSite.ResultData>
    {
        const vHost = new VirtualHost(data.addresses, data, data.directories);

        await this.apacheManager.SetSite(data.siteName, vHost);
        return true;
    }
}

export default ApacheApi;