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

import { Component, FormField, Injectable, JSX_CreateElement, ProgressSpinner, Switch } from "acfrontend";
import { Network } from "srvmgr-api";
import { NetworkService } from "./NetworkService";

@Injectable
export class EditSettingsComponent extends Component
{
    constructor(private networkService: NetworkService)
    {
        super();

        this.data = null;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <FormField hint="IP Forwarding">
                <Switch checked={this.data.isIPForwardingEnabled} onChanged={newValue => this.data!.isIPForwardingEnabled = newValue} />
            </FormField>
            <button type="button" onclick={this.OnSave.bind(this)}>Save</button>
        </fragment>;
    }

    //Private members
    private data: Network.API.QuerySettings.ResultData | null;

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.networkService.QuerySettings({});
    }

    private async OnSave()
    {
        const data = this.data!;
        this.data = null;

        await this.networkService.SaveSettings(data);

        this.data = data;
    }
}