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

import { Injectable, Component, RenderNode, JSX_CreateElement, LineEdit, Router } from "acfrontend";
import { CertificatesService } from "./CertificatesService";

@Injectable
export class AddCertificateComponent extends Component
{
    constructor(private certificatesService: CertificatesService, private router: Router)
    {
        super();

        this.domainName = "";
    }

    protected Render(): RenderNode
    {
        return <fragment>
            <h1>Create new certificate</h1>

            <form onsubmit={this.OnCreateCertificate.bind(this)}>
                Domain name: <LineEdit value={this.domainName} onChanged={newValue => this.domainName = newValue} />
                <button type="submit">Create</button>
            </form>
        </fragment>;
    }

    //Private members
    private domainName: string;

    //Event handlers
    private async OnCreateCertificate(event: Event)
    {
        event.preventDefault();

        await this.certificatesService.CreateCertificate(this.domainName);

        this.router.RouteTo("/certs");
    }
}