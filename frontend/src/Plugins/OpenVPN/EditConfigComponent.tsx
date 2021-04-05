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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner, Router, RouterState } from "acfrontend";
import { OpenVPNServerConfig } from "srvmgr-api/dist/Model/OpenVPN";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { ObjectValidator } from "../../ObjectValidator";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class EditConfigComponent extends Component
{
    constructor(routerState: RouterState, private openVPNService: OpenVPNService, private router: Router)
    {
        super();

        this.configName = routerState.routeParams.configName!;
        this.config = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.config === null)
            return <ProgressSpinner />;
            
        return <fragment>
            <ObjectEditorComponent object={this.config} onObjectUpdated={this.Update.bind(this)} />
            <button type="button" disabled={!ObjectValidator.Validate(this.config)} onclick={this.OnSave.bind(this)}>Save</button>
        </fragment>;
    }

    //Private members
    private configName: string;
    private config: OpenVPNServerConfig | null;

    //Event handlers
    public async OnInitiated()
    {
        this.config = await this.openVPNService.QueryConfig({ name: this.configName });
    }

    private async OnSave()
    {
        const data = this.config!;
        this.config = null;
        await this.openVPNService.UpdateConfig({ name: this.configName, config: data });
        this.router.RouteTo("/openvpn");
    }
}