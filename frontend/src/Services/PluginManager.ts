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

import { plugins } from "../plugins";
import { PluginDefinition } from "../Model/PluginDefinition";
import { ModuleService } from "./ModuleService";

@Injectable
export class PluginManager
{
    constructor(private moduleService: ModuleService)
    {
    }

    //Public methods
    public async GetPluginsFor(section: string)
    {
        const enabledPlugins = [];
        for (const plugin of plugins)
        {
            const enabled = await this.IsPluginEnabled(plugin);
            if(!enabled || (plugin.providedIn !== section) )
                continue;
            enabledPlugins.push(plugin);
        }
        return enabledPlugins;
    }

    //Private methods
    private async IsPluginEnabled(plugin: PluginDefinition)
    {
        if(plugin.dependentModules === undefined)
            return true;

        for (const moduleName of plugin.dependentModules)
        {
            const installed = await this.moduleService.IsModuleInstalled(moduleName);
            if(!installed)
                return false;
        }
        return true;
    }
}