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
import { SystemInfo } from "srvmgr-api";
import { SystemInfoService } from "./SystemInfoService";

@Injectable
export class ResourcesLoadComponent extends Component
{
    constructor(private systemInfoService: SystemInfoService)
    {
        super();

        this.hardwareInfo = null;
        this.delay = 3000;
        this.usageData = [];
        this.loading = false;
    }
    
    protected Render(): RenderValue
    {
        if((this.hardwareInfo === null) || (this.usageData.length === 0))
            return <ProgressSpinner />;
        
        return <fragment>
            {this.loading ? <ProgressSpinner /> : null}
            <MatIcon>memory</MatIcon> Memory
            <progress value={this.ComputeMemoryUsage()} max="100" />
            {this.GetLatestUsageData().freeMemory.FormatBinaryPrefixed()} of {this.hardwareInfo.memory.FormatBinaryPrefixed()}
        </fragment>
    }

    //Private members
    private loading: boolean;
    private delay: number;
    private timerId?: number;
    private hardwareInfo: SystemInfo.API.QueryHardwareSpecs.ResultData | null;
    private usageData: SystemInfo.API.QueryResourceUsage.ResultData[];

    //Private methods
    private ComputeMemoryUsage()
    {
        if(this.hardwareInfo === null)
            return "0";

        const usage = this.GetLatestUsageData().freeMemory / this.hardwareInfo.memory;
        return Math.ceil(Math.max(0, Math.min(100, usage * 100))).toString();
    }

    private GetLatestUsageData(): SystemInfo.API.QueryResourceUsage.ResultData
    {
        if(this.usageData.length === 0)
            return {
                freeMemory: 0
            };

        return this.usageData[this.usageData.length-1];
    }

    private async QueryNextUsageData()
    {
        this.timerId = undefined;

        this.loading = true;
        this.usageData.push(await this.systemInfoService.QueryResourceUsage());
        this.loading = false;

        this.timerId = setTimeout(this.QueryNextUsageData.bind(this), this.delay);
    }

    //Event handlers
    public async OnInitiated()
    {
        this.QueryNextUsageData();
        this.hardwareInfo = await this.systemInfoService.QueryHardwareSpecs();
    }

    public OnUnmounted()
    {
        if(this.timerId === undefined)
            clearTimeout(this.timerId);
    }
}