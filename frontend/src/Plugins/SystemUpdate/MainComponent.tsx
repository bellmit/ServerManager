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
import { Injectable, Component, JSX_CreateElement, ProgressSpinner, Switch } from "acfrontend";
import { SystemUpdate } from "srvmgr-api";
import { ModuleService } from "../../Services/ModuleService";
import { UpdateService } from "./UpdateService";

@Injectable
export class MainComponent extends Component
{
    constructor(private updateService: UpdateService, private modulesService: ModuleService)
    {
        super();

        this.data = "";
        this.unattendedUpgradeConfig = null;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        if( (this.data === null) || (this.unattendedUpgradeConfig === null) )
            return <ProgressSpinner />;

        return <fragment>
            <h1>System Update</h1>
            <button type="button" onclick={this.OnCheckForUpdatesClicked.bind(this)}>Check for updates</button>
            <textarea cols="80" readonly rows="24">{this.data}</textarea>
            {this.unattendedUpgradeConfig === undefined ? null : this.RenderAutoUpdate()}
        </fragment>;
    }

    //Private members
    private data: string | null;
    private unattendedUpgradeConfig: SystemUpdate.UnattendedUpgradeConfig | null | undefined;

    //Private methods
    private RenderAutoUpdate()
    {
        return <fragment>
            Automatically update: <Switch checked={this.unattendedUpgradeConfig!.unattendedUpgrades} onChanged={this.OnChangeUnattendedUpgradeConfig.bind(this)} />
        </fragment>;
    }

    //Event handlers
    private async OnChangeUnattendedUpgradeConfig(newValue: boolean)
    {
        const cfg = this.unattendedUpgradeConfig!;
        this.unattendedUpgradeConfig = null;
        
        cfg.unattendedUpgrades = newValue;
        cfg.updatePackageLists = newValue;

        await this.updateService.SetUnattendedUpgradeConfig({ config: cfg });

        this.unattendedUpgradeConfig = cfg;
    }

    private async OnCheckForUpdatesClicked()
    {
        this.data = null;
        this.data = await this.updateService.CheckForUpdates();
    }

    public async OnInitiated()
    {
        const haveUnattendedUpgrade = await this.modulesService.IsModuleInstalled("unattended-upgrades");
        if(haveUnattendedUpgrade)
        {
            const result = await this.updateService.QueryUnattendedUpgradeConfig({});
            this.unattendedUpgradeConfig = result.config;
        }
        else
            this.unattendedUpgradeConfig = undefined;
    }
}