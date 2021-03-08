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
import { Module } from "srvmgr-api";

import { Injectable, GlobalInjector } from "../Injector";
import { DistroPackageManager } from "../Model/DistroPackageManager";
import { DistroInfoService } from "./DistroInfoService";
import { POSIXAuthority } from "./POSIXAuthority";
import { ModuleInstaller } from "../Model/ModuleInstaller";

@Injectable
export class ModuleManager
{
    constructor(private distroInfoService: DistroInfoService)
    {
        this.distroPackageManager = null;
    }

    //Public methods
    public async FetchModules(session: POSIXAuthority)
    {
        const modules: Array<Module.Module> = [];

        for (let index = 0; index < Module.moduleNames.length; index++)
        {
            const moduleName = Module.moduleNames[index];   
            
            modules.push({
                name: moduleName,
                installed: await this.IsModuleInstalled(moduleName, session)
            });
        }

        return modules;
    }

    public async Install(moduleName: Module.ModuleName, session: POSIXAuthority)
    {
        const distroPackageManager = await this.ResolveDistroPackageManager(session);
        const mod = await this.GetModuleInstaller(moduleName);

        return await distroPackageManager.Install(moduleName, session) && await mod.Install(session);
    }

    public MapModuleName(moduleName: string): Module.ModuleName | null
    {
        if( (Module.moduleNames as string[]).indexOf(moduleName) === -1 )
            return null;
        return moduleName as Module.ModuleName;
    }

    public async Uninstall(moduleName: Module.ModuleName, session: POSIXAuthority)
    {
        const distroPackageManager = await this.ResolveDistroPackageManager(session);
        const mod = await this.GetModuleInstaller(moduleName);

        return await distroPackageManager.Uninstall(moduleName, session) && await mod.Uninstall(session);
    }

    //Private members
    private distroPackageManager: DistroPackageManager | null;

    //Private methods
    private GetModuleInstaller(moduleName: Module.ModuleName)
    {
        return new Promise<ModuleInstaller>( resolve => {
            import("../modules/" + moduleName + "/_installer").then(pkg => resolve(GlobalInjector.Resolve<ModuleInstaller>(pkg.default))).catch(_ => resolve({
                async Install(session: POSIXAuthority)
                {
                    return true;
                },
                async IsModuleInstalled(session: POSIXAuthority)
                {
                    return true;
                },
                async Uninstall(session: POSIXAuthority)
                {
                    return true;
                }
            }))
        });
    }

    private async IsModuleInstalled(moduleName: Module.ModuleName, session: POSIXAuthority): Promise<boolean>
    {
        const distroPackageManager = await this.ResolveDistroPackageManager(session);
        const mod = await this.GetModuleInstaller(moduleName);

        return (await distroPackageManager.IsModuleInstalled(moduleName, session)) && (await mod.IsModuleInstalled(session));
    }

    private async ResolveDistroPackageManager(session: POSIXAuthority): Promise<DistroPackageManager>
    {
        if(this.distroPackageManager === null)
        {
            const id = await this.distroInfoService.FetchId(session);
            const pkg = await import("../distro/" + id + "/PackageManager");

            this.distroPackageManager = GlobalInjector.Resolve<DistroPackageManager>(pkg.default);
        }

        return this.distroPackageManager!;
    }
}