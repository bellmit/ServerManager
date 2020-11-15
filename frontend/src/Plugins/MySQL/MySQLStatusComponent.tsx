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
import { Component, JSX_CreateElement, Injectable, ProgressSpinner, MatIcon } from "acfrontend";

import { MySQLService } from "./MySQLService";

@Injectable
export class MySQLStatusComponent extends Component
{
    constructor(private mySqlService: MySQLService)
    {
        super();

        this.status = null;
    }
    
    //Protected methods
    protected Render(): RenderValue
    {
        if( this.status === null )
            return <ProgressSpinner />;

        return <fragment>
            MySQL Server: {this.RenderStatus()}
        </fragment>;
    }

    //Private members
    private status: string | null;

    //Private methods
    private RenderStatus()
    {
        const regex = /@@warning_count[ \t\r\n]*0[ \t\r\n]*@@error_count[ \t\r\n]*0[ \t\r\n]*/;

        if(this.status!.match(regex))
            return <MatIcon>done</MatIcon>;

        return <MatIcon class="danger">error</MatIcon>;
        return <MatIcon>warning</MatIcon>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.status = await this.mySqlService.ShowStatus();
    }
}