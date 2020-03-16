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

@Injectable
export class RootComponent extends Component
{
    constructor(private pluginManager: PluginManager)
    {
        super();
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return (
            <fragment>
                <nav>
                    <ul>{this.RenderGlobals()}</ul>
                </nav>
                <RouterComponent/>
            </fragment>
        );
    }

    //Private methods
    private RenderGlobals()
    {
        return this.pluginManager.GetPluginsFor("root").map(plugin => <li><Anchor route={plugin.baseRoute!}>{plugin.title}</Anchor></li>);
    }
}