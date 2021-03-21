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

import { Component, DialogRef, Injectable, JSX_CreateElement, LineEdit, ProgressSpinner, Select } from "acfrontend";
import { FileDownloadService } from "../../Services/FileDownloadService";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class DownloadClientConfigComponent extends Component<{ configName: string; }>
{
    constructor(private dialogRef: DialogRef, private openVPNService: OpenVPNService, private fileDownloadService: FileDownloadService)
    {
        super();

        this.clients = null;
        this.clientName = null;
        this.dnsRedirectAddress = "";
    }
    
    protected Render(): RenderValue
    {
        if(this.clients === null)
            return <ProgressSpinner />;

        return <fragment>
            Client:
            <Select onChanged={this.OnClientSelectionChanged.bind(this)}>
                {this.clients.map(client => <option selected={this.clientName === client}>{client}</option>)}
            </Select>
            DNS Redirect to address (leave empty for no redirect):
            <LineEdit value={this.dnsRedirectAddress} onChanged={newValue => this.dnsRedirectAddress = newValue} />
        </fragment>;
    }

    //Private members
    private clients: string[] | null;
    private clientName: string | null;
    private dnsRedirectAddress: string;

    //Event handlers
    private OnClientSelectionChanged(newValue: string[])
    {
        this.clientName = newValue[0];
        this.dialogRef.valid.Set(true);
    }

    private async OnDownloadConfig()
    {
        this.dialogRef.waiting.Set(true);

        const dns = this.dnsRedirectAddress.trim();
        const data = await this.openVPNService.DownloadClientConfig({
            configName: this.input.configName,
            clientName: this.clientName!,
            dnsRedirectAddress: dns.length > 0 ? dns : undefined,
        });
        this.fileDownloadService.DownloadBlobAsFile(new Blob([data.config]), "client.ovpn");

        this.dialogRef.Close();
    }

    public async OnInitiated()
    {
        this.dialogRef.valid.Set(false);
        this.dialogRef.waiting.Set(true);

        const caDirName = await this.openVPNService.QueryCADirOfConfig({ name: this.input.configName });
        this.clients = await this.openVPNService.ListClients(caDirName);

        this.dialogRef.onAccept.Subscribe(this.OnDownloadConfig.bind(this));
        this.dialogRef.waiting.Set(false);
    }
}