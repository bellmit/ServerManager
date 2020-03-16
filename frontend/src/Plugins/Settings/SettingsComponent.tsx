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
import {Component, Injectable, RenderNode, JSX_CreateElement, MatIcon, Anchor, ProgressSpinner} from "acfrontend";
import { ModuleService } from "../../Services/ModuleService";
import { PluginManager } from "../../Services/PluginManager";

@Injectable
export class SettingsComponent extends Component
{
    constructor(private moduleService: ModuleService, private pluginManager: PluginManager)
    {
        super();
    }
    
    //Protected methods
    protected Render(): RenderNode
    {
        if(this.moduleService.modules.WaitingForValue())
            return <ProgressSpinner />;

        return <fragment>
            <h1>Settings</h1>

            <h2>Core</h2>
            <div class="evenlySpacedRow">
                {this.RenderButtons("settings/core")}
            </div>
            <hr />
            
            <h2>Network services</h2>
            <div class="evenlySpacedRow">
                {this.RenderButtons("settings/network")}
            </div>
        </fragment>;
    }

    //Private methods
    private RenderButtons(sectionName: string)
    {
        return this.pluginManager.GetPluginsFor(sectionName).map(plugin => <div>{plugin.icon}<Anchor route={plugin.baseRoute!}>{plugin.title}</Anchor></div>);
    }

    //Event handlers
    public OnInitiated()
    {
        this.moduleService.modules.Subscribe( () => this.Update() );
    }
}