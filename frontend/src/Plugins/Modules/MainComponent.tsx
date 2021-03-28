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
import { Injectable, Component, JSX_CreateElement, ProgressSpinner } from "acfrontend";

import { Module } from "srvmgr-api";
import { ModuleDependeny } from "srvmgr-api/dist/Model/Module";

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
    protected Render(): RenderValue
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
                    this.modules.map( (module: Module.Module) => <tr>
                        <td>{module.name}</td>
                        <td>
                            <button type="button" onclick={this.OnInstallModule.bind(this, module)} disabled={module.installed || !this.IsInstalled(module.dependencies)}>Install</button>
                            <button type="button" onclick={this.OnUninstallModule.bind(this, module)} disabled={!module.installed}>Uninstall</button>
                        </td>
                    </tr>)
                }
            </table>
        </fragment>;
    }

    //Private members
    private modules: Module.Module[];
    private installingModule: string | null;

    //Private methods
    private AreInstalled(dependencies: Module.ModuleDependeny[], requirement: "all" | "any"): boolean
    {
        const mapped = dependencies.Values().Map(this.IsInstalled.bind(this));
        if(requirement === "all")
            return mapped.All();
        return mapped.Filter(x => x === true).Any();
    }

    private IsInstalled(moduleDependeny: ModuleDependeny): boolean
    {
        if(typeof(moduleDependeny) === "string")
        {
            const mod = this.modules.find(m => m.name === moduleDependeny);
            if(mod === undefined)
                return false;
            return mod.installed;
        }

        return this.AreInstalled(moduleDependeny.children, moduleDependeny.requirement);
    }

    //Event handlers
    public OnInitiated()
    {
        this.moduleService.modules.Subscribe( (newModules: Module.Module[]) => this.modules = newModules );
    }
    
    private async OnInstallModule(module: Module.Module)
    {
        this.installingModule = module.name;
        await this.moduleService.Install(module.name);
        this.installingModule = null;
    }

    private async OnUninstallModule(module: Module.Module)
    {
        this.installingModule = module.name;
        await this.moduleService.Uninstall(module.name);
        this.installingModule = null;
    }
}