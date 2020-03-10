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
import * as fs from "fs";
import * as path from "path";

import { BackupTask } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ConfigManager } from "./ConfigManager";
import { CommandExecutor } from "./CommandExecutor";
import { ExternalConnectionManager } from "./ExternalConnectionManager";
import { TemporaryFilesService } from "./TemporaryFilesService";

interface BackupConfig
{
    backupTasks: BackupTask[];
}

const CONFIG_KEY = "backup";

@Injectable
export class BackupManager
{
    constructor(private cfgManager: ConfigManager, private commandExecutor: CommandExecutor, private externalConnectionManager: ExternalConnectionManager,
        private tempFilesService: TemporaryFilesService)
    {
    }

    //Properties
    public get tasks()
    {
        return this.Config().backupTasks;
    }

    //Public methods
    public Delete(backupName: string)
    {
        const cfg = this.Config();

        const srcIdx = cfg.backupTasks.findIndex( task => task.name === backupName );
        cfg.backupTasks.Remove(srcIdx);

        this.WriteConfig(cfg);

        this.Schedule();
    }

    public ListBackupFileNames(backupName: string)
    {
        const task = this.tasks.find(t => t.name === backupName);
        if(task === undefined)
            return undefined;
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);

        return connection.ListDirectoryContents(task.path);
    }

    public ReadBackupFile(backupName: string, fileName: string)
    {
        const task = this.tasks.find(t => t.name === backupName);
        if(task === undefined)
            return undefined;
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);

        return connection.ReadFile( path.join(task.path, fileName) );
    }
    
    public async RunBackup(backupName: string)
    {
        const wasRunning = this.StopScheduler();
        await this.IssueBackupJob( this.tasks.find(task => task.name === backupName)!, Date.now() );

        if(wasRunning)
            this.Schedule();
    }

    public SetBackup(originalName: string | undefined, backup: BackupTask)
    {
        const cfg = this.Config();

        //check if target exists
        if( (originalName !== undefined) && (originalName !== backup.name) && (cfg.backupTasks.find( task => task.name === backup.name ) !== undefined) )
            return false;

        //delete old
        if(originalName !== undefined)
        {
            const srcIdx = cfg.backupTasks.findIndex( task => task.name === originalName );
            cfg.backupTasks.Remove(srcIdx);
        }

        //set new
        cfg.backupTasks.push(backup);
        this.WriteConfig(cfg);

        this.Schedule();

        return true;
    }

    public Schedule()
    {
        this.StopScheduler();

        if(this.Config()?.backupTasks.find(task => task.enabled) !== undefined)
        {
            const delay = this.ComputeNextBackupDelay();
            this.timeoutId = setTimeout(this.OnSchedulerInterrupt.bind(this), delay);
        }
    }

    //Private members
    private timeoutId?: NodeJS.Timeout;

    //Private methods
    private ComputeDelay(task: BackupTask)
    {
        let diff = task.nextBackupTime.valueOf() - Date.now().valueOf();
        if(diff < 0)
            diff = 0;
        return diff;
    }

    private ComputeNextBackupDelay()
    {
        let delay = Number.MAX_VALUE;
        for (let index = 0; index < this.Config()!.backupTasks.length; index++)
        {
            const task = this.Config()!.backupTasks[index];
            if(!task.enabled)
                continue;

            const taskDelay = this.ComputeDelay(task);
            delay = taskDelay < delay ? taskDelay : delay;
        }
        return delay;
    }

    private ComputeNextBackupTime(task: BackupTask, thisBackupTime: number)
    {
        const lastBackupTime = task.nextBackupTime.valueOf();
        const nIntervals = Math.ceil((thisBackupTime - lastBackupTime) / 1000 / task.interval);
        task.nextBackupTime = new Date(lastBackupTime + nIntervals * task.interval * 1000);
    }

    private Config(): BackupConfig
    {
        const obj = this.cfgManager.Get<any>(CONFIG_KEY);
        if(obj === undefined)
            return {
                backupTasks: []
            };
            
        obj.backupTasks.forEach( (task: any) => task.nextBackupTime = new Date(task.nextBackupTime));
        return obj;
    }

    private async IssueBackupJob(task: BackupTask, now: number)
    {
        await this.PerformBackup(task, new Date(now));
        this.ComputeNextBackupTime(task, now);

        this.UpdateBackup(task);
    }

    private async PerformBackup(task: BackupTask, backupTime: Date)
    {
        //create directories
        const tmpDir = await this.tempFilesService.CreateTempDirectory();
        const bkpDir = path.join(tmpDir, "data");
        fs.mkdirSync(bkpDir);

        //do all steps in scope
        if("mysql" in task.scope)
        {
            await this.commandExecutor.ExecuteWaitableAsyncCommand("mysqldump -u root --all-databases > " + bkpDir + "/mysql.sql");
        }

        //compress to zip
        const bkpFileName = "bkp" + backupTime.toISOString() + ".zip";
        await this.commandExecutor.ExecuteWaitableAsyncCommand("zip -9 -r " + bkpFileName + " data /etc/ServerManager.json", { workingDirectory: tmpDir });

        //ensure that path exists
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);
        if(!(await connection.Exists(task.path)))
            await connection.CreateDirectoryTree(task.path);

        //pass zip to storage
        await connection.StoreFile(path.join(tmpDir, bkpFileName), path.join(task.path, bkpFileName));

        //cleanup
        this.tempFilesService.CleanUp(tmpDir);
    }

    private UpdateBackup(task: BackupTask)
    {
        this.SetBackup(task.name, task);
    }

    private StopScheduler()
    {
        if(this.timeoutId === undefined)
            return false;
        
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;

        return true;
    }

    private WriteConfig(cfg: BackupConfig)
    {
        this.cfgManager.Set(CONFIG_KEY, cfg);
    }

    //Event handlers
    private OnSchedulerInterrupt()
    {
        const cfg = this.Config();
        const now = Date.now();
        for (let index = 0; index < cfg.backupTasks.length; index++)
        {
            const task = cfg.backupTasks[index];
            if(task.enabled && (now >= task.nextBackupTime.valueOf()))
                this.IssueBackupJob(task, now).then( () => this.Schedule() );
        }
    }
}