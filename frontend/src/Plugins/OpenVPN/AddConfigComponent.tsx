/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner, Router, Select } from "acfrontend";
import { OpenVPNApi } from "srvmgr-api";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { ObjectValidator } from "../../ObjectValidator";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class AddConfigComponent extends Component
{
    constructor(private openVPNService: OpenVPNService, private router: Router)
    {
        super();

        this.data = null;
        this.cadirs = null;
        this.loading = false;
        this.selectedCaDir = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.loading || (this.cadirs === null))
            return <ProgressSpinner />;

        if(this.data === null)
        {
            return <fragment>
                Select CA directory:
                <Select onChanged={newValue => this.selectedCaDir = newValue[0]}>
                    {this.cadirs.map(dir => <option selected={this.selectedCaDir === dir}>{dir}</option>)}
                </Select>
                <button type="button" disabled={this.selectedCaDir === null} onclick={this.OnCADirConfirmed.bind(this)}>OK</button>
            </fragment>;
        }

        return <fragment>
            <ObjectEditorComponent object={this.data} onObjectUpdated={this.Update.bind(this)} />
            <button type="button" disabled={!ObjectValidator.Validate(this.data)} onclick={this.OnCreate.bind(this)}>Create</button>
        </fragment>;
    }

    //Private members
    private data: OpenVPNApi.AddConfig.RequestData | null;
    private cadirs: string[] | null;
    private selectedCaDir: string | null;
    private loading: boolean;

    //Event handlers
    private async OnCADirConfirmed()
    {
        this.loading = true;

        this.data = await this.openVPNService.QueryNewConfigTemplate({ caDirName: this.selectedCaDir! });

        this.loading = false;
    }

    private async OnCreate()
    {
        this.loading = true;
        await this.openVPNService.AddConfig(this.data!);
        this.loading = false;
        
        this.router.RouteTo("/openvpn/");
    }

    public async OnInitiated()
    {
        this.cadirs = await this.openVPNService.ListCADirs();
    }
}