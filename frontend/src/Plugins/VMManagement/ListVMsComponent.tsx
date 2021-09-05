/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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

import { Component, Injectable, JSX_CreateElement, MatIcon, ProgressSpinner } from "acfrontend";
import { VMs } from "srvmgr-api";
import { VMsService } from "./VMsService";

@Injectable
export class ListVMsComponent extends Component
{
    constructor(private vmsService: VMsService)
    {
        super();

        this.vms = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.vms === null)
            return <ProgressSpinner />;
        return <table>
            <tr>
                <th>Name</th>
            </tr>
            {...this.vms.map(this.RenderVM.bind(this))}
        </table>;
    }

    //Private members
    private vms: VMs.VMInfo[] | null;

    //Private methods
    private RenderControls(vm: VMs.VMInfo)
    {
        switch(vm.state)
        {
            case "running":
                return <a onclick={this.OnVMAction.bind(this, vm.name, "shutdown")}><MatIcon>power_settings_new</MatIcon></a>;
            case "shut off":
                return <a onclick={this.OnVMAction.bind(this, vm.name, "start")}><MatIcon>play_arrow</MatIcon></a>;
        }

        alert(vm.state);
        throw new Error(vm.state);
    }

    private RenderVM(vm: VMs.VMInfo)
    {
        return <tr>
            <td>{vm.name}</td>
            <td>
                {this.RenderControls(vm)}
            </td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.vms = await this.vmsService.QueryVMs();
    }

    private async OnVMAction(vmName: string, action: "start" | "shutdown")
    {
        this.vms = null;

        await this.vmsService.ExecuteAction({
            vmName,
            action
        });

        this.vms = await this.vmsService.QueryVMs();
    }
}