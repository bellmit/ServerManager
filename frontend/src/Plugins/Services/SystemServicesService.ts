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
import { SystemService, Messages, SystemServiceAction } from "srvmgr-api";

@Injectable
export class SystemServicesService
{
    constructor(private webSocketService: WebSocketService)
    {
    }
    
    //Public methods
    public ExecuteAction(serviceName: string, serviceAction: SystemServiceAction)
    {
        return this.webSocketService.SendRequest(Messages.SERVICES_ACTION, { serviceName, action: serviceAction });
    }

    public ListSystemServices()
    {
        return this.webSocketService.SendRequest<SystemService[]>(Messages.SERVICES_LIST, undefined);
    }

    public QueryServiceStatus(serviceName: string)
    {
        return this.webSocketService.SendRequest<string>(Messages.SERVICES_STATUS, serviceName);
    }
}