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

import { Injectable, Component, RenderNode, JSX_CreateElement, LineEdit, ProgressSpinner } from "acfrontend";
import { NotificationsService } from "./NotificationsService";

@Injectable
export class EMailSettingsComponent extends Component
{
    constructor(private notificationsService: NotificationsService)
    {
        super();

        this.address = null;
        this.waiting = false;
    }

    protected Render(): RenderNode
    {
        if( (this.address === null) || this.waiting )
            return <ProgressSpinner />;
        
        return <fragment>
            <h1>E-Mail Notifications</h1>

            <form onsubmit={this.OnSave.bind(this)}>
                <LineEdit value={this.address} onChanged={newValue => this.address = newValue} />
                <button type="submit">Save</button>
            </form>
        </fragment>
    }

    //Private members
    private address: string | null;
    private waiting: boolean;

    //Event handlers
    public async OnInitiated()
    {
        this.address = (await this.notificationsService.QuerySettings()).email;
    }

    private async OnSave(event: Event)
    {
        event.preventDefault();

        this.waiting = true;
        await this.notificationsService.SetSettings({ email: this.address! });
        this.waiting = false;
    }
}