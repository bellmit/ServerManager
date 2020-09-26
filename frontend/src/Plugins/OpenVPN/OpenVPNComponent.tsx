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
import { Component, RenderNode, JSX_CreateElement, TabHeader, TabGroup, Tab, Stack, StackChild } from "acfrontend";
import { ListCADirsComponent } from "./ListCADirsComponent";
import { ListConfigsComponent } from "./ListConfigsComponent";

export class OpenVPNComponent extends Component
{
    constructor()
    {
        super();
        this.activeKey = "configs";
    }

    protected Render(): RenderNode
    {
        return <fragment>
            <TabHeader>
                <TabGroup activeKey={this.activeKey} activeKeyChanged={newValue => this.activeKey = newValue}>
                    <Tab key="configs">VPN Servers</Tab>
                    <Tab key="cadirs">Certificate stores</Tab>
                </TabGroup>
            </TabHeader>
            <Stack activeKey={this.activeKey}>
                <StackChild key="configs"><ListConfigsComponent /></StackChild>
                <StackChild key="cadirs"><ListCADirsComponent /></StackChild>
            </Stack>
        </fragment>;
    }

    //Private members
    private activeKey: string;
}