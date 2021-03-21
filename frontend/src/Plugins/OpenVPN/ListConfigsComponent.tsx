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
import { Component, Injectable, JSX_CreateElement, MatIcon, PopupManager, ProgressSpinner, RouterButton } from "acfrontend";
import { DownloadClientConfigComponent } from "./DownloadClientConfigComponent";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class ListConfigsComponent extends Component
{
    constructor(private openVPNService: OpenVPNService, private popupManager: PopupManager)
    {
        super();

        this.configs = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.configs === null)
            return <ProgressSpinner />;

        return <fragment>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                {...this.configs.map(this.RenderConfigEntry.bind(this))}
            </table>
        <div class="box">
            <RouterButton route="/openvpn/addconfig"><MatIcon>add</MatIcon> Add VPN server</RouterButton>
        </div>
    </fragment>;
    }

    //Private members
    private configs: string[] | null;

    //Private methods
    private RenderConfigEntry(configName: string)
    {    
        return <tr>
            <td>{configName}</td>
            <td>
                <button type="button" onclick={this.OnDownloadClientConfig.bind(this, configName)}><MatIcon>download</MatIcon></button>
                <button type="button" class="danger" onclick={this.OnDeleteConfig.bind(this, configName)}><MatIcon>delete_forever</MatIcon></button>
            </td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.configs = await this.openVPNService.ListConfigs();
    }

    private async OnDeleteConfig(configName: string)
    {
        if(confirm("Are you sure? This will PERMANENTLY delete the VPN server configuration"))
        {
            this.configs = null;
            await this.openVPNService.DeleteConfig(configName);
            this.configs = await this.openVPNService.ListConfigs();
        }
    }

    private OnDownloadClientConfig(configName: string)
    {
        this.popupManager.OpenDialog(<DownloadClientConfigComponent configName={configName} />, {
            title: "Download client configuration"
        });
    }
}