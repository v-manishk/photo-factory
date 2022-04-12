import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'upload-manager',
    templateUrl: './upload-manager.component.html',
    styleUrls: ['./upload-manager.component.css']
})
export class UploadManagerComponent implements OnInit {

    isHovering: boolean;
    files$ = new Subject();
    files: File[] = [];

    constructor() { }

    ngOnInit(): void {
    }

    toggleHover(event: boolean) {
        this.isHovering = event;
    }

    onDrop(event: any) {
      let files: FileList | null = event.target.files;
      if(files !== null){
        for (let i = 0; i < files.length; i++) {
          console.log('uploadManager adding file: ', files.item(i));
          let item = files.item(i);
          if(item){
            this.files.push(item);
          }

      }
      this.files = this.files.slice();
      }
    }

}
