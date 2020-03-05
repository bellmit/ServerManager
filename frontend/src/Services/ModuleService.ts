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
import { Injectable } from "acfrontend";

import { Module, ModuleName, Messages } from "srvmgr-api";

import { WebSocketService } from "./WebSocketService";
import { ApiProperty } from "../API/ApiProperty";

const MSG_MODULES = "/Modules/";
const MSG_MODULES_INSTALL = MSG_MODULES + "Install";

@Injectable
export class ModuleService
{
    constructor(private webSocketService: WebSocketService)
    {
        this._modules = new ApiProperty<Module[]>(Messages.MODULES_LIST);
    }

    //Properties
    public get modules()
    {
        return this._modules;
    }

    //Public methods
    public Install(moduleName: ModuleName)
    {
        this.webSocketService.SendMessage(MSG_MODULES_INSTALL, moduleName);
    }

    public async IsModuleInstalled(moduleName: ModuleName)
    {
        const modules = await this.modules.Get();
        return modules.find( mod => (mod.name == moduleName) && mod.installed ) !== undefined;
    }

    //Private members
    private _modules: ApiProperty<Module[]>;
}