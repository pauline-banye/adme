import { Component, OnInit, ViewChild, Output, EventEmitter, Inject, Input, ChangeDetectorRef } from '@angular/core';
import { Ketcher } from './ketcher.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingService } from '../loading/loading.service';
import { DEPLOY_URL } from '../utilities/deploy-url';

@Component({
  selector: 'adme-sketcher',
  templateUrl: './sketcher.component.html',
  styleUrls: ['./sketcher.component.scss']
})
export class SketcherComponent implements OnInit {
  ketcherSrc: SafeResourceUrl;
  ketcher: Ketcher;
  @ViewChild('ketcherFrame', { static: true }) ketcherFrame: { nativeElement: HTMLIFrameElement };
  @Output() moleculeInput = new EventEmitter<string>();

  constructor(
    private domSanatizer: DomSanitizer,
    private loadingService: LoadingService,
    private changeRef: ChangeDetectorRef,
    @Inject(DEPLOY_URL) public deployUrl: string
  ) {
    this.ketcherSrc = domSanatizer.bypassSecurityTrustResourceUrl(`${deployUrl}assets/ketcher/ketcher.html`);
  }

  @Input()
  set apiBaseUrl(apiBaseUrl: string) {
    this.ketcherSrc = this.domSanatizer.bypassSecurityTrustResourceUrl(
      `${this.deployUrl}assets/ketcher/ketcher.html?api_path=${apiBaseUrl}`
    );
  }

  ngOnInit(): void {
    // this.loadingService.setLoadingState(true);
    this.ketcherFrame.nativeElement.onload = () => {
      // tslint:disable-next-line:no-string-literal
      this.ketcher = this.ketcherFrame.nativeElement.contentWindow['ketcher'];
      this.ketcher.apiPath = '/api/';
      this.loadingService.setLoadingState(false);
      // @ts-ignore
      this.ketcher.editor.on('change', function() {
        this.changeRef.detectChanges();
      }.bind(this));
    };
  }

  addMolecule(): void {
    const smiles = this.ketcher.getSmiles();
    this.moleculeInput.emit(smiles);
  }

  checkMolecule(): string {
    const smiles = this.ketcher.getSmiles();
    return smiles || "";
  }

}
