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
import {Component, RenderNode, Anchor, JSX_CreateElement, RouterComponent, Injectable} from "acfrontend";

import { PluginManager } from "./Services/PluginManager";
import { AuthenticationService } from "./Services/AuthenticationService";
import { Injector } from "acts-util-core";

@Injectable
export class RootComponent extends Component
{
    constructor(private authenticationService: AuthenticationService, private injector: Injector)
    {
        super();

        this.isLoggedIn = this.authenticationService.IsLoggedIn();
        this.authenticationService.loginInfo.Subscribe(newValue => this.isLoggedIn = newValue !== undefined);
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return (
            <fragment>
                {this.RenderNav()}
                <RouterComponent/>
            </fragment>
        );
    }

    //Private members
    private isLoggedIn: boolean;

    //Private methods
    private RenderGlobals()
    {
        const pluginManager = this.injector.Resolve(PluginManager);
        return pluginManager.GetPluginsFor("root").map(plugin => <li><Anchor route={plugin.baseRoute!}>{plugin.title}</Anchor></li>);
    }

    private RenderNav()
    {
        if(!this.isLoggedIn)
            return null;

        return <nav>
            <ul>
                <li><Anchor route="/">Server status</Anchor></li>
                {this.RenderGlobals()}
            </ul>
        </nav>;
    }
}