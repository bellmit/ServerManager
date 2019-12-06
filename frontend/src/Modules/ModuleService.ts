/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import { Observable } from "acfrontend";
import { ApiService, ApiListener } from "../Api";
import { WebSocketService } from "../WebSocketService";

const MSG_MODULES = "/Modules";

@ApiService
export class ModuleService
{
    constructor(private webSocketService: WebSocketService)
    {
        this._modules = new Observable<Module[]>([]);

        this.webSocketService.SendMessage(MSG_MODULES);
    }

    //Properties
    public get modules()
    {
        return this._modules;
    }

    //Private members
    private _modules: Observable<Module[]>;

    //Api Listeners
    @ApiListener({ route: MSG_MODULES })
    private OnReceivePackageList(modules: Module[])
    {
        this._modules.Set(modules);
    }
}