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
import { Component, Injectable, JSX_CreateElement, MatIcon, ProgressSpinner, RenderNode, RouterButton, RouterState } from "acfrontend";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class ListCADirClientsComponent extends Component
{
    constructor(routerState: RouterState, private openVPNService: OpenVPNService)
    {
        super();

        this.caDirName = routerState.routeParams.caDirName!;
        this.clients = null;
    }

    protected Render(): RenderNode
    {
        if(this.clients === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Members of certificate authority {this.caDirName}</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                {...this.clients.map(this.RenderClient.bind(this))}
            </table>
            <div class="box">
                <RouterButton route={"/openvpn/addclient/" + this.caDirName}><MatIcon>add</MatIcon> Add client</RouterButton>
            </div>
        </fragment>;
    }

    //Private members
    private caDirName: string;
    private clients: string[] | null;

    //Private methods
    private RenderClient(clientName: string)
    {
        return <tr>
            <td>{clientName}</td>
            <td> </td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.clients = await this.openVPNService.ListClients(this.caDirName);
    }
}