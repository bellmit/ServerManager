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

import { Injectable } from "acfrontend";
import { WebSocketService } from "../../Services/WebSocketService";
import { Apache } from "srvmgr-api";

@Injectable
export class ApacheService
{
    constructor(private websocketService: WebSocketService)
    {
    }

    //Public methods
    public ChangeModuleEnabledStatus(siteName: string, enabled: boolean)
    {
        return this.websocketService.SendRequest(Apache.Api.EnableDisableModule.message, {siteName, enabled});
    }

    public ChangeSiteEnabledStatus(siteName: string, enabled: boolean)
    {
        return this.websocketService.SendRequest(Apache.Api.EnableDisableSite.message, {siteName, enabled});
    }

    public QueryModules()
    {
        return this.websocketService.SendRequest<Apache.EntityOverviewInfo[]>(Apache.Api.ListModules.message);
    }

    public QuerySite(siteName: Apache.Api.QuerySite.RequestData)
    {
        return this.websocketService.SendRequest<Apache.Api.QuerySite.ResultData>(Apache.Api.QuerySite.message, siteName);
    }

    public QuerySites()
    {
        return this.websocketService.SendRequest<Apache.EntityOverviewInfo[]>(Apache.Api.ListSites.message);
    }

    public SetSite(data: Apache.Api.SetSite.RequestData)
    {
        return this.websocketService.SendRequest<Apache.Api.SetSite.ResultData>(Apache.Api.SetSite.message, data);
    }
}