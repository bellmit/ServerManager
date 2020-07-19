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

import { Injectable, Component, RenderNode, ProgressSpinner, JSX_CreateElement, Switch, Anchor, MatIcon } from "acfrontend";
import { ApacheService } from "./ApacheService";
import { Apache } from "srvmgr-api";

@Injectable
export class ListSitesComponent extends Component
{
    constructor(private apacheService: ApacheService)
    {
        super();

        this.data = null;
    }

    protected Render(): RenderNode
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <table>
            <tr>
                <th>Name</th>
                <th>Enabled</th>
                <th>Actions</th>
            </tr>
            {...this.data.map(this.RenderSiteRow.bind(this))}
        </table>;
    }

    //Private members
    private data: Apache.EntityOverviewInfo[] | null;

    //Private methods
    private RenderSiteRow(site: Apache.EntityOverviewInfo)
    {
        return <tr>
            <td>{site.name}</td>
            <td><Switch checked={site.enabled} onChanged={this.OnChangeEnabledStatus.bind(this, site.name, !site.enabled)} /></td>
            <td><Anchor route={"/apache/site/" + site.name}><MatIcon>edit</MatIcon></Anchor></td>
        </tr>;
    }

    //Event handlers
    private async OnChangeEnabledStatus(siteName: string, enableStatus: boolean)
    {
        this.data = null;
        await this.apacheService.ChangeSiteEnabledStatus(siteName, enableStatus);
        this.data = await this.apacheService.QuerySites();
    }

    public async OnInitiated()
    {
        this.data = await this.apacheService.QuerySites();
    }
}