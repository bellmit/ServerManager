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
import { Anchor, Component, Injectable, JSX_CreateElement, MatIcon, ProgressSpinner, RouterButton } from "acfrontend";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class ListCADirsComponent extends Component
{
    constructor(private openVPNService: OpenVPNService)
    {
        super();

        this.caDirs = null;
    }

    protected Render(): RenderValue
    {
        if(this.caDirs === null)
            return <ProgressSpinner />;

        return <fragment>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                {...this.caDirs.map(this.RenderCADir.bind(this))}
            </table>
            <div class="box">
                <RouterButton route="/openvpn/addcadir"><MatIcon>add</MatIcon> Add certificate authority</RouterButton>
            </div>
        </fragment>;
    }

    //Private members
    private caDirs: string[] | null;

    //Private methods
    private RenderCADir(caDirName: string)
    {    
        return <tr>
            <td>{caDirName}</td>
            <td>
                <Anchor route={"/openvpn/clients/" + caDirName}>List clients</Anchor>
                <button type="button" class="danger" onclick={this.OnDeleteCADir.bind(this, caDirName)}><MatIcon>delete_forever</MatIcon></button>
            </td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.caDirs = await this.openVPNService.ListCADirs();
    }

    private async OnDeleteCADir(caDirName: string)
    {
        if(confirm("Are you sure? This will PERMANENTLY delete the certificate authority and all its derived keys and certificates"))
        {
            this.caDirs = null;
            await this.openVPNService.DeleteCADir(caDirName);
            this.caDirs = await this.openVPNService.ListCADirs();
        }
    }
}