/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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
import "acts-util-core";
import { Dictionary } from "acts-util-core";
import { ConfigEntry, KeyValueEntry, PropertyType } from "./ConfigParser";

export type Section = Dictionary<KeyValueEntry>;

interface SectionInsertPosition
{
    entries: ConfigEntry[];
    before: ConfigEntry | undefined;
}

export class ConfigModel
{
    constructor(entries: ConfigEntry[])
    {
        this.sections = {};
        this.sectionInsertPositions = {};

        this.FindKeyValueEntries(entries);
    }

    //Public methods
    public AsDictionary()
    {
        return this.sections.Entries().ToDictionary(kv => kv.key,
            kv => kv.value!.Values().ToDictionary(kvEntry => kvEntry!.key, kvEntry => kvEntry!.value)
        );
    }

    public SetProperties(sectionName: string, props: Dictionary<PropertyType>)
    {
        for (const key in props)
        {
            if (Object.prototype.hasOwnProperty.call(props, key))
            {
                this.SetProperty(sectionName, key, props[key] as PropertyType);
            }
        }
    }

    public SetProperty(sectionName: string, propertyName: string, value: PropertyType)
    {
        const section = this.sections[sectionName];
        if(section === undefined)
            throw new Error("Section does not exist");

        const entry = section[propertyName];
        if(entry === undefined)
        {
            const insertPos = this.sectionInsertPositions[sectionName]!;
            if(insertPos === undefined)
            {
                console.log("skipping", sectionName, propertyName, value);
                return;
            }

            const newEntry: KeyValueEntry = {
                type: "KeyValue",
                key: propertyName,
                value
            };

            if(insertPos.before === undefined)
                insertPos.entries.push(newEntry);
            else
            {
                const index = insertPos.entries.indexOf(insertPos.before);
                insertPos.entries.splice(index, 0, newEntry);
            }
        }
        else
            entry.value = value;
    }

    //Private members
    private sections: Dictionary<Section>;
    private sectionInsertPositions: Dictionary<SectionInsertPosition>;

    //Private methods
    private EndSection(sectionName: string, before: ConfigEntry | undefined, entries: ConfigEntry[])
    {
        if(sectionName in this.sectionInsertPositions)
            console.log("Duplicate insert pos for ", sectionName);

        if(before !== undefined)
        {
            let index = entries.indexOf(before);
            while( (index > 0) && entries[index-1].type !== "KeyValue")
                index--;

            before = entries[index];
        }

        this.sectionInsertPositions[sectionName] = {
            entries,
            before
        };
    }

    private FindKeyValueEntries(entries: ConfigEntry[])
    {
        let currentSectionName = "";
        for (const entry of entries)
        {
            switch(entry.type)
            {
                case "BeginSection":
                    this.EndSection(currentSectionName, entry, entries);

                    currentSectionName = entry.textValue;
                    this.sections[currentSectionName] = {};
                    break;
                case "IncludeDir":
                    entry.entries.forEach(fileEntries => this.FindKeyValueEntries(fileEntries.entries));
                    break;
                case "KeyValue":
                    const section = this.sections[currentSectionName]!;
                    section[entry.key] = entry;
                    break;
            }
        }
        this.EndSection(currentSectionName, undefined, entries);
    }
}