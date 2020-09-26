/**
 * ServerManager
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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

import { Component, FormField, Injectable, JSX_CreateElement, LineEdit, RenderNode, Router, RouterState } from "acfrontend";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class AddClientComponent extends Component
{
    constructor(routerState: RouterState, private openVPNService: OpenVPNService, private router: Router)
    {
        super();

        this.caDirName = routerState.routeParams.caDirName!;
        this.clientName = "";
    }

    protected Render(): RenderNode
    {
        return <fragment>
            <h1>Add client for certificate authority: {this.caDirName}</h1>
            <FormField hint="Client name">
                <LineEdit value={this.clientName} onChanged={newValue => this.clientName = newValue} />
            </FormField>

            <button disabled={this.clientName.trim().length == 0} type="button" onclick={this.OnCreate.bind(this)}>Create</button>
        </fragment>
    }

    //Private members
    private caDirName: string;
    private clientName: string;

    //Event handlers
    private async OnCreate()
    {
        await this.openVPNService.AddClient({
            caDirName: this.caDirName,
            clientName: this.clientName
        });
        this.router.RouteTo("/openvpn/clients/" + this.caDirName);
    }
}