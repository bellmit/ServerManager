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
import {Component, Anchor, JSX_CreateElement, RouterComponent, Injectable, MatIcon, ProgressSpinner} from "acfrontend";

import { PluginManager } from "./Services/PluginManager";
import { AuthenticationService } from "./Services/AuthenticationService";
import { Injector } from "acts-util-core";
import { PluginDefinition } from "./Model/PluginDefinition";
import { PowerService } from "./Services/PowerService";

@Injectable
export class RootComponent extends Component
{
    constructor(private authenticationService: AuthenticationService, private injector: Injector)
    {
        super();

        this.isLoggedIn = this.authenticationService.IsLoggedIn();
        this.authenticationService.loginInfo.Subscribe(this.OnLoginInfoChanged.bind(this));
        this.plugins = null;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        if(!this.isLoggedIn)
            return <RouterComponent/>;

        if(this.plugins === null)
            return <ProgressSpinner />;
            
        return (
            <fragment>
                {this.RenderNav()}
                <RouterComponent/>
            </fragment>
        );
    }

    //Private members
    private isLoggedIn: boolean;
    private plugins: PluginDefinition[] | null;

    //Private methods
    private RenderGlobals()
    {
        return this.plugins!.map(plugin => <li><Anchor route={plugin.baseRoute!}>
            {plugin.icon ? plugin.icon : plugin.title}
        </Anchor></li>);
    }

    private RenderNav()
    {
        return <nav>
            <ul>
                <li><Anchor route="/"><MatIcon>dashboard</MatIcon></Anchor></li>
                {this.RenderGlobals()}
            </ul>
            <ul>
                <li><a onclick={this.OnRebootActivated.bind(this)}><MatIcon>autorenew</MatIcon></a></li>
                <li><a onclick={this.OnShutdownActivated.bind(this)}><MatIcon>power_settings_new</MatIcon></a></li>
            </ul>
        </nav>;
    }

    //Event handlers
    private async OnLoginInfoChanged(newValue: any)
    {
        this.isLoggedIn = newValue !== undefined;
        if(this.isLoggedIn)
        {
            const pluginManager = this.injector.Resolve(PluginManager);
            this.plugins = await pluginManager.GetPluginsFor("root");
        }
    }

    private async OnRebootActivated()
    {
        if(confirm("Are you sure that you want to reboot?"))
        {
            const powerService = this.injector.Resolve(PowerService);
            await powerService.Reboot();
            alert("Server will reboot soon");
        }
    }

    private async OnShutdownActivated()
    {
        if(confirm("Are you sure that you want to shutdown?"))
        {
            const powerService = this.injector.Resolve(PowerService);
            await powerService.Shutdown();
            alert("Server will shutdown soon");
        }
    }
}