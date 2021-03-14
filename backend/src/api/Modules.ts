/**
 * ServerManager
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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
import { Messages, Module } from "srvmgr-api";

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, APICall, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { ModuleManager } from "../services/ModuleManager";
import { POSIXAuthority } from "../services/POSIXAuthority";

@Injectable
class ModulesApi
{
    constructor(private connectionManager: ConnectionManager, private moduleManager: ModuleManager)
    {
    }

    //Api Endpoints
    @WebSocketAPIEndpoint({ route: Module.API.Install.message })
    public async Install(request: ApiRequest, moduleName: string)
    {
        const moduleNameMapped = this.moduleManager.MapModuleName(moduleName);
        if(moduleNameMapped != null)
        {
            await this.moduleManager.Install(moduleNameMapped, request.session);
        }
        this.NotifyAboutChangedModules(request.session);
        this.connectionManager.Respond(request, true);
    }

    @WebSocketAPIEndpoint({ route: Module.API.List.message })
    public async ListAllModules(call: APICall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, await this.moduleManager.FetchModules(call.session));
    }

    @WebSocketAPIEndpoint({ route: Module.API.Uninstall.message })
    public async Uninstall(request: ApiRequest, moduleName: string)
    {
        const moduleNameMapped = this.moduleManager.MapModuleName(moduleName);
        if(moduleNameMapped != null)
        {
            await this.moduleManager.Uninstall(moduleNameMapped, request.session);
        }
        this.NotifyAboutChangedModules(request.session);
        this.connectionManager.Respond(request, true);
    }

    private async NotifyAboutChangedModules(session: POSIXAuthority)
    {
        this.connectionManager.Broadcast(Module.API.List.message, await this.moduleManager.FetchModules(session));
    }
}

export default ModulesApi;