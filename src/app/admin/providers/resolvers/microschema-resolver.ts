import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { Microschema } from '../../../common/models/microschema.model';
import { BreadcrumbTextFunction } from '../../components/admin-breadcrumbs/admin-breadcrumbs.component';
import { AdminSchemaEffectsService } from '../effects/admin-schema-effects.service';

@Injectable()
export class MicroschemaResolver implements Resolve<Microschema | undefined> {
    constructor(private adminSchemaEffects: AdminSchemaEffectsService) {}

    resolve(route: ActivatedRouteSnapshot): Promise<Microschema> | undefined {
        const uuid = route.paramMap.get('uuid');

        if (uuid === 'new') {
            this.adminSchemaEffects.newMicroschema();
        } else if (uuid) {
            return this.adminSchemaEffects.openMicroschema(uuid).then(schema => {
                if (!schema) {
                    // throw
                    throw new Error(`Could not find a microschema with the uuid "${uuid}"`);
                }
                return schema;
            });
        }
    }
}

export const microschemaBreadcrumbFn: BreadcrumbTextFunction = (route, state, entities) => {
    const microschemaUuid = state.adminSchemas.microschemaDetail;
    if (!microschemaUuid) {
        return 'admin.new_microschema';
    } else {
        return entities.selectMicroschema(microschemaUuid).map(microschema => `${microschema.name}`);
    }
};
