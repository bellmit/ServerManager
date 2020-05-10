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
import { Injectable, Component, RenderNode, JSX_CreateElement, ProgressSpinner } from "acfrontend";

import { Module } from "srvmgr-api";

import { ModuleService } from "../../Services/ModuleService";

@Injectable
export class MainComponent extends Component
{
    constructor(private moduleService: ModuleService)
    {
        super();

        this.modules = [];
        this.installingModule = null;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.moduleService.modules.WaitingForValue())
            return <ProgressSpinner />;

        if(this.installingModule !== null)
        {
            return <fragment>
                <ProgressSpinner />
                Installing module {this.installingModule}...
            </fragment>;
        }
            
        return <fragment>
            <h1>Module manager</h1>
            <table>
                <tr>
                    <th>Module name</th>
                    <th>Install / Uninstall</th>
                </tr>
                {
                    this.modules.map( (module: Module) => <tr>
                        <td>{module.name}</td>
                        <td>
                            <button type="button" onclick={this.OnInstallModule.bind(this, module)} disabled={module.installed}>Install</button>
                            <button type="button" onclick={this.OnUninstallModule.bind(this, module)} disabled={!module.installed}>Uninstall</button>
                        </td>
                    </tr>)
                }
            </table>
        </fragment>;
    }

    //Private members
    private modules: Module[];
    private installingModule: string | null;

    //Event handlers
    public OnInitiated()
    {
        this.moduleService.modules.Subscribe( (newModules: Module[]) => this.modules = newModules );
    }
    
    private async OnInstallModule(module: Module)
    {
        this.installingModule = module.name;
        await this.moduleService.Install(module.name);
        this.installingModule = null;
    }

    private OnUninstallModule(module: Module)
    {
        throw new Error("Method not implemented.");
    }
}