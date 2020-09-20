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
import { Injectable } from "../Injector";
import { ApiEndpoint, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { Messages, SystemServiceActionData } from "srvmgr-api";
import { SystemServicesManager } from "../services/SystemServicesManager";

@Injectable
class SystemServicesApi
{
    constructor(private connectionManager: ConnectionManager, private systemServicesManager: SystemServicesManager)
    {
    }

    @ApiEndpoint({ route: Messages.SERVICES_ACTION })
    public async ExecuteAction(request: ApiRequest, data: SystemServiceActionData)
    {
        switch(data.action)
        {
            case "disable":
                await this.systemServicesManager.DisableService(data.serviceName, request.session);
                break;
            case "enable":
                await this.systemServicesManager.EnableService(data.serviceName, request.session);
                break;
            case "start":
                await this.systemServicesManager.StartService(data.serviceName, request.session);
                break;
            case "stop":
                await this.systemServicesManager.StopService(data.serviceName, request.session);
                break;
            case "restart":
                await this.systemServicesManager.RestartService(data.serviceName, request.session);
                break;
        }
        this.connectionManager.Respond(request, true);
    }

    @ApiEndpoint({ route: Messages.SERVICES_LIST })
    public async ListServices(request: ApiRequest)
    {
        const result = await this.systemServicesManager.FetchServicesSnapshot(request.session);
        this.connectionManager.Respond(request, result);
    }

    @ApiEndpoint({ route: Messages.SERVICES_STATUS })
    public async QueryServiceStatus(request: ApiRequest, serviceName: string)
    {
        return await this.systemServicesManager.QueryStatus(serviceName, request.session);
    }
}

export default SystemServicesApi;