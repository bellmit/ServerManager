import { Component, OnInit } from '@angular/core';
import { FilesystemService } from 'src/services/filesystem.service';

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {

  private path = '/';
  private folders = [];
  private files = [];
  private loading = false;

  constructor(private fsService: FilesystemService) { }

  ngOnInit() {
    this.QueryDir();
  }

  //Private methods
  private async QueryDir()
  {
    this.loading = true;

    const result = await this.fsService.ListDirectoryContents(this.path);
    this.folders = result.directories;
    this.files = result.files;

    this.loading = false;
  }

  //Event handlers
  public chdir(folder: string)
  {
    let newPath = this.path;
    if(!newPath.endsWith('/')) {
      newPath += '/';
    }
    newPath += folder;

    this.path = newPath;
    this.QueryDir();
  }
}
