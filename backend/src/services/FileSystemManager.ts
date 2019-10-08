import fs from "fs";
import Path from "path";

export class FileSystemManager
{
    //Public methods
    public ReadDirectory(path: string)
    {
        const entries = fs.readdirSync(path);

        const directories = [];
        const files = [];        
        for(var i = 0; i < entries.length; i++)
        {
            const entry = entries[i];
            const stats = fs.statSync(Path.join(path, entry));
            
            if(stats.isDirectory())
            {
                directories.push(entry);
            }
            else
            {
                files.push({ name: entry, size: stats.size });
            }
        }

        return { directories, files };
    }
}