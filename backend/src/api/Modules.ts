/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import { Messages } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiCall } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { ModuleManager } from "../services/ModuleManager";

@Injectable
class ModulesApi
{
    constructor(private connectionManager: ConnectionManager, private moduleManager: ModuleManager)
    {
    }

    //Api Endpoints
    @ApiEndpoint({ route: "Install" })
    public Install(call: ApiCall, moduleName: string)
    {
        const moduleNameMapped = this.moduleManager.MapModuleName(moduleName);
        if(moduleNameMapped != null)
            this.moduleManager.Install(moduleNameMapped);
    }

    @ApiEndpoint({ route: Messages.MODULES_LIST })
    public async ListAllModules(call: ApiCall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, await this.moduleManager.FetchModules());
    }
}

export default ModulesApi;