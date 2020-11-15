/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import { Injectable, Component, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { UpdateService } from "./UpdateService";

@Injectable
export class MainComponent extends Component
{
    constructor(private updateService: UpdateService)
    {
        super();

        this.data = "";
    }

    //Protected methods
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>System Update</h1>
            <button type="button" onclick={this.OnCheckForUpdatesClicked.bind(this)}>Check for updates</button>
            <textarea cols="80" readonly rows="24">{this.data}</textarea>
        </fragment>;
    }

    //Private members
    private data: string | null;

    //Event handlers
    private async OnCheckForUpdatesClicked()
    {
        this.data = null;
        this.data = await this.updateService.CheckForUpdates();
    }
}