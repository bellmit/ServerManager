/**
 * ServerManager
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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
import {Component, Injectable, JSX_CreateElement, Anchor, ProgressSpinner} from "acfrontend";
import { ModuleService } from "../../Services/ModuleService";
import { PluginManager } from "../../Services/PluginManager";
import { Dictionary } from "acts-util-core";
import { PluginDefinition } from "../../Model/PluginDefinition";

interface Section
{
    title: string;
    section: string;
}

const sections: Section[] = [
    {
        title: "Core",
        section: "settings/core",
    },
    {
        title: "Network",
        section: "settings/network"
    },
    {
        title: "Security",
        section: "settings/security",
    },
    {
        title: "Other",
        section: "settings/other"
    }
];

@Injectable
export class SettingsComponent extends Component
{
    constructor(private moduleService: ModuleService, private pluginManager: PluginManager)
    {
        super();

        this.data = null;
    }
    
    //Protected methods
    protected Render(): RenderValue
    {
        if(this.moduleService.modules.WaitingForValue() || (this.data === null))
            return <ProgressSpinner />;

        return <fragment>
            <h1>Settings</h1>
            {...this.RenderSections(sections)}
        </fragment>;
    }

    //Private members
    private data: Dictionary<PluginDefinition[]> | null;

    //Private methods
    private RenderButtons(sectionName: string)
    {
        return this.data![sectionName]!.map(plugin => <div>
            {plugin.icon}
            <Anchor route={plugin.baseRoute!}>{plugin.title}</Anchor>
        </div>);
    }

    private RenderSections(sections: Section[])
    {
        const ret = [];
        for (let index = 0; index < sections.length; index++)
        {
            const section = sections[index];
            ret.push(<h2>{section.title}</h2>);
            ret.push(<div class="evenlySpacedRow">
                {this.RenderButtons(section.section)}
            </div>);

            if((index > 0) && (index < sections.length))
            {
                ret.push(<hr />);
            }
        }

        return ret;
    }

    private async UpdateEnabledPlugins()
    {
        this.data = null;

        const data: Dictionary<PluginDefinition[]> = {};
        for (const section of sections)
        {
            data[section.section] = await this.pluginManager.GetPluginsFor(section.section);
        }
        
        this.data = data;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.moduleService.modules.Subscribe( this.UpdateEnabledPlugins.bind(this) );
    }
}