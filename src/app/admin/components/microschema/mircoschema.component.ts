import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { Microschema } from '../../../common/models/microschema.model';
import { ApplicationStateService } from '../../../state/providers/application-state.service';
import { ModalService } from 'gentics-ui-core';
import { hashValues } from '../../../common/util/util';
import { MicroschemaEffectsService } from '../../providers/effects/microschema-effects.service';
import { MicroschemaResponse, MicroschemaUpdateRequest } from '../../../common/models/server-models';
import { MarkerData } from '../monaco-editor/monaco-editor.component';

@Component({
    templateUrl: './microschema.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MicroschemaComponent implements OnInit {
    // TODO Disable save button when editor is pristine
    // TODO Show message on save when schema has not changed
    microschema$: Observable<MicroschemaResponse>;
    version$: Observable<string>;

    microschemaJson: string;
    // TODO load json schema from mesh instead of static file
    schema = require('./microschema.schema.json');

    errors: MarkerData[] = [];

    constructor(private state: ApplicationStateService,
                private modal: ModalService,
                private microschemaEffects: MicroschemaEffectsService,
                private route: ActivatedRoute,
                private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        const uuid$ = this.route.paramMap
        .map(map => map.get('uuid'))
        .distinctUntilChanged();

        this.microschema$ = uuid$
            .switchMap(uuid => {
                if (uuid) {
                    return this.state.select(state => state.entities.microschema[uuid]);
                } else {
                    // TODO handle this?
                    throw Error('uuid not set');
                }
            }
        ).filter(Boolean);

        this.version$ = this.microschema$.map(it => it.version);

        uuid$.filter(Boolean).take(1).subscribe(uuid => {
            // TODO handle 404 or other errors
            this.microschemaEffects.loadMicroschema(uuid);
        });

        this.microschema$
        .take(1)
        .subscribe(microschema => {
            const val = JSON.stringify(stripMicroschemaFields(microschema), undefined, 4);
            this.microschemaJson = val;
            this.ref.detectChanges();
        });
    }

    onErrorChange(errors: MarkerData[]) {
        this.errors = errors;
        this.ref.detectChanges();
    }

    save() {
        if (this.errors.length === 0) {
            this.microschema$.take(1).subscribe(microschema => {
                const changedSchema = JSON.parse(this.microschemaJson);
                this.microschemaEffects.updateMicroschema({...microschema, ...changedSchema});
            });
        }
    }
}

const updateFields = ['name', 'description', 'fields'];

function stripMicroschemaFields(microschema: MicroschemaResponse): any {
    return updateFields.reduce((obj, key) => ({...obj, [key]: microschema[key]}), {});
}
