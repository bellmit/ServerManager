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
import { Module, moduleNames, ModuleName } from "srvmgr-api";

import { Injectable, Injector } from "../Injector";
import { DistroPackageManager } from "../Model/DistroPackageManager";
import { DistroInfoService } from "./DistroInfoService";

@Injectable
export class ModuleManager
{
    constructor(private distroInfoService: DistroInfoService)
    {
        this.distroPackageManager = null;
    }

    //Public methods
    public async FetchModules()
    {
        const modules: Array<Module> = [];

        for (let index = 0; index < moduleNames.length; index++)
        {
            const moduleName = moduleNames[index];   
            
            modules.push({
                name: moduleName,
                installed: await this.IsModuleInstalled(moduleName)
            });
        }

        return modules;
    }

    public async Install(moduleName: ModuleName)
    {
        const distroPackageManager = await this.ResolveDistroPackageManager();
        return distroPackageManager.Install(moduleName);
    }

    public MapModuleName(moduleName: string): ModuleName | null
    {
        if( (moduleNames as string[]).indexOf(moduleName) === -1 )
            return null;
        return moduleName as ModuleName;
    }

    //Private members
    private distroPackageManager: DistroPackageManager | null;

    //Private methods
    private async IsModuleInstalled(moduleName: ModuleName): Promise<boolean>
    {
        const distroPackageManager = await this.ResolveDistroPackageManager();
        return await distroPackageManager.IsModuleInstalled(moduleName);
    }

    private async ResolveDistroPackageManager(): Promise<DistroPackageManager>
    {
        if(this.distroPackageManager === null)
        {
            const id = await this.distroInfoService.FetchId();
            const pkg = await import("../distro/" + id + "/PackageManager");

            this.distroPackageManager = Injector.Resolve<DistroPackageManager>(pkg.default);
        }

        return this.distroPackageManager!;
    }
}